/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  ActiveFrameworkTab,
  ComparisonCriterion,
  DecisionAnalysis,
  ProConItem,
  StressTestResult,
  SwotEntry,
} from './types/decision';
import { SAMPLE_DECISIONS, QUICK_TEMPLATES } from './data/sampleDecisions';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { SwotGridView } from './components/SwotGridView';

const STORAGE_KEY = 'tiebreaker_decisions_v1';

export default function App() {
  const [decisions, setDecisions] = useState<DecisionAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to curated sample decisions
    }
    return SAMPLE_DECISIONS;
  });

  const [selectedId, setSelectedId] = useState<string>(() => decisions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<ActiveFrameworkTab>('all');

  // Sidebar search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [dilemmaInput, setDilemmaInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Stress test state
  const [whatIfInput, setWhatIfInput] = useState('');
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressTestError, setStressTestError] = useState<string | null>(null);

  // Export feedback state
  const [copiedBrief, setCopiedBrief] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch {
      // Ignore storage quota errors
    }
  }, [decisions]);

  const activeDecision = useMemo(
    () => decisions.find((d) => d.id === selectedId) || decisions[0] || null,
    [decisions, selectedId]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    decisions.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [decisions]);

  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.prompt.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [decisions, categoryFilter, searchQuery]);

  // Compute live dynamic scores for the active decision
  const liveScoreSummary = useMemo(() => {
    if (!activeDecision) return [];
    const criteria = activeDecision.comparisonTable.criteria;
    const maxMatrix = criteria.reduce((sum, c) => sum + c.weight * 10, 0) || 1;

    return activeDecision.options.map((opt) => {
      const rawMatrix = criteria.reduce((sum, c) => {
        const s = c.scores.find((sc) => sc.optionName === opt.name)?.score ?? 5;
        return sum + s * c.weight;
      }, 0);
      const matrixIndex = Math.round((rawMatrix / maxMatrix) * 100);

      const pcGroup = activeDecision.prosAndCons.find((g) => g.optionName === opt.name);
      const proSum = (pcGroup?.pros || [])
        .filter((p) => !p.disabled)
        .reduce((sum, p) => sum + p.impactWeight, 0);
      const conSum = (pcGroup?.cons || [])
        .filter((c) => !c.disabled)
        .reduce((sum, c) => sum + c.impactWeight, 0);
      const netProsCons = proSum - conSum;

      return {
        optionName: opt.name,
        tagline: opt.tagline,
        recommended: opt.recommended,
        matrixIndex,
        rawMatrix,
        proSum,
        conSum,
        netProsCons,
      };
    });
  }, [activeDecision]);

  const handleAnalyzeDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemmaInput.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: dilemmaInput.trim(),
          context: contextInput.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate decision breakdown.');
      }

      const newDecision: DecisionAnalysis = {
        id: `dec-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        prompt: dilemmaInput.trim(),
        context: contextInput.trim() || undefined,
        title: data.title,
        category: data.category || 'Strategic',
        summary: data.summary,
        options: data.options || [],
        tiebreakerVerdict: data.tiebreakerVerdict,
        prosAndCons: data.prosAndCons || [],
        comparisonTable: data.comparisonTable || { criteria: [] },
        swot: data.swot,
        stressTests: [],
      };

      setDecisions((prev) => [newDecision, ...prev]);
      setSelectedId(newDecision.id);
      setIsComposerOpen(false);
      setDilemmaInput('');
      setContextInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error during analysis.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDecision || !whatIfInput.trim() || isStressTesting) return;

    setIsStressTesting(true);
    setStressTestError(null);

    try {
      const response = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: activeDecision.title,
          summary: activeDecision.summary,
          currentWinner: activeDecision.tiebreakerVerdict.winningOptionName,
          options: activeDecision.options.map((o) => o.name),
          whatIfScenario: whatIfInput.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate What-If scenario.');
      }

      const result: StressTestResult = {
        id: `st-${Date.now()}`,
        scenarioPrompt: whatIfInput.trim(),
        doesVerdictFlip: Boolean(data.doesVerdictFlip),
        newWinningOption: data.newWinningOption,
        impactAnalysis: data.impactAnalysis,
        adjustedCriteriaNote: data.adjustedCriteriaNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setDecisions((prev) =>
        prev.map((d) =>
          d.id === activeDecision.id
            ? { ...d, stressTests: [result, ...(d.stressTests || [])] }
            : d
        )
      );
      setWhatIfInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to run stress test.';
      setStressTestError(msg);
    } finally {
      setIsStressTesting(false);
    }
  };

  // Interactive handlers for Pros & Cons
  const handleToggleProCon = (optionName: string, type: 'pros' | 'cons', itemId: string) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== activeDecision.id) return d;
        return {
          ...d,
          prosAndCons: d.prosAndCons.map((group) => {
            if (group.optionName !== optionName) return group;
            return {
              ...group,
              [type]: group[type].map((item) =>
                item.id === itemId ? { ...item, disabled: !item.disabled } : item
              ),
            };
          }),
        };
      })
    );
  };

  const handleUpdateProConWeight = (
    optionName: string,
    type: 'pros' | 'cons',
    itemId: string,
    delta: number
  ) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== activeDecision.id) return d;
        return {
          ...d,
          prosAndCons: d.prosAndCons.map((group) => {
            if (group.optionName !== optionName) return group;
            return {
              ...group,
              [type]: group[type].map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      impactWeight: Math.min(10, Math.max(1, item.impactWeight + delta)),
                    }
                  : item
              ),
            };
          }),
        };
      })
    );
  };

  const handleAddProConItem = (
    optionName: string,
    type: 'pros' | 'cons',
    item: Omit<ProConItem, 'id'>
  ) => {
    if (!activeDecision) return;
    const newItem: ProConItem = {
      ...item,
      id: `custom-${Date.now()}`,
    };
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== activeDecision.id) return d;
        return {
          ...d,
          prosAndCons: d.prosAndCons.map((group) =>
            group.optionName === optionName
              ? { ...group, [type]: [...group[type], newItem] }
              : group
          ),
        };
      })
    );
  };

  // Interactive handlers for Comparison Matrix
  const handleUpdateCriterionWeight = (criterionId: string, newWeight: number) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== activeDecision.id) return d;
        return {
          ...d,
          comparisonTable: {
            criteria: d.comparisonTable.criteria.map((c) =>
              c.id === criterionId ? { ...c, weight: newWeight } : c
            ),
          },
        };
      })
    );
  };

  const handleUpdateOptionScore = (
    criterionId: string,
    optionName: string,
    newScore: number
  ) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== activeDecision.id) return d;
        return {
          ...d,
          comparisonTable: {
            criteria: d.comparisonTable.criteria.map((c) => {
              if (c.id !== criterionId) return c;
              return {
                ...c,
                scores: c.scores.map((s) =>
                  s.optionName === optionName ? { ...s, score: newScore } : s
                ),
              };
            }),
          },
        };
      })
    );
  };

  const handleAddCriterion = (criterion: ComparisonCriterion) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === activeDecision.id
          ? {
              ...d,
              comparisonTable: {
                criteria: [...d.comparisonTable.criteria, criterion],
              },
            }
          : d
      )
    );
  };

  const handleResetMatrixWeights = () => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === activeDecision.id
          ? {
              ...d,
              comparisonTable: {
                criteria: d.comparisonTable.criteria.map((c) => ({ ...c, weight: 3 })),
              },
            }
          : d
      )
    );
  };

  // Interactive handler for SWOT
  const handleAddSwotEntry = (
    quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    entry: SwotEntry
  ) => {
    if (!activeDecision) return;
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === activeDecision.id
          ? {
              ...d,
              swot: {
                ...d.swot,
                [quadrant]: [...d.swot[quadrant], entry],
              },
            }
          : d
      )
    );
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || '');
      }
      return remaining;
    });
  };

  const handleRestoreSamples = () => {
    setDecisions(SAMPLE_DECISIONS);
    setSelectedId(SAMPLE_DECISIONS[0].id);
  };

  const generateMarkdownReport = (dec: DecisionAnalysis): string => {
    const lines: string[] = [
      `# ${dec.title}`,
      `Category: ${dec.category} · Created: ${dec.createdAt}`,
      '',
      `## Dilemma`,
      dec.prompt,
      dec.context ? `\nContext: ${dec.context}` : '',
      '',
      `## Executive Summary`,
      dec.summary,
      '',
      `## The Tiebreaker Verdict: ${dec.tiebreakerVerdict.winningOptionName}`,
      `- **Decisive Factor:** ${dec.tiebreakerVerdict.decisiveFactor}`,
      `- **Rationale:** ${dec.tiebreakerVerdict.rationale}`,
      `- **Condition to Flip:** ${dec.tiebreakerVerdict.keyConditionToFlip}`,
      `- **Reversibility:** ${dec.tiebreakerVerdict.reversibility}`,
      '',
      `## 01. Pros & Cons Ledger`,
    ];

    dec.prosAndCons.forEach((group) => {
      lines.push(`\n### ${group.optionName}`);
      lines.push(`**Pros:**`);
      group.pros
        .filter((p) => !p.disabled)
        .forEach((p) => {
          lines.push(`- [Weight +${p.impactWeight}/10 · ${p.dimension}] **${p.point}** — ${p.detail}`);
        });
      lines.push(`**Cons:**`);
      group.cons
        .filter((c) => !c.disabled)
        .forEach((c) => {
          lines.push(`- [Severity -${c.impactWeight}/10 · ${c.dimension}] **${c.point}** — ${c.detail}`);
        });
    });

    lines.push('', `## 02. Multi-Criteria Comparison Matrix`);
    dec.comparisonTable.criteria.forEach((c) => {
      const scoreSummary = c.scores.map((s) => `${s.optionName}: ${s.score}/10`).join(' | ');
      lines.push(`- **${c.criterion}** (Weight ${c.weight}x): ${scoreSummary}`);
    });

    lines.push('', `## 03. SWOT Analysis (${dec.swot.focalSubject})`);
    lines.push(`### Strengths`);
    dec.swot.strengths.forEach((s) => lines.push(`- **${s.title}**: ${s.detail} (Action: ${s.actionItem})`));
    lines.push(`### Weaknesses`);
    dec.swot.weaknesses.forEach((w) => lines.push(`- **${w.title}**: ${w.detail} (Action: ${w.actionItem})`));
    lines.push(`### Opportunities`);
    dec.swot.opportunities.forEach((o) => lines.push(`- **${o.title}**: ${o.detail} (Action: ${o.actionItem})`));
    lines.push(`### Threats`);
    dec.swot.threats.forEach((t) => lines.push(`- **${t.title}**: ${t.detail} (Action: ${t.actionItem})`));

    return lines.join('\n');
  };

  const handleCopyMarkdown = async () => {
    if (!activeDecision) return;
    const md = generateMarkdownReport(activeDecision);
    await navigator.clipboard.writeText(md);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!activeDecision) return;
    const md = generateMarkdownReport(activeDecision);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDecision.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (Single text element, one line) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('all');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          The Tiebreaker
        </a>

        {/* Zone 2: 4 Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'all'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            All Frameworks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pros-cons')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'pros-cons'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Pros & Cons
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'comparison'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Comparison Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('swot')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'swot'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            SWOT Analysis
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsComposerOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {isComposerOpen ? 'Close Composer' : 'New Decision'}
          </button>
        </div>
      </header>

      {/* Main SaaS Workspace Layout: Sidebar + Primary Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar Navigation (280px on desktop) */}
        <aside className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-900">Decision Dossiers</h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {decisions.length} Total
              </span>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search decisions..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            {/* Interactive Category Filter Buttons */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Decision List */}
            {filteredDecisions.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500">No matching decisions found.</p>
                {decisions.length === 0 && (
                  <button
                    type="button"
                    onClick={handleRestoreSamples}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-900 underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore Sample Decisions
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-2 max-h-[340px] lg:max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
                {filteredDecisions.map((item) => {
                  const isSelected = activeDecision?.id === item.id;
                  return (
                    <li key={item.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(item.id);
                          setIsComposerOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-semibold leading-snug line-clamp-2 pr-5">
                          {item.title}
                        </p>
                        {/* Zero-Pill Unboxed Metadata */}
                        <div
                          className={`flex items-center gap-1.5 text-[11px] mt-2 ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          <span className="truncate max-w-[120px]">{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums shrink-0">{item.createdAt}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDecision(item.id);
                        }}
                        title="Delete decision"
                        className={`absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          isSelected
                            ? 'text-slate-300 hover:text-white'
                            : 'text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
            <p className="leading-relaxed">
              Every factor weight and comparison score is editable and recalculates your tiebreaker in real time.
            </p>
            <button
              type="button"
              onClick={handleRestoreSamples}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Curated Examples
            </button>
          </div>
        </aside>

        {/* Primary Decision Workspace Viewport */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 space-y-10">
          {/* New Decision AI Composer Panel */}
          {(isComposerOpen || !activeDecision) && (
            <section
              aria-label="New Decision Analyzer"
              className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">AI Decision Decomposition Engine</p>
                  <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                    Frame a New Decision Dilemma
                  </h2>
                </div>
                {activeDecision && (
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 self-start sm:self-auto"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Quick Templates for Instant Exploration */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">
                  Or load a complex decision scenario to test:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => {
                        setDilemmaInput(tpl.prompt);
                        setContextInput(tpl.context);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAnalyzeDecision} className="space-y-4">
                <div>
                  <label
                    htmlFor="dilemma-textarea"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Decision Question or Options Being Weighed
                  </label>
                  <textarea
                    id="dilemma-textarea"
                    rows={3}
                    value={dilemmaInput}
                    onChange={(e) => setDilemmaInput(e.target.value)}
                    placeholder="e.g., Should we expand our product into the European enterprise market this quarter or double down on self-serve mid-market growth in North America?"
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="context-input"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Constraints, Timeline, or Non-Negotiables (Optional)
                  </label>
                  <input
                    id="context-input"
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="e.g., 14 months runway, 12-person team, need $1.5M new ARR within 9 months..."
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                {analysisError && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{analysisError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    Generates weighted Pros & Cons, a Multi-Criteria Comparison Matrix, and a 4-Quadrant SWOT Analysis.
                  </p>
                  <button
                    type="submit"
                    disabled={isAnalyzing || !dilemmaInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isAnalyzing ? 'Decomposing Trade-Offs...' : 'Run Tiebreaker Analysis'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Pending / Loading Skeleton State */}
          {isAnalyzing && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 animate-pulse">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-8 w-3/4 bg-slate-200 rounded" />
              <div className="h-16 w-full bg-slate-100 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-slate-100 rounded-xl" />
                <div className="h-48 bg-slate-100 rounded-xl" />
              </div>
            </div>
          )}

          {/* Empty State if user deleted all decisions */}
          {!isAnalyzing && !activeDecision && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                No Active Decision Selected
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Enter a decision dilemma in the composer above to generate a complete Pros & Cons list, Comparison Table, and SWOT Analysis, or restore the sample decisions.
              </p>
              <button
                type="button"
                onClick={handleRestoreSamples}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Load Curated Sample Decisions
              </button>
            </div>
          )}

          {/* Active Decision Analysis Workspace */}
          {!isAnalyzing && activeDecision && (
            <div className="space-y-12">
              {/* Executive Header & Tiebreaker Verdict Section */}
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Unboxed clean metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{activeDecision.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Analyzed {activeDecision.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {activeDecision.options.length} Options Evaluated
                      </span>
                    </div>

                    {/* Export Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyMarkdown}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        {copiedBrief ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied Markdown
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Brief
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadMarkdown}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .MD
                      </button>
                    </div>
                  </div>

                  <h1
                    className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {activeDecision.title}
                  </h1>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {activeDecision.summary}
                  </p>

                  <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Original Prompt: </span>
                    {activeDecision.prompt}
                    {activeDecision.context && (
                      <span>
                        {' '}
                        <span aria-hidden="true">·</span>{' '}
                        <span className="font-semibold text-slate-700">Constraints: </span>
                        {activeDecision.context}
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Option Scorecards & Recommended Verdict */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left 7 Cols: Tiebreaker Verdict Synthesis */}
                  <div className="lg:col-span-7 p-6 lg:p-8 space-y-5">
                    <div>
                      <p className="text-xs font-medium text-emerald-700">
                        Recommended Path · {activeDecision.tiebreakerVerdict.reversibility}
                      </p>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        {activeDecision.tiebreakerVerdict.winningOptionName}
                      </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-slate-900">Decisive Tiebreaker: </span>
                        <span className="text-slate-700">
                          {activeDecision.tiebreakerVerdict.decisiveFactor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activeDecision.tiebreakerVerdict.rationale}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <p className="font-semibold text-slate-900">
                        Threshold That Would Flip This Verdict:
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {activeDecision.tiebreakerVerdict.keyConditionToFlip}
                      </p>
                    </div>
                  </div>

                  {/* Right 5 Cols: Real-Time Option Score Comparison */}
                  <div className="lg:col-span-5 p-6 lg:p-8 bg-slate-50/50 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Live Multi-Framework Scoreboard
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          Updates as you edit weights
                        </span>
                      </div>

                      <div className="space-y-3">
                        {liveScoreSummary.map((opt) => (
                          <div
                            key={opt.optionName}
                            className="p-4 bg-white border border-slate-200 rounded-lg space-y-2.5"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {opt.optionName}
                              </span>
                              <span className="text-sm font-mono tabular-nums font-bold text-slate-900 shrink-0">
                                {opt.matrixIndex}/100 Matrix
                              </span>
                            </div>

                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-900 transition-all duration-150"
                                style={{ width: `${opt.matrixIndex}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                              <span>
                                Pros/Cons Net:{' '}
                                <strong
                                  className={
                                    opt.netProsCons >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                  }
                                >
                                  {opt.netProsCons >= 0 ? `+${opt.netProsCons}` : opt.netProsCons} pts
                                </strong>
                              </span>
                              <span>
                                (+{opt.proSum} / -{opt.conSum})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Framework Switcher Pills */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Focus View:
                      </span>
                      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                        {(
                          [
                            { id: 'all', label: 'All (3)' },
                            { id: 'pros-cons', label: 'Pros & Cons' },
                            { id: 'comparison', label: 'Matrix' },
                            { id: 'swot', label: 'SWOT' },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                              activeTab === t.id
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive "What-If" Scenario Stress Tester */}
                <div className="px-6 lg:px-8 py-5 bg-slate-50 border-t border-slate-200 space-y-4">
                  <form
                    onSubmit={handleRunStressTest}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <label
                      htmlFor="what-if-input"
                      className="text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0"
                    >
                      Stress-Test a "What-If" Constraint:
                    </label>
                    <input
                      id="what-if-input"
                      type="text"
                      value={whatIfInput}
                      onChange={(e) => setWhatIfInput(e.target.value)}
                      placeholder="e.g., What if the timeline is cut to 3 weeks? What if they increase equity to 2.0%?"
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={isStressTesting || !whatIfInput.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      {isStressTesting ? 'Testing Scenario...' : 'Test Constraint'}
                    </button>
                  </form>

                  {stressTestError && (
                    <p className="text-xs text-rose-600">{stressTestError}</p>
                  )}

                  {activeDecision.stressTests && activeDecision.stressTests.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      {activeDecision.stressTests.map((st) => (
                        <div
                          key={st.id}
                          className="p-4 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              Scenario: "{st.scenarioPrompt}"
                            </span>
                            <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums">
                              <span
                                className={
                                  st.doesVerdictFlip
                                    ? 'text-amber-700 font-semibold'
                                    : 'text-emerald-700 font-semibold'
                                }
                              >
                                {st.doesVerdictFlip
                                  ? `Verdict Flips → ${st.newWinningOption}`
                                  : `Verdict Holds → ${st.newWinningOption}`}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{st.timestamp}</span>
                            </div>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{st.impactAnalysis}</p>
                          <p className="text-slate-800">
                            <span className="font-semibold">Tactical Adjustment: </span>
                            {st.adjustedCriteriaNote}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* 01. PROS & CONS LIST */}
              {(activeTab === 'all' || activeTab === 'pros-cons') && (
                <ProsConsView
                  prosAndCons={activeDecision.prosAndCons}
                  onToggleItem={handleToggleProCon}
                  onUpdateWeight={handleUpdateProConWeight}
                  onAddItem={handleAddProConItem}
                />
              )}

              {/* 02. COMPARISON TABLE */}
              {(activeTab === 'all' || activeTab === 'comparison') && (
                <ComparisonMatrixView
                  options={activeDecision.options}
                  criteria={activeDecision.comparisonTable.criteria}
                  onUpdateCriterionWeight={handleUpdateCriterionWeight}
                  onUpdateOptionScore={handleUpdateOptionScore}
                  onAddCriterion={handleAddCriterion}
                  onResetWeights={handleResetMatrixWeights}
                />
              )}

              {/* 03. SWOT ANALYSIS */}
              {(activeTab === 'all' || activeTab === 'swot') && (
                <SwotGridView
                  swot={activeDecision.swot}
                  onAddSwotEntry={handleAddSwotEntry}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

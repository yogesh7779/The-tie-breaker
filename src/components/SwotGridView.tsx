import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SwotAnalysis, SwotEntry } from '../types/decision';

interface SwotGridViewProps {
  swot: SwotAnalysis;
  onAddSwotEntry: (
    quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    entry: SwotEntry
  ) => void;
}

type QuadrantKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

const QUADRANT_META: Array<{
  key: QuadrantKey;
  title: string;
  originLabel: string;
  valenceLabel: string;
  actionPrefix: string;
  headerTextClass: string;
}> = [
  {
    key: 'strengths',
    title: 'Strengths',
    originLabel: 'Internal Origin',
    valenceLabel: 'Advantageous',
    actionPrefix: 'Leverage Tactic',
    headerTextClass: 'text-emerald-800',
  },
  {
    key: 'weaknesses',
    title: 'Weaknesses',
    originLabel: 'Internal Origin',
    valenceLabel: 'Vulnerability',
    actionPrefix: 'Mitigation Plan',
    headerTextClass: 'text-amber-800',
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    originLabel: 'External Environment',
    valenceLabel: 'Asymmetric Upside',
    actionPrefix: 'Capture Strategy',
    headerTextClass: 'text-sky-800',
  },
  {
    key: 'threats',
    title: 'Threats',
    originLabel: 'External Environment',
    valenceLabel: 'Downside Risk',
    actionPrefix: 'Contingency Defense',
    headerTextClass: 'text-rose-800',
  },
];

export const SwotGridView: React.FC<SwotGridViewProps> = ({ swot, onAddSwotEntry }) => {
  const [activeQuadrantForm, setActiveQuadrantForm] = useState<QuadrantKey | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newAction, setNewAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuadrantForm || !newTitle.trim()) return;
    onAddSwotEntry(activeQuadrantForm, {
      title: newTitle.trim(),
      detail: newDetail.trim() || 'User-identified strategic factor.',
      actionItem: newAction.trim() || 'Monitor and review quarterly.',
    });
    setNewTitle('');
    setNewDetail('');
    setNewAction('');
    setActiveQuadrantForm(null);
  };

  return (
    <section aria-labelledby="swot-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500">03. Analytical Framework · 4-Quadrant Strategic Matrix</p>
          <h2 id="swot-heading" className="text-xl font-semibold text-slate-900 mt-1">
            SWOT Strategic Assessment
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Focal Path Evaluated: <span className="font-medium text-slate-900">{swot.focalSubject}</span>
          </p>
        </div>
      </div>

      {/* 2x2 Architectural Grid with Hairline Dividers */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 divide-slate-200">
        {QUADRANT_META.map((quad, idx) => {
          const items = swot[quad.key] || [];
          const borderClasses =
            idx === 0
              ? 'lg:border-r lg:border-b border-slate-200'
              : idx === 1
              ? 'lg:border-b border-slate-200'
              : idx === 2
              ? 'lg:border-r border-slate-200'
              : '';

          return (
            <div key={quad.key} className={`p-6 flex flex-col justify-between ${borderClasses}`}>
              <div>
                {/* Quadrant Header */}
                <div className="flex items-baseline justify-between pb-3 mb-5 border-b border-slate-100">
                  <div>
                    <h3 className={`text-base font-semibold ${quad.headerTextClass}`}>
                      {quad.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{quad.originLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{quad.valenceLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{items.length} Factors</span>
                    </div>
                  </div>
                </div>

                {/* Quadrant Factors List */}
                <ol className="space-y-5">
                  {items.map((entry, i) => (
                    <li
                      key={`${quad.key}-${i}`}
                      className="pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                          0{i + 1}.
                        </span>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-semibold text-slate-900">{entry.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{entry.detail}</p>
                          <p className="text-xs text-slate-800 pt-1">
                            <span className="font-semibold text-slate-900">{quad.actionPrefix}: </span>
                            {entry.actionItem}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Add Factor to Quadrant */}
              <div className="mt-6 pt-3 border-t border-slate-100">
                {activeQuadrantForm === quad.key ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                  >
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={`${quad.title} factor title...`}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                      required
                    />
                    <input
                      type="text"
                      value={newDetail}
                      onChange={(e) => setNewDetail(e.target.value)}
                      placeholder="Strategic mechanism or context..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                    />
                    <input
                      type="text"
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      placeholder={`${quad.actionPrefix} (concrete next step)...`}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveQuadrantForm(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
                      >
                        Add to {quad.title}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveQuadrantForm(quad.key)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add {quad.title.slice(0, -1)} Factor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

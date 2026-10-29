import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { ComparisonCriterion, DecisionOption } from '../types/decision';

interface ComparisonMatrixViewProps {
  options: DecisionOption[];
  criteria: ComparisonCriterion[];
  onUpdateCriterionWeight: (criterionId: string, newWeight: number) => void;
  onUpdateOptionScore: (criterionId: string, optionName: string, newScore: number) => void;
  onAddCriterion: (criterion: ComparisonCriterion) => void;
  onResetWeights: () => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  options,
  criteria,
  onUpdateCriterionWeight,
  onUpdateOptionScore,
  onAddCriterion,
  onResetWeights,
}) => {
  const [showAddRow, setShowAddRow] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(3);
  const [newScores, setNewScores] = useState<Record<string, number>>({});

  const optionNames = options.map((o) => o.name);

  // Calculate weighted totals per option
  const maxPossibleWeightedTotal = criteria.reduce((acc, c) => acc + c.weight * 10, 0) || 1;

  const optionTotals = optionNames.map((optName) => {
    const rawWeightedSum = criteria.reduce((acc, crit) => {
      const found = crit.scores.find((s) => s.optionName === optName);
      const score = found ? found.score : 5;
      return acc + score * crit.weight;
    }, 0);
    const normalizedScore = Math.round((rawWeightedSum / maxPossibleWeightedTotal) * 100);
    return {
      optionName: optName,
      rawWeightedSum,
      normalizedScore,
    };
  });

  const highestRawSum = Math.max(...optionTotals.map((t) => t.rawWeightedSum));

  const handleAddCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const newItem: ComparisonCriterion = {
      id: `crit-custom-${Date.now()}`,
      criterion: newCritName.trim(),
      description: newCritDesc.trim() || 'User-defined evaluation criterion.',
      weight: newCritWeight,
      scores: optionNames.map((name) => ({
        optionName: name,
        score: newScores[name] ?? 7,
        note: 'Custom user score.',
      })),
    };

    onAddCriterion(newItem);
    setNewCritName('');
    setNewCritDesc('');
    setNewCritWeight(3);
    setNewScores({});
    setShowAddRow(false);
  };

  return (
    <section aria-labelledby="matrix-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500">02. Analytical Framework · Multi-Criteria Decision Matrix</p>
          <h2 id="matrix-heading" className="text-xl font-semibold text-slate-900 mt-1">
            Weighted Comparison Table
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Adjust criterion multipliers (1x–5x) or fine-tune option ratings (1–10) to recalculate the winning option in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onResetWeights}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Equalize Weights (3x)
          </button>
          <button
            type="button"
            onClick={() => setShowAddRow((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Criterion
          </button>
        </div>
      </div>

      {/* Add Criterion Form */}
      {showAddRow && (
        <form
          onSubmit={handleAddCriterionSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Add Evaluation Criterion</h3>
            <span className="text-xs text-slate-500">Rate 10 for most favorable outcome</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Criterion Name</label>
              <input
                type="text"
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                placeholder="e.g., Cultural Fit & Team Morale"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">What It Measures</label>
              <input
                type="text"
                value={newCritDesc}
                onChange={(e) => setNewCritDesc(e.target.value)}
                placeholder="e.g., Alignment with engineering values"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Importance Multiplier (1x–5x)
              </label>
              <select
                value={newCritWeight}
                onChange={(e) => setNewCritWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono tabular-nums"
              >
                <option value={1}>1x — Low Priority</option>
                <option value={2}>2x — Secondary</option>
                <option value={3}>3x — Standard</option>
                <option value={4}>4x — High Priority</option>
                <option value={5}>5x — Critical Tiebreaker</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {optionNames.map((optName) => (
              <div key={optName} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-medium text-slate-800 truncate mb-1">
                  {optName} Score (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newScores[optName] ?? 7}
                  onChange={(e) =>
                    setNewScores((prev) => ({
                      ...prev,
                      [optName]: Math.min(10, Math.max(1, Number(e.target.value))),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono tabular-nums"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddRow(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Insert Into Matrix
            </button>
          </div>
        </form>
      )}

      {/* High-Density Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-700 min-w-[240px]">
                  Evaluation Criterion
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-700 w-40">
                  Weight Multiplier
                </th>
                {optionTotals.map((opt) => {
                  const isLeader = opt.rawWeightedSum === highestRawSum;
                  return (
                    <th
                      key={opt.optionName}
                      className={`py-3.5 px-5 text-xs font-semibold min-w-[250px] border-l border-slate-200 ${
                        isLeader ? 'bg-emerald-50/40 text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{opt.optionName}</span>
                        <span
                          className={`font-mono tabular-nums text-xs ${
                            isLeader ? 'text-emerald-700 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {opt.normalizedScore}/100
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {criteria.map((item) => {
                const maxScoreInRow = Math.max(...item.scores.map((s) => s.score));
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors align-top">
                    {/* Criterion title & description */}
                    <td className="py-4 px-5">
                      <p className="text-sm font-medium text-slate-900">{item.criterion}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </td>

                    {/* Interactive Multiplier Selector (1x to 5x) */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
                        {[1, 2, 3, 4, 5].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => onUpdateCriterionWeight(item.id, w)}
                            className={`w-6 h-6 text-xs font-mono tabular-nums rounded-md transition-colors ${
                              item.weight === w
                                ? 'bg-slate-900 text-white font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title={`Set weight multiplier to ${w}x`}
                          >
                            {w}x
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 font-mono tabular-nums mt-1.5">
                        Max {item.weight * 10} pts
                      </p>
                    </td>

                    {/* Option Score Cells */}
                    {optionNames.map((optName) => {
                      const scoreObj = item.scores.find((s) => s.optionName === optName) || {
                        optionName: optName,
                        score: 5,
                        note: '',
                      };
                      const weightedPoints = scoreObj.score * item.weight;
                      const isRowWinner = scoreObj.score === maxScoreInRow;

                      return (
                        <td
                          key={optName}
                          className="py-4 px-5 border-l border-slate-200"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={scoreObj.score}
                                onChange={(e) =>
                                  onUpdateOptionScore(item.id, optName, Number(e.target.value))
                                }
                                className="w-20 accent-slate-900 cursor-pointer"
                                aria-label={`${optName} score for ${item.criterion}`}
                              />
                              <span
                                className={`text-sm font-mono tabular-nums font-semibold ${
                                  isRowWinner ? 'text-emerald-700' : 'text-slate-800'
                                }`}
                              >
                                {scoreObj.score}/10
                              </span>
                            </div>
                            <span className="text-xs font-mono tabular-nums text-slate-500">
                              ={weightedPoints} pts
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{scoreObj.note}</p>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Summary Footer Row */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="py-4 px-5">
                  <p className="text-sm font-semibold text-slate-900">Weighted Matrix Total</p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Maximum possible score: {maxPossibleWeightedTotal} pts
                  </p>
                </td>
                <td className="py-4 px-4 font-mono tabular-nums text-xs text-slate-600">
                  {criteria.reduce((sum, c) => sum + c.weight, 0)}x Total Weight
                </td>
                {optionTotals.map((opt) => {
                  const isLeader = opt.rawWeightedSum === highestRawSum;
                  return (
                    <td
                      key={opt.optionName}
                      className={`py-4 px-5 border-l border-slate-200 ${
                        isLeader ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-mono tabular-nums font-bold text-slate-900">
                            {opt.rawWeightedSum}
                          </span>
                          <span className="text-xs font-mono tabular-nums text-slate-500 ml-1">
                            / {maxPossibleWeightedTotal} pts
                          </span>
                        </div>
                        <span
                          className={`text-xs font-mono tabular-nums font-semibold ${
                            isLeader ? 'text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          {opt.normalizedScore}% Match {isLeader ? '· Leading' : ''}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Plus, Check, Minus } from 'lucide-react';
import { OptionProsAndCons, ProConItem } from '../types/decision';

interface ProsConsViewProps {
  prosAndCons: OptionProsAndCons[];
  onToggleItem: (optionName: string, type: 'pros' | 'cons', itemId: string) => void;
  onUpdateWeight: (optionName: string, type: 'pros' | 'cons', itemId: string, delta: number) => void;
  onAddItem: (
    optionName: string,
    type: 'pros' | 'cons',
    item: Omit<ProConItem, 'id'>
  ) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  prosAndCons,
  onToggleItem,
  onUpdateWeight,
  onAddItem,
}) => {
  const [activeOptionFilter, setActiveOptionFilter] = useState<string>('ALL');
  const [addingFor, setAddingFor] = useState<{ optionName: string; type: 'pros' | 'cons' } | null>(null);
  const [newPoint, setNewPoint] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newDimension, setNewDimension] = useState('Strategic');
  const [newWeight, setNewWeight] = useState(7);

  const visibleGroups =
    activeOptionFilter === 'ALL'
      ? prosAndCons
      : prosAndCons.filter((g) => g.optionName === activeOptionFilter);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingFor || !newPoint.trim()) return;
    onAddItem(addingFor.optionName, addingFor.type, {
      point: newPoint.trim(),
      detail: newDetail.trim() || 'User-defined decision factor.',
      dimension: newDimension.trim() || 'Custom',
      impactWeight: newWeight,
    });
    setNewPoint('');
    setNewDetail('');
    setNewWeight(7);
    setAddingFor(null);
  };

  return (
    <section aria-labelledby="pros-cons-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500">01. Analytical Framework · Weighted Balance Sheet</p>
          <h2 id="pros-cons-heading" className="text-xl font-semibold text-slate-900 mt-1">
            Pros & Cons Ledger
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Toggle individual factors or adjust 1–10 impact weights to test how each trade-off shifts the net balance.
          </p>
        </div>

        {/* Interactive option filter control */}
        {prosAndCons.length > 1 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveOptionFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeOptionFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Options ({prosAndCons.length})
            </button>
            {prosAndCons.map((group) => (
              <button
                key={group.optionName}
                type="button"
                onClick={() => setActiveOptionFilter(group.optionName)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors truncate max-w-[180px] shrink-0 ${
                  activeOptionFilter === group.optionName
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {group.optionName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {visibleGroups.map((group) => {
          const activePros = group.pros.filter((p) => !p.disabled);
          const activeCons = group.cons.filter((c) => !c.disabled);
          const totalProWeight = activePros.reduce((sum, p) => sum + p.impactWeight, 0);
          const totalConWeight = activeCons.reduce((sum, c) => sum + c.impactWeight, 0);
          const netScore = totalProWeight - totalConWeight;
          const totalMagnitude = totalProWeight + totalConWeight || 1;
          const proPercentage = Math.round((totalProWeight / totalMagnitude) * 100);

          return (
            <div
              key={group.optionName}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Option Header & Net Balance Bar */}
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{group.optionName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono tabular-nums">
                    <span>{activePros.length} Active Pros (+{totalProWeight} pts)</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeCons.length} Active Cons (-{totalConWeight} pts)</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        netScore > 0
                          ? 'text-emerald-700 font-semibold'
                          : netScore < 0
                          ? 'text-rose-700 font-semibold'
                          : 'text-slate-700 font-semibold'
                      }
                    >
                      Net Balance: {netScore > 0 ? `+${netScore}` : netScore} pts
                    </span>
                  </div>
                </div>

                {/* Proportional Visual Balance Meter */}
                <div className="w-full lg:w-72 shrink-0">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-slate-600 mb-1.5">
                    <span>Pros {proPercentage}%</span>
                    <span>Cons {100 - proPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-rose-200 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-150"
                      style={{ width: `${proPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2-Column Split: Pros vs Cons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* PROS COLUMN */}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <span className="text-sm font-semibold text-emerald-800">
                        Advantages & Upside Factors
                      </span>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        +{totalProWeight} Weighted Sum
                      </span>
                    </div>

                    <ul className="space-y-4">
                      {group.pros.map((item) => (
                        <li
                          key={item.id}
                          className={`pb-4 border-b border-slate-100 last:border-b-0 last:pb-0 transition-opacity ${
                            item.disabled ? 'opacity-45' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => onToggleItem(group.optionName, 'pros', item.id)}
                                title={item.disabled ? 'Include factor in balance' : 'Exclude factor from balance'}
                                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                  item.disabled
                                    ? 'border-slate-300 bg-white text-transparent'
                                    : 'border-emerald-600 bg-emerald-600 text-white'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <div>
                                <p
                                  className={`text-sm font-medium text-slate-900 ${
                                    item.disabled ? 'line-through' : ''
                                  }`}
                                >
                                  {item.point}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {item.detail}
                                </p>
                                {/* Unboxed clean metadata */}
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                  <span>{item.dimension}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    Impact {item.impactWeight}/10
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Weight Adjuster */}
                            <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateWeight(group.optionName, 'pros', item.id, -1)}
                                disabled={item.impactWeight <= 1}
                                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                aria-label="Decrease pro weight"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700 w-5 text-center">
                                +{item.impactWeight}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateWeight(group.optionName, 'pros', item.id, 1)}
                                disabled={item.impactWeight >= 10}
                                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                aria-label="Increase pro weight"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100">
                    {addingFor?.optionName === group.optionName && addingFor.type === 'pros' ? (
                      <form onSubmit={handleCreateSubmit} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={newPoint}
                          onChange={(e) => setNewPoint(e.target.value)}
                          placeholder="Pro headline (e.g., Immediate cash flow)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                          required
                        />
                        <input
                          type="text"
                          value={newDetail}
                          onChange={(e) => setNewDetail(e.target.value)}
                          placeholder="Supporting mechanism or context..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newDimension}
                              onChange={(e) => setNewDimension(e.target.value)}
                              placeholder="Dimension"
                              className="w-28 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md"
                            />
                            <label className="text-xs text-slate-600 font-mono tabular-nums flex items-center gap-1.5">
                              Weight:
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={newWeight}
                                onChange={(e) => setNewWeight(Number(e.target.value))}
                                className="w-12 px-1.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono tabular-nums"
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAddingFor(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 whitespace-nowrap shrink-0"
                            >
                              Save Pro
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingFor({ optionName: group.optionName, type: 'pros' })}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Pro
                      </button>
                    )}
                  </div>
                </div>

                {/* CONS COLUMN */}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <span className="text-sm font-semibold text-rose-800">
                        Drawbacks, Costs & Risks
                      </span>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        -{totalConWeight} Weighted Sum
                      </span>
                    </div>

                    <ul className="space-y-4">
                      {group.cons.map((item) => (
                        <li
                          key={item.id}
                          className={`pb-4 border-b border-slate-100 last:border-b-0 last:pb-0 transition-opacity ${
                            item.disabled ? 'opacity-45' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => onToggleItem(group.optionName, 'cons', item.id)}
                                title={item.disabled ? 'Include factor in balance' : 'Exclude factor from balance'}
                                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                  item.disabled
                                    ? 'border-slate-300 bg-white text-transparent'
                                    : 'border-rose-600 bg-rose-600 text-white'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <div>
                                <p
                                  className={`text-sm font-medium text-slate-900 ${
                                    item.disabled ? 'line-through' : ''
                                  }`}
                                >
                                  {item.point}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {item.detail}
                                </p>
                                {/* Unboxed clean metadata */}
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                  <span>{item.dimension}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    Severity {item.impactWeight}/10
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Weight Adjuster */}
                            <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateWeight(group.optionName, 'cons', item.id, -1)}
                                disabled={item.impactWeight <= 1}
                                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                aria-label="Decrease con severity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono tabular-nums font-semibold text-rose-700 w-5 text-center">
                                -{item.impactWeight}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateWeight(group.optionName, 'cons', item.id, 1)}
                                disabled={item.impactWeight >= 10}
                                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                aria-label="Increase con severity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100">
                    {addingFor?.optionName === group.optionName && addingFor.type === 'cons' ? (
                      <form onSubmit={handleCreateSubmit} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={newPoint}
                          onChange={(e) => setNewPoint(e.target.value)}
                          placeholder="Con headline (e.g., High switching cost)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                          required
                        />
                        <input
                          type="text"
                          value={newDetail}
                          onChange={(e) => setNewDetail(e.target.value)}
                          placeholder="Supporting risk detail or cost..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newDimension}
                              onChange={(e) => setNewDimension(e.target.value)}
                              placeholder="Dimension"
                              className="w-28 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md"
                            />
                            <label className="text-xs text-slate-600 font-mono tabular-nums flex items-center gap-1.5">
                              Severity:
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={newWeight}
                                onChange={(e) => setNewWeight(Number(e.target.value))}
                                className="w-12 px-1.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono tabular-nums"
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAddingFor(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 whitespace-nowrap shrink-0"
                            >
                              Save Con
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingFor({ optionName: group.optionName, type: 'cons' })}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Con
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

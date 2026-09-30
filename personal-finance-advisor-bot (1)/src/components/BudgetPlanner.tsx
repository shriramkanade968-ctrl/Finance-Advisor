import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Info,
  Sliders,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../data/categories';
import {
  ExpenseCategory,
  FinancialPersona,
  FinancialSnapshot,
} from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';

interface BudgetPlannerProps {
  snapshot: FinancialSnapshot;
  persona: FinancialPersona;
  currency: string;
  onUpdateBudgetLimit: (category: ExpenseCategory, newLimit: number) => void;
  onBatchUpdateLimits: (newLimits: Record<ExpenseCategory, number>) => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  snapshot,
  persona,
  currency,
  onUpdateBudgetLimit,
  onBatchUpdateLimits,
  onOpenAdvisorWithPrompt,
}) => {
  const [filterClassification, setFilterClassification] = useState<'all' | 'needs' | 'wants'>('all');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);

  // Compute total budgeted vs income
  const totalBudgeted = Object.values(snapshot.categoryLimits).reduce((a, b) => a + b, 0);
  const unallocated = snapshot.totalIncome - totalBudgeted;
  const isOverAllocated = unallocated < 0;

  // Auto-generate balanced budget plan based on persona targets and actual income
  const handleAutoGenerateBudget = () => {
    setIsAutoGenerating(true);
    setPlanFeedback(null);

    setTimeout(() => {
      const income = snapshot.totalIncome > 0 ? snapshot.totalIncome : persona.monthlyIncomeBase;
      const newLimits: Record<ExpenseCategory, number> = {} as any;

      // Allocate according to default category weights adjusted to total income
      for (const cat of ALL_CATEGORIES) {
        const meta = CATEGORIES_CONFIG[cat];
        const weight = meta.defaultAllocationPercent / 100;
        // round to nearest $5
        newLimits[cat] = Math.round((income * weight) / 5) * 5;
      }

      onBatchUpdateLimits(newLimits);
      setIsAutoGenerating(false);
      setPlanFeedback(
        `Personalized budget generated! Envelopes balanced to your $${income.toFixed(
          0
        )} monthly income using smart baseline allocation.`
      );
      setTimeout(() => setPlanFeedback(null), 5000);
    }, 600);
  };

  const filteredCategories = ALL_CATEGORIES.filter((cat) => {
    if (filterClassification === 'all') return true;
    const meta = CATEGORIES_CONFIG[cat];
    return meta.classification === filterClassification;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Budget Assistant & Auto Allocation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Intelligent Budget Generator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Personalized Monthly Budget Envelopes
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Customized for {persona.name}&apos;s profile ({persona.typicalNeedsPercent}% Essentials /{' '}
            {persona.typicalWantsPercent}% Lifestyle / {persona.typicalSavingsPercent}% Savings).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAutoGenerateBudget}
            disabled={isAutoGenerating}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAutoGenerating ? 'Optimizing...' : 'AI Auto-Balance Budget'}</span>
          </button>
          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                'Please audit my category budget envelopes and propose the most optimal savings-maximizing plan.'
              )
            }
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Ask Advisor</span>
          </button>
        </div>
      </div>

      {planFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{planFeedback}</span>
        </div>
      )}

      {/* Allocation Status Bar (Zero-Based Budgeting) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Monthly Income Allocation</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Every dollar planned: Expenses budgeted + Target savings reserve
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div>
              <span className="text-slate-400">Total Income: </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(snapshot.totalIncome, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Total Budgeted: </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(totalBudgeted, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Unallocated: </span>
              <span
                className={`font-bold ${
                  isOverAllocated ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(unallocated, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Allocation Meter */}
        <div className="mt-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{
                width: `${Math.min(
                  100,
                  snapshot.totalIncome > 0 ? (totalBudgeted / snapshot.totalIncome) * 100 : 80
                )}%`,
              }}
              className={`h-full transition-all duration-500 ${
                isOverAllocated ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
            <span>
              {snapshot.totalIncome > 0
                ? `${Math.round((totalBudgeted / snapshot.totalIncome) * 100)}% allocated`
                : '100%'}
            </span>
            <span>
              {isOverAllocated
                ? 'Warning: Total limits exceed your monthly income!'
                : `Remaining buffer automatically flows to savings ($${Math.max(
                    0,
                    unallocated
                  ).toFixed(2)})`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs (All / Needs / Wants) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterClassification('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterClassification === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Envelopes ({ALL_CATEGORIES.length})
          </button>
          <button
            onClick={() => setFilterClassification('needs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterClassification === 'needs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs (Essentials)
          </button>
          <button
            onClick={() => setFilterClassification('wants')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterClassification === 'wants'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wants (Discretionary)
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Adjust limits anytime to match seasonal lifestyle shifts
        </span>
      </div>

      {/* Category Budget Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const meta = CATEGORIES_CONFIG[cat];
          const spent = snapshot.categoryTotals[cat] || 0;
          const limit = snapshot.categoryLimits[cat] || 0;
          const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const isOver = limit > 0 && spent > limit;
          const isNear = limit > 0 && percent >= 80 && percent <= 100;

          return (
            <div
              key={cat}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                isOver
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isNear
                  ? 'border-amber-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="font-bold text-slate-900 text-sm">{cat}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      meta.classification === 'needs'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {meta.classification}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Spent to date: </span>
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(spent, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isOver
                          ? 'bg-rose-100 text-rose-700'
                          : isNear
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {percent}% spent
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                {isOver && (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Exceeded budget by {formatCurrency(spent - limit, currency)}</span>
                  </p>
                )}
              </div>

              {/* Limit Adjustment Input */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Monthly Limit ({currency})
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={limit}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      onUpdateBudgetLimit(cat, val);
                    }}
                    className="w-full px-3 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      // Suggest limit equal to current spend + 10%
                      const suggested = Math.ceil((spent * 1.1) / 10) * 10;
                      onUpdateBudgetLimit(cat, suggested);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer"
                    title="Auto-match to current spend + 10% buffer"
                  >
                    Match
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

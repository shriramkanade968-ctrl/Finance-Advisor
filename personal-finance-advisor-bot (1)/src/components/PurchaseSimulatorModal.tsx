import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/categories';
import {
  ExpenseCategory,
  FinancialPersona,
  FinancialSnapshot,
  PurchaseSimulationResult,
} from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';

interface PurchaseSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: FinancialSnapshot;
  persona: FinancialPersona;
  currency: string;
}

export const PurchaseSimulatorModal: React.FC<PurchaseSimulatorModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  persona,
  currency,
}) => {
  const [itemName, setItemName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [urgency, setUrgency] = useState<'Essential' | 'Nice to Have' | 'Impulse / Luxury'>('Nice to Have');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<PurchaseSimulationResult | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost);
    if (!itemName.trim() || isNaN(costNum) || costNum <= 0) return;

    setIsSimulating(true);
    setResult(null);

    try {
      const res = await fetch('/api/advisor/simulate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          cost: costNum,
          category,
          urgency,
          financialSnapshot: snapshot,
        }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      setResult(data);
    } catch {
      // Local fallback calculation
      const netCash = snapshot.netCashFlow;
      let verdict: 'SAFE' | 'CAUTION' | 'NOT_RECOMMENDED' = 'SAFE';
      let title = 'Safe to Proceed';
      let rationale = `You have sufficient monthly surplus ($${netCash.toFixed(2)}) to absorb this $${costNum.toFixed(2)} purchase without dipping into debt.`;

      if (costNum > netCash) {
        verdict = 'NOT_RECOMMENDED';
        title = 'Over Budget — Delay Recommended';
        rationale = `This cost ($${costNum.toFixed(2)}) exceeds your available net cash flow surplus ($${netCash.toFixed(2)}). Buying it now would force you to dip into emergency reserves or create a deficit.`;
      } else if (costNum > netCash * 0.5) {
        verdict = 'CAUTION';
        title = 'Proceed with Caution';
        rationale = `While technically affordable, this purchase consumes more than 50% of your remaining monthly buffer ($${netCash.toFixed(2)}).`;
      }

      setResult({
        verdict,
        verdictTitle: title,
        rationale,
        impactOnCashFlow: `Reduces remaining cash flow buffer from $${netCash.toFixed(2)} to $${Math.max(0, netCash - costNum).toFixed(2)}.`,
        impactOnSavingsGoals: `May delay planned contributions by ~${Math.ceil(costNum / 200)} weeks.`,
        recommendedAction:
          verdict === 'NOT_RECOMMENDED'
            ? 'Wait 30 days and save $100/week in a designated sinking fund.'
            : 'If purchasing, avoid extra dining-out or entertainment expenses for 2 weeks.',
        alternativeTimeline: 'Safe to buy next month after recurring bills clear.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
      case 'CAUTION':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
          iconColor: 'text-rose-600',
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                &ldquo;Can I Afford This?&rdquo; Simulator
              </h3>
              <p className="text-[11px] text-slate-500">
                Stress-test any purchase against your live budget & savings goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              What do you want to buy? *
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. New Noise Cancelling Headphones or Weekend Flight"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Cost ({currency}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="250"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urgency / Necessity Level
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['Essential', 'Nice to Have', 'Impulse / Luxury'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`py-2 px-2 rounded-lg border text-center font-medium transition-all ${
                    urgency === level
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSimulating || !itemName.trim() || !cost}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating financial impact...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Affordability</span>
              </>
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="mt-5 space-y-3 animate-in fade-in duration-200">
            {(() => {
              const style = getVerdictStyle(result.verdict);
              const Icon = style.icon;
              return (
                <div className={`p-4 rounded-xl border ${style.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                      <span className="font-bold text-sm">{result.verdictTitle}</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {result.verdict}
                    </span>
                  </div>

                  <p className="text-xs mt-2.5 leading-relaxed font-medium">
                    {result.rationale}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 space-y-1.5 text-[11px]">
                    <div>
                      <strong className="text-slate-800">Cash Flow Impact: </strong>
                      <span>{result.impactOnCashFlow}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800">Recommendation: </strong>
                      <span>{result.recommendedAction}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

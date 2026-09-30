import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Printer,
  X,
  Target,
  DollarSign,
} from 'lucide-react';
import { FinancialAnalysis, FinancialPersona, FinancialSnapshot } from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';

interface SpendingInsightsModalProps {
  analysis: FinancialAnalysis;
  snapshot: FinancialSnapshot;
  persona: FinancialPersona;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
}

export const SpendingInsightsModal: React.FC<SpendingInsightsModalProps> = ({
  analysis,
  snapshot,
  persona,
  currency,
  isOpen,
  onClose,
  onOpenReport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                AI Spending Diagnostics & Financial Health
              </h3>
              <p className="text-xs text-slate-500">
                Automated monthly analysis powered by Gemini 3.8 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="mt-5 p-5 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Health Score: {analysis.healthScore}/100 ({analysis.status})
            </span>
            <span className="text-xs text-slate-300">Target Benchmark: 80+</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
            &ldquo;{analysis.summary}&rdquo;
          </p>
        </div>

        {/* 50/30/20 Rule Comparison */}
        <div className="mt-6">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
            Budget Rule Adherence ({persona.typicalNeedsPercent}/{persona.typicalWantsPercent}/{persona.typicalSavingsPercent})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="text-xs font-semibold text-blue-900">Needs (Essentials)</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(analysis.budgetRuleComparison.needs.actual, currency)}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {analysis.budgetRuleComparison.needs.percent}% of income (Target:{' '}
                {analysis.budgetRuleComparison.needs.targetPercent}%)
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50">
              <div className="text-xs font-semibold text-purple-900">Wants (Lifestyle)</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(analysis.budgetRuleComparison.wants.actual, currency)}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {analysis.budgetRuleComparison.wants.percent}% of income (Target:{' '}
                {analysis.budgetRuleComparison.wants.targetPercent}%)
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div className="text-xs font-semibold text-emerald-900">Savings & Debt Cushion</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(analysis.budgetRuleComparison.savings.actual, currency)}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {analysis.budgetRuleComparison.savings.percent}% of income (Target:{' '}
                {analysis.budgetRuleComparison.savings.targetPercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Overspending Categories (if any) */}
        {analysis.overspendingCategories && analysis.overspendingCategories.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center space-x-1.5 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Identified Overspending Areas</span>
            </h4>
            <div className="space-y-3">
              {analysis.overspendingCategories.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-xs text-slate-700"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm mb-1">
                    <span>{item.category}</span>
                    <span className="text-rose-600 font-extrabold">
                      Over by +{formatCurrency(item.variance, currency)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-500 mb-2">
                    <span>Spent: {formatCurrency(item.spent, currency)}</span>
                    <span>Budget Limit: {formatCurrency(item.budget, currency)}</span>
                  </div>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-rose-100 font-medium">
                    💡 <strong>Advisor Advice:</strong> {item.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Tips */}
        <div className="mt-6">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
            Actionable Optimization Steps
          </h4>
          <div className="space-y-2">
            {analysis.actionableTips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenReport();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Full Printable Report</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

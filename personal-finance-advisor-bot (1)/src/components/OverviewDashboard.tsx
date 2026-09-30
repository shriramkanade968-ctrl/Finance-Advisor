import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Target,
  Plus,
  HelpCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/categories';
import {
  ExpenseCategory,
  ExpenseItem,
  FinancialAnalysis,
  FinancialPersona,
  FinancialSnapshot,
  IncomeItem,
  SavingsGoal,
} from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';

interface OverviewDashboardProps {
  snapshot: FinancialSnapshot;
  persona: FinancialPersona;
  currency: string;
  analysis: FinancialAnalysis;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
  onOpenAnalysis: () => void;
  onOpenSimulator: () => void;
  onOpenGoalDeposit: (goal: SavingsGoal) => void;
  onNavigateToTab: (tab: 'overview' | 'expenses' | 'budget' | 'goals' | 'advisor') => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  snapshot,
  persona,
  currency,
  analysis,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenAdvisorWithPrompt,
  onOpenAnalysis,
  onOpenSimulator,
  onOpenGoalDeposit,
  onNavigateToTab,
}) => {
  const isSurplus = snapshot.netCashFlow >= 0;

  // Determine health color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Top 5 categories by spending
  const sortedCategories = (Object.entries(snapshot.categoryTotals) as [ExpenseCategory, number][])
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{persona.avatar}</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome back, {persona.name}!
              </h2>
            </div>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {persona.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Can I Afford This?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Income */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Inflow
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(snapshot.totalIncome, currency)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Salary & cash inflows</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Logged */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(snapshot.totalExpenses, currency)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>
                {snapshot.totalIncome > 0
                  ? `${Math.round((snapshot.totalExpenses / snapshot.totalIncome) * 100)}% of monthly income`
                  : 'Outflow to date'}
              </span>
            </div>
          </div>
        </div>

        {/* Net Monthly Cash Flow */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Cash Flow
            </span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isSurplus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isSurplus ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${
                isSurplus ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {isSurplus ? '+' : ''}
              {formatCurrency(snapshot.netCashFlow, currency)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span className={`font-semibold ${isSurplus ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isSurplus ? 'Surplus buffer' : 'Deficit alert'}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Savings Rate
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {snapshot.savingsRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
              <span>Target: {persona.typicalSavingsPercent}%</span>
              <span
                className={`font-semibold ${
                  snapshot.savingsRate >= persona.typicalSavingsPercent
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {snapshot.savingsRate >= persona.typicalSavingsPercent ? 'On Track' : 'Below Target'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overspending Alerts Banner (if any) */}
      {snapshot.overspentCategories.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm sm:text-base">
                  Overspending Detected in {snapshot.overspentCategories.length}{' '}
                  {snapshot.overspentCategories.length === 1 ? 'Category' : 'Categories'}
                </h4>
                <p className="text-xs sm:text-sm text-amber-800/90 mt-1">
                  You have exceeded your planned monthly limit in:{' '}
                  {snapshot.overspentCategories.map((c, i) => (
                    <span key={c.category} className="font-semibold">
                      {c.category} (+{formatCurrency(c.variance, currency)})
                      {i < snapshot.overspentCategories.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  .
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      onOpenAdvisorWithPrompt(
                        `How can I cut back spending on ${snapshot.overspentCategories[0].category} to balance my monthly budget?`
                      )
                    }
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get AI Cutback Advice</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTab('budget')}
                    className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Adjust Budget Limits
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Health Scorecard & 50/30/20 Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Scorecard (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Financial Health Score</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(
                  analysis.healthScore
                )}`}
              >
                {analysis.status}
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="mt-5 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`fill-none transition-all duration-700 ${
                      analysis.healthScore >= 75
                        ? 'stroke-emerald-500'
                        : analysis.healthScore >= 60
                        ? 'stroke-blue-500'
                        : 'stroke-amber-500'
                    }`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.healthScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {analysis.healthScore}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    out of 100
                  </span>
                </div>
              </div>
            </div>

            {/* Brief AI diagnostic quote */}
            <p className="text-xs text-slate-600 mt-4 text-center leading-relaxed">
              &ldquo;{analysis.summary}&rdquo;
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onOpenAnalysis}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>View Full AI Spending Diagnostic</span>
            </button>
          </div>
        </div>

        {/* 50/30/20 Budget Breakdown & Rules (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Budget Allocation ({persona.typicalNeedsPercent}/{persona.typicalWantsPercent}/{persona.typicalSavingsPercent} Rule)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Needs (Essentials) vs. Wants (Discretionary) vs. Savings & Buffer
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('budget')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <span>Edit Allocations</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="mt-5 space-y-4">
              <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${Math.min(100, analysis.budgetRuleComparison.needs.percent)}%` }}
                  className="bg-blue-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  title={`Needs: ${analysis.budgetRuleComparison.needs.percent}%`}
                >
                  {analysis.budgetRuleComparison.needs.percent > 10 &&
                    `${analysis.budgetRuleComparison.needs.percent}%`}
                </div>
                <div
                  style={{ width: `${Math.min(100, analysis.budgetRuleComparison.wants.percent)}%` }}
                  className="bg-purple-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  title={`Wants: ${analysis.budgetRuleComparison.wants.percent}%`}
                >
                  {analysis.budgetRuleComparison.wants.percent > 10 &&
                    `${analysis.budgetRuleComparison.wants.percent}%`}
                </div>
                <div
                  style={{ width: `${Math.min(100, analysis.budgetRuleComparison.savings.percent)}%` }}
                  className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  title={`Savings: ${analysis.budgetRuleComparison.savings.percent}%`}
                >
                  {analysis.budgetRuleComparison.savings.percent > 10 &&
                    `${analysis.budgetRuleComparison.savings.percent}%`}
                </div>
              </div>

              {/* Legend & Detail Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Needs */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Needs (Essentials)</span>
                    </span>
                    <span>{analysis.budgetRuleComparison.needs.percent}%</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(analysis.budgetRuleComparison.needs.actual, currency)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Target: {analysis.budgetRuleComparison.needs.targetPercent}% of income
                  </div>
                </div>

                {/* Wants */}
                <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Wants (Lifestyle)</span>
                    </span>
                    <span>{analysis.budgetRuleComparison.wants.percent}%</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(analysis.budgetRuleComparison.wants.actual, currency)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Target: {analysis.budgetRuleComparison.wants.targetPercent}% of income
                  </div>
                </div>

                {/* Savings */}
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Savings & Buffer</span>
                    </span>
                    <span>{analysis.budgetRuleComparison.savings.percent}%</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(analysis.budgetRuleComparison.savings.actual, currency)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Target: {analysis.budgetRuleComparison.savings.targetPercent}% of income
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Actionable tip: {analysis.actionableTips[0] || 'Keep regular spending tabs.'}
            </span>
            <button
              onClick={() => onOpenAdvisorWithPrompt('How do I optimize my 50/30/20 budget?')}
              className="text-emerald-600 font-semibold hover:underline shrink-0 ml-2"
            >
              Ask Advisor
            </button>
          </div>
        </div>
      </div>

      {/* Category Spending vs. Budgets Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Monthly Category Spending & Limits
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking against your allocated envelopes
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('expenses')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>View All Logged Expenses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.slice(0, 6).map(([catName, spent]) => {
            const meta = CATEGORIES_CONFIG[catName];
            const limit = snapshot.categoryLimits[catName] || 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 100;
            const isOver = limit > 0 && spent > limit;
            const isNear = limit > 0 && percent >= 80 && percent <= 100;

            return (
              <div
                key={catName}
                className={`p-4 rounded-xl border transition-all ${
                  isOver
                    ? 'border-rose-300 bg-rose-50/30'
                    : isNear
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: meta?.color || '#64748B' }}
                    />
                    <span className="font-semibold text-slate-900 text-sm">{catName}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isOver
                        ? 'bg-rose-100 text-rose-700'
                        : isNear
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(spent, currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    limit: {formatCurrency(limit, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                {isOver && (
                  <div className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Over by {formatCurrency(spent - limit, currency)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Goals Quick Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Goal-Based Savings Progress</h3>
              <p className="text-xs text-slate-500">
                Track milestones, projected completion, and direct deposits
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('goals')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Manage All Goals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snapshot.savingsGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm truncate">{goal.title}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-xs text-slate-400">
                      of {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>

                  <div className="mt-2 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target: {goal.targetDate || 'Ongoing'}</span>
                    <span>
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), currency)}{' '}
                      left
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenGoalDeposit(goal)}
                    className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Deposit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  DollarSign,
  Gift,
} from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/financeCalculations';

interface SavingsGoalsTrackerProps {
  goals: SavingsGoal[];
  currency: string;
  monthlySurplus: number;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalAmount: (goalId: string, delta: number) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const SavingsGoalsTracker: React.FC<SavingsGoalsTrackerProps> = ({
  goals,
  currency,
  monthlySurplus,
  onAddGoal,
  onUpdateGoalAmount,
  onDeleteGoal,
  onOpenAdvisorWithPrompt,
}) => {
  // Modal for new goal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('Emergency Fund');
  const [color, setColor] = useState('#10B981');

  // Modal for Deposit / Withdraw
  const [activeGoalForDeposit, setActiveGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAction, setDepositAction] = useState<'deposit' | 'withdraw'>('deposit');

  const totalTarget = goals.reduce((a, b) => a + b.targetAmount, 0);
  const totalSaved = goals.reduce((a, b) => a + b.currentAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // Calculate monthly contribution needed for a goal
  const calculateMonthlyTarget = (goal: SavingsGoal) => {
    if (goal.currentAmount >= goal.targetAmount) return 0;
    const remaining = goal.targetAmount - goal.currentAmount;
    if (!goal.targetDate) return Math.round(remaining / 6); // default 6 mo

    const targetTime = new Date(goal.targetDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.max(1, (targetTime - nowTime) / (1000 * 60 * 60 * 24));
    const diffMonths = Math.max(0.5, diffDays / 30.4);

    return Math.ceil(remaining / diffMonths);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currentNum = parseFloat(currentAmount) || 0;
    if (!title.trim() || isNaN(targetNum) || targetNum <= 0) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: targetDate || '2027-01-01',
      category,
      color,
      icon: 'Target',
    });

    setShowAddModal(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForDeposit) return;
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;

    const delta = depositAction === 'deposit' ? val : -val;
    onUpdateGoalAmount(activeGoalForDeposit.id, delta);
    setActiveGoalForDeposit(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Goal-Based Savings Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Target Milestones & Future Reserves
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Track high-yield emergency buffers, debt payoffs, and vacation funds with automatic monthly pace calculations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Cumulative Goals Progress Meter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Overall Savings Portfolio</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Current total saved across all active goals
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-emerald-700">
              {formatCurrency(totalSaved, currency)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">
              / {formatCurrency(totalTarget, currency)} ({overallPercent}%)
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${overallPercent}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
            <span>{goals.length} Active Goals</span>
            <span>
              Remaining to fund: {formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const monthlyNeeded = calculateMonthlyTarget(goal);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                isCompleted
                  ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                      }}
                    >
                      {goal.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{goal.title}</h4>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount display */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(goal.currentAmount, currency)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Target: {formatCurrency(goal.targetAmount, currency)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#10B981',
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{percent}% achieved</span>
                  <span className="text-slate-500">Target: {formatDate(goal.targetDate)}</span>
                </div>

                {/* Monthly required pace */}
                {!isCompleted && monthlyNeeded > 0 && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span>Target pace:</span>
                    <span className="font-bold text-indigo-700">
                      {formatCurrency(monthlyNeeded, currency)} / month
                    </span>
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-3 p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Goal Completed! Milestone achieved.</span>
                  </div>
                )}

                {goal.notes && (
                  <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">{goal.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveGoalForDeposit(goal);
                    setDepositAction('deposit');
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => {
                    setActiveGoalForDeposit(goal);
                    setDepositAction('withdraw');
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Withdraw from goal"
                >
                  Withdraw
                </button>
                <button
                  onClick={() =>
                    onOpenAdvisorWithPrompt(
                      `How can I reach my "${goal.title}" goal of ${formatCurrency(
                        goal.targetAmount,
                        currency
                      )} faster based on my income and current expenses?`
                    )
                  }
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors cursor-pointer"
                  title="Ask advisor for a timeline accelerator"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit / Withdraw Modal */}
      {activeGoalForDeposit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {depositAction === 'deposit' ? 'Contribute to Goal' : 'Withdraw from Goal'}
              </h3>
              <button
                onClick={() => setActiveGoalForDeposit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div className="text-xs text-slate-500">
                Goal: <strong className="text-slate-800">{activeGoalForDeposit.title}</strong>
                <br />
                Current balance:{' '}
                <strong className="text-emerald-700">
                  {formatCurrency(activeGoalForDeposit.currentAmount, currency)}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset.toString())}
                    className="flex-1 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveGoalForDeposit(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer ${
                    depositAction === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {depositAction === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Create Savings Goal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Buffer or Tokyo Vacation"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Starting Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Vacation">Vacation / Travel</option>
                    <option value="Tech & Equipment">Tech & Equipment</option>
                    <option value="Education">Education & Learning</option>
                    <option value="Investment">Investment Capital</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

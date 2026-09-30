import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CreditCard,
  Tag,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../data/categories';
import { ExpenseCategory, ExpenseItem, IncomeItem } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/financeCalculations';

interface ExpenseManagerProps {
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  currency: string;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddIncome: (income: Omit<IncomeItem, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  incomes,
  currency,
  onAddExpense,
  onDeleteExpense,
  onAddIncome,
  onDeleteIncome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'income'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // AI Quick Log State
  const [quickInput, setQuickInput] = useState('');
  const [isParsingQuick, setIsParsingQuick] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Manual Add Expense Modal State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Food & Dining');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expPayment, setExpPayment] = useState<'Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet'>('Card');
  const [expNotes, setExpNotes] = useState('');

  // Manual Add Income Modal State
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [incSource, setIncSource] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incFrequency, setIncFrequency] = useState<'monthly' | 'biweekly' | 'weekly' | 'one-time'>('monthly');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incNotes, setIncNotes] = useState('');

  // Handle AI Quick Parse
  const handleQuickParseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsParsingQuick(true);
    setParseSuccessMsg(null);

    try {
      const res = await fetch('/api/advisor/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickInput,
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('API parse failed');
      const data = await res.json();

      if (data.amount && data.amount > 0) {
        onAddExpense({
          title: data.title || quickInput,
          amount: parseFloat(data.amount),
          category: (data.category as ExpenseCategory) || 'Miscellaneous',
          date: data.date || new Date().toISOString().split('T')[0],
          paymentMethod: 'Card',
          notes: 'Added via AI Smart Log',
        });
        setParseSuccessMsg(`Logged: ${data.title} (${formatCurrency(data.amount, currency)}) in ${data.category}!`);
        setQuickInput('');
        setTimeout(() => setParseSuccessMsg(null), 4000);
      } else {
        fallbackQuickParse(quickInput);
      }
    } catch {
      // Local fallback parsing
      fallbackQuickParse(quickInput);
    } finally {
      setIsParsingQuick(false);
    }
  };

  const fallbackQuickParse = (text: string) => {
    // Basic regex extraction of dollar amount
    const amountMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 25;

    let category: ExpenseCategory = 'Food & Dining';
    const lower = text.toLowerCase();
    if (lower.includes('rent') || lower.includes('apartment')) category = 'Housing';
    else if (lower.includes('grocery') || lower.includes('trader') || lower.includes('market')) category = 'Groceries';
    else if (lower.includes('uber') || lower.includes('gas') || lower.includes('transit') || lower.includes('metro')) category = 'Transportation';
    else if (lower.includes('wifi') || lower.includes('electric') || lower.includes('power') || lower.includes('water')) category = 'Utilities';
    else if (lower.includes('book') || lower.includes('tuition') || lower.includes('class')) category = 'Education';
    else if (lower.includes('movie') || lower.includes('concert') || lower.includes('game')) category = 'Entertainment';

    onAddExpense({
      title: text.replace(/\$?(\d+(?:\.\d{1,2})?)/, '').trim() || 'Quick Expense',
      amount,
      category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Card',
      notes: 'Logged via Quick Smart Log',
    });

    setParseSuccessMsg(`Logged: ${formatCurrency(amount, currency)} in ${category}!`);
    setQuickInput('');
    setTimeout(() => setParseSuccessMsg(null), 4000);
  };

  // Handle Manual Add Expense
  const handleSaveManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddExpense({
      title: expTitle.trim(),
      amount: amountNum,
      category: expCategory,
      date: expDate,
      paymentMethod: expPayment,
      notes: expNotes.trim() || undefined,
    });

    setShowAddExpenseModal(false);
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
  };

  // Handle Manual Add Income
  const handleSaveManualIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(incAmount);
    if (!incSource.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddIncome({
      source: incSource.trim(),
      amount: amountNum,
      frequency: incFrequency,
      date: incDate,
      notes: incNotes.trim() || undefined,
    });

    setShowAddIncomeModal(false);
    setIncSource('');
    setIncAmount('');
    setIncNotes('');
  };

  // Filter & Sort Expenses
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Tabs: Expenses vs Income */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('income')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'income'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income Sources ({incomes.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'expenses' ? (
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddIncomeModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income</span>
            </button>
          )}
        </div>
      </div>

      {/* EXPENSES SUBTAB */}
      {activeSubTab === 'expenses' && (
        <>
          {/* AI Smart Quick Log Bar */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-md">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Natural Language Quick-Log</span>
            </div>
            <form onSubmit={handleQuickParseSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder='Type naturally, e.g. "Lunch at Chipotle $18.50" or "Bought textbooks $75"'
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                disabled={isParsingQuick}
              />
              <button
                type="submit"
                disabled={isParsingQuick || !quickInput.trim()}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                {isParsingQuick ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Log</span>
                  </>
                )}
              </button>
            </form>

            {parseSuccessMsg && (
              <div className="mt-2.5 flex items-center space-x-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{parseSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, notes..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-medium text-slate-500 shrink-0">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Categories</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 w-full md:w-auto text-right font-semibold">
              Showing {filteredExpenses.length} ({formatCurrency(totalFilteredAmount, currency)})
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                        No expenses match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const meta = CATEGORIES_CONFIG[exp.category];
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                            {formatDate(exp.date)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{exp.title}</div>
                            {exp.notes && (
                              <div className="text-xs text-slate-400 mt-0.5">{exp.notes}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${meta?.color || '#94A3B8'}18`,
                                color: meta?.color || '#64748B',
                              }}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {exp.paymentMethod || 'Card'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(exp.amount, currency)}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INCOME SUBTAB */}
      {activeSubTab === 'income' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Recorded Income Sources</h3>
                <p className="text-xs text-slate-500">
                  Fixed salaries, family allowances, freelance retainers, and bonuses
                </p>
              </div>
              <div className="text-right font-bold text-emerald-700 text-sm">
                Total: {formatCurrency(incomes.reduce((acc, i) => acc + i.amount, 0), currency)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Source Name</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(inc.date)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {inc.source}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 capitalize">
                          {inc.frequency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {inc.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        +{formatCurrency(inc.amount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteIncome(inc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record New Expense</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Grocery store run or Dinner with friends"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={expPayment}
                  onChange={(e) => setExpPayment(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Card">Card</option>
                  <option value="Digital Wallet">Digital Wallet (Apple/Google Pay)</option>
                  <option value="Bank Transfer">Bank Transfer / ACH</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="Receipt note or store location"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Income Modal */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Income Source</h3>
              <button
                onClick={() => setShowAddIncomeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualIncome} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Income Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={incSource}
                  onChange={(e) => setIncSource(e.target.value)}
                  placeholder="e.g. Salary, Campus Job, Freelance Retainer"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={incFrequency}
                  onChange={(e) => setIncFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-time">One-time / Bonus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder="e.g. Net after taxes"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Bot,
  FileText,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ExpenseManager } from './components/ExpenseManager';
import { BudgetPlanner } from './components/BudgetPlanner';
import { SavingsGoalsTracker } from './components/SavingsGoalsTracker';
import { AdvisorChat } from './components/AdvisorChat';
import { SpendingInsightsModal } from './components/SpendingInsightsModal';
import { MonthlyReportView } from './components/MonthlyReportView';
import { PurchaseSimulatorModal } from './components/PurchaseSimulatorModal';
import { SCENARIO_PRESETS, ScenarioPreset } from './data/scenarios';
import {
  ExpenseCategory,
  ExpenseItem,
  FinancialAnalysis,
  FinancialPersonaId,
  IncomeItem,
  SavingsGoal,
} from './types/finance';
import {
  calculateFinancialSnapshot,
  generateLocalFinancialAnalysis,
} from './utils/financeCalculations';

export default function App() {
  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'expenses' | 'budget' | 'goals' | 'advisor' | 'report'
  >('overview');

  // Selected Persona / Scenario Preset
  const [currentPersonaId, setCurrentPersonaId] = useState<FinancialPersonaId>('salaried');

  // Currency
  const [currency, setCurrency] = useState<string>('$');

  // Financial Data State
  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem('pfa_incomes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SCENARIO_PRESETS.salaried.incomes;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('pfa_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SCENARIO_PRESETS.salaried.expenses;
  });

  const [budgetLimits, setBudgetLimits] = useState<Record<ExpenseCategory, number>>(() => {
    const saved = localStorage.getItem('pfa_budgetLimits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SCENARIO_PRESETS.salaried.budgetLimits;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('pfa_savingsGoals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SCENARIO_PRESETS.salaried.savingsGoals;
  });

  // Current Persona object
  const currentPersona = useMemo(() => {
    const preset = SCENARIO_PRESETS[currentPersonaId as 'salaried' | 'student' | 'freelancer'];
    return (
      preset?.persona || {
        id: 'salaried',
        name: 'Alex Bennett',
        roleTitle: 'Salaried Professional',
        avatar: '💼',
        description: 'Salaried employee managing monthly budgets and long-term targets.',
        monthlyIncomeBase: 5400,
        typicalNeedsPercent: 50,
        typicalWantsPercent: 30,
        typicalSavingsPercent: 20,
      }
    );
  }, [currentPersonaId]);

  // Modals state
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string | undefined>(undefined);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pfa_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('pfa_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pfa_budgetLimits', JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  useEffect(() => {
    localStorage.setItem('pfa_savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Recalculate Financial Snapshot
  const snapshot = useMemo(() => {
    return calculateFinancialSnapshot(incomes, expenses, budgetLimits, savingsGoals, currentPersona);
  }, [incomes, expenses, budgetLimits, savingsGoals, currentPersona]);

  // AI Diagnostic Analysis State (Computed instantly from snapshot, updated on demand)
  const [analysis, setAnalysis] = useState<FinancialAnalysis>(() =>
    generateLocalFinancialAnalysis(snapshot, currentPersona)
  );
  const [isFetchingAIAnalysis, setIsFetchingAIAnalysis] = useState(false);

  // Keep analysis synchronized with live snapshot
  useEffect(() => {
    setAnalysis(generateLocalFinancialAnalysis(snapshot, currentPersona));
  }, [snapshot, currentPersona]);

  // On-demand AI Deep Diagnostic (called only when user clicks to view or refresh diagnostic)
  const handleTriggerAIAnalysis = async () => {
    try {
      setIsFetchingAIAnalysis(true);
      const res = await fetch('/api/advisor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialSnapshot: snapshot }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.healthScore !== undefined) {
          setAnalysis(data);
        }
      }
    } catch (err) {
      console.warn('Using computed financial analysis:', err);
    } finally {
      setIsFetchingAIAnalysis(false);
    }
  };

  // Handle Scenario Switch
  const handleSelectPersona = (personaId: FinancialPersonaId) => {
    const preset = SCENARIO_PRESETS[personaId as 'salaried' | 'student' | 'freelancer'];
    if (!preset) return;

    setCurrentPersonaId(personaId);
    setIncomes(preset.incomes);
    setExpenses(preset.expenses);
    setBudgetLimits(preset.budgetLimits);
    setSavingsGoals(preset.savingsGoals);
  };

  // Reset to default preset
  const handleResetData = () => {
    const preset = SCENARIO_PRESETS[currentPersonaId as 'salaried' | 'student' | 'freelancer'];
    if (!preset) return;
    setIncomes(preset.incomes);
    setExpenses(preset.expenses);
    setBudgetLimits(preset.budgetLimits);
    setSavingsGoals(preset.savingsGoals);
  };

  // Export Data JSON
  const handleExportData = () => {
    const data = {
      personaId: currentPersonaId,
      incomes,
      expenses,
      budgetLimits,
      savingsGoals,
      currency,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${currentPersonaId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import Data JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.incomes) setIncomes(parsed.incomes);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.budgetLimits) setBudgetLimits(parsed.budgetLimits);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.personaId) setCurrentPersonaId(parsed.personaId);
      } catch (err) {
        console.error('Failed to import JSON file:', err);
      }
    };
    reader.readAsText(file);
  };

  // Expense handlers
  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Income handlers
  const handleAddIncome = (income: Omit<IncomeItem, 'id'>) => {
    const newInc: IncomeItem = {
      ...income,
      id: `inc-${Date.now()}`,
    };
    setIncomes((prev) => [newInc, ...prev]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Budget Limit Handlers
  const handleUpdateBudgetLimit = (category: ExpenseCategory, newLimit: number) => {
    setBudgetLimits((prev) => ({
      ...prev,
      [category]: newLimit,
    }));
  };

  const handleBatchUpdateLimits = (newLimits: Record<ExpenseCategory, number>) => {
    setBudgetLimits(newLimits);
  };

  // Savings Goal Handlers
  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoalAmount = (goalId: string, delta: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updated = Math.max(0, g.currentAmount + delta);
          return { ...g, currentAmount: updated };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Prompt trigger to open advisor with a question
  const handleOpenAdvisorWithPrompt = (prompt: string) => {
    setAdvisorInitialPrompt(prompt);
    setActiveTab('advisor');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        currency={currency}
        onChangeCurrency={setCurrency}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onOpenAdvisor={() => setActiveTab('advisor')}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Navigation Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'expenses', label: 'Expenses & Income', icon: Receipt },
              { id: 'budget', label: 'Budget Planner', icon: PieChart },
              { id: 'goals', label: 'Savings Goals', icon: Target },
              { id: 'advisor', label: 'AI Advisor Bot', icon: Bot, highlight: true },
              { id: 'report', label: 'Monthly Report', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white shadow-xs'
                      : tab.highlight
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            analysis={analysis}
            onOpenAddExpense={() => setActiveTab('expenses')}
            onOpenAddIncome={() => setActiveTab('expenses')}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
            onOpenAnalysis={() => {
              handleTriggerAIAnalysis();
              setShowInsightsModal(true);
            }}
            onOpenSimulator={() => setShowSimulatorModal(true)}
            onOpenGoalDeposit={(goal) => {
              setActiveDepositGoal(goal);
              setActiveTab('goals');
            }}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseManager
            expenses={expenses}
            incomes={incomes}
            currency={currency}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            onBatchUpdateLimits={handleBatchUpdateLimits}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsTracker
            goals={savingsGoals}
            currency={currency}
            monthlySurplus={snapshot.netCashFlow}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {activeTab === 'advisor' && (
          <div className="max-w-4xl mx-auto">
            <AdvisorChat
              snapshot={snapshot}
              persona={currentPersona}
              currency={currency}
              initialPrompt={advisorInitialPrompt}
              onClearInitialPrompt={() => setAdvisorInitialPrompt(undefined)}
            />
          </div>
        )}

        {activeTab === 'report' && (
          <MonthlyReportView
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            analysis={analysis}
            expenses={expenses}
            incomes={incomes}
            onBack={() => setActiveTab('overview')}
          />
        )}
      </main>

      {/* Floating Modals */}
      <SpendingInsightsModal
        analysis={analysis}
        snapshot={snapshot}
        persona={currentPersona}
        currency={currency}
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        onOpenReport={() => {
          setShowInsightsModal(false);
          setActiveTab('report');
        }}
      />

      <PurchaseSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        snapshot={snapshot}
        persona={currentPersona}
        currency={currency}
      />
    </div>
  );
}

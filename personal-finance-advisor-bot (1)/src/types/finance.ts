export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
  | 'Subscriptions'
  | 'Personal Care'
  | 'Debt & Loans'
  | 'Miscellaneous';

export type CategoryClassification = 'needs' | 'wants' | 'savings';

export interface CategoryMeta {
  name: ExpenseCategory;
  classification: CategoryClassification;
  color: string;
  iconName: string;
  defaultAllocationPercent: number; // For automated budget generation
}

export interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'one-time';
  date: string;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod?: 'Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet';
  notes?: string;
  isRecurring?: boolean;
}

export interface BudgetLimit {
  category: ExpenseCategory;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: 'Emergency Fund' | 'Vacation' | 'Tech & Equipment' | 'Education' | 'Investment' | 'Debt Payoff' | 'Other';
  color: string;
  icon: string;
  notes?: string;
}

export type FinancialPersonaId = 'salaried' | 'student' | 'freelancer' | 'custom';

export interface FinancialPersona {
  id: FinancialPersonaId;
  name: string;
  roleTitle: string;
  avatar: string;
  description: string;
  monthlyIncomeBase: number;
  typicalNeedsPercent: number;
  typicalWantsPercent: number;
  typicalSavingsPercent: number;
}

export interface FinancialSnapshot {
  persona: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  overspentCategories: Array<{
    category: ExpenseCategory;
    spent: number;
    budget: number;
    variance: number;
  }>;
  categoryTotals: Record<ExpenseCategory, number>;
  categoryLimits: Record<ExpenseCategory, number>;
  savingsGoals: SavingsGoal[];
}

export interface FinancialAnalysis {
  healthScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  summary: string;
  overspendingCategories: Array<{
    category: string;
    spent: number;
    budget: number;
    variance: number;
    severity: 'warning' | 'critical';
    advice: string;
  }>;
  savingsAnalysis: {
    actualSavings: number;
    savingsRate: number;
    targetRate: number;
    advice: string;
  };
  budgetRuleComparison: {
    needs: { actual: number; percent: number; targetPercent: number };
    wants: { actual: number; percent: number; targetPercent: number };
    savings: { actual: number; percent: number; targetPercent: number };
  };
  actionableTips: string[];
  nextMonthPlan: {
    suggestedSavingsTarget: number;
    categoryCuts: Array<{
      category: string;
      current: number;
      suggested: number;
      potentialSaving: number;
    }>;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickPrompts?: string[];
}

export interface PurchaseSimulationResult {
  verdict: 'SAFE' | 'CAUTION' | 'NOT_RECOMMENDED';
  verdictTitle: string;
  rationale: string;
  impactOnCashFlow: string;
  impactOnSavingsGoals: string;
  recommendedAction: string;
  alternativeTimeline: string;
}

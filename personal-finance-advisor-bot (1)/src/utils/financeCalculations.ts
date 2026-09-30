import { CATEGORIES_CONFIG } from '../data/categories';
import {
  BudgetLimit,
  CategoryClassification,
  ExpenseCategory,
  ExpenseItem,
  FinancialAnalysis,
  FinancialPersona,
  FinancialSnapshot,
  IncomeItem,
  SavingsGoal,
} from '../types/finance';

export const formatCurrency = (amount: number, currency = '$'): string => {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export function calculateFinancialSnapshot(
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  budgetLimits: Record<ExpenseCategory, number>,
  savingsGoals: SavingsGoal[],
  persona: FinancialPersona
): FinancialSnapshot {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netCashFlow / totalIncome) * 100) : 0;

  // Category totals
  const categoryTotals: Record<ExpenseCategory, number> = {} as any;
  for (const cat of Object.keys(CATEGORIES_CONFIG) as ExpenseCategory[]) {
    categoryTotals[cat] = 0;
  }
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }

  // Overspent categories
  const overspentCategories: Array<{
    category: ExpenseCategory;
    spent: number;
    budget: number;
    variance: number;
  }> = [];

  for (const [cat, limit] of Object.entries(budgetLimits) as [ExpenseCategory, number][]) {
    const spent = categoryTotals[cat] || 0;
    if (limit > 0 && spent > limit) {
      overspentCategories.push({
        category: cat,
        spent,
        budget: limit,
        variance: spent - limit,
      });
    }
  }

  // Sort by highest dollar variance
  overspentCategories.sort((a, b) => b.variance - a.variance);

  return {
    persona: persona.name,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    overspentCategories,
    categoryTotals,
    categoryLimits: budgetLimits,
    savingsGoals,
  };
}

export function computeNeedsWantsBreakdown(
  expenses: ExpenseItem[],
  totalIncome: number,
  persona: FinancialPersona
) {
  let needsTotal = 0;
  let wantsTotal = 0;

  for (const exp of expenses) {
    const meta = CATEGORIES_CONFIG[exp.category];
    const classification = meta ? meta.classification : 'wants';
    if (classification === 'needs') {
      needsTotal += exp.amount;
    } else {
      wantsTotal += exp.amount;
    }
  }

  const netSavings = Math.max(0, totalIncome - (needsTotal + wantsTotal));

  const base = totalIncome > 0 ? totalIncome : needsTotal + wantsTotal;
  const needsPercent = base > 0 ? Math.round((needsTotal / base) * 100) : 0;
  const wantsPercent = base > 0 ? Math.round((wantsTotal / base) * 100) : 0;
  const savingsPercent = base > 0 ? Math.round((netSavings / base) * 100) : 0;

  return {
    needs: {
      amount: needsTotal,
      percent: needsPercent,
      targetPercent: persona.typicalNeedsPercent,
    },
    wants: {
      amount: wantsTotal,
      percent: wantsPercent,
      targetPercent: persona.typicalWantsPercent,
    },
    savings: {
      amount: netSavings,
      percent: savingsPercent,
      targetPercent: persona.typicalSavingsPercent,
    },
  };
}

// Compute deterministic fallback analysis when offline or waiting for AI
export function generateLocalFinancialAnalysis(
  snapshot: FinancialSnapshot,
  persona: FinancialPersona
): FinancialAnalysis {
  let score = 50;

  // 1. Savings rate (up to 30 pts)
  const targetSavingsRate = persona.typicalSavingsPercent;
  const savingsRatio = Math.min(1.5, snapshot.savingsRate / targetSavingsRate);
  score += Math.round(savingsRatio * 25);

  // 2. Overspending penalties (deduct up to 30 pts)
  let penalty = 0;
  for (const over of snapshot.overspentCategories) {
    const percentOver = (over.variance / over.budget) * 100;
    if (percentOver > 30) {
      penalty += 10;
    } else {
      penalty += 5;
    }
  }
  score = Math.max(15, Math.min(100, score - penalty));

  let status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  if (score >= 85) status = 'Excellent';
  else if (score >= 70) status = 'Good';
  else if (score >= 50) status = 'Fair';
  else status = 'Needs Attention';

  const overspendingCategories = snapshot.overspentCategories.map((c) => ({
    category: c.category,
    spent: c.spent,
    budget: c.budget,
    variance: c.variance,
    severity: (c.variance / c.budget > 0.25 ? 'critical' : 'warning') as 'warning' | 'critical',
    advice: `Trim ${c.category} by $${c.variance.toFixed(0)} to rebalance your target monthly plan.`,
  }));

  const categoryCuts = snapshot.overspentCategories.map((c) => ({
    category: c.category,
    current: c.spent,
    suggested: c.budget,
    potentialSaving: c.variance,
  }));

  const rule = computeNeedsWantsBreakdown(
    Object.entries(snapshot.categoryTotals).map(([cat, amount], idx) => ({
      id: `pseudo-${idx}`,
      title: cat,
      amount,
      category: cat as ExpenseCategory,
      date: new Date().toISOString(),
    })),
    snapshot.totalIncome,
    persona
  );

  return {
    healthScore: score,
    status,
    summary:
      snapshot.netCashFlow >= 0
        ? `You have a healthy surplus of $${snapshot.netCashFlow.toFixed(2)} this month with a ${snapshot.savingsRate.toFixed(1)}% savings rate. ${
            snapshot.overspentCategories.length > 0
              ? `Watch out for ${snapshot.overspentCategories.map((c) => c.category).join(', ')} to stay within targets.`
              : 'All categories are within your planned limits.'
          }`
        : `Your monthly expenses exceed income by $${Math.abs(snapshot.netCashFlow).toFixed(2)}. Prioritize trimming discretionary dining and non-essential shopping to avoid drawing down savings.`,
    overspendingCategories,
    savingsAnalysis: {
      actualSavings: Math.max(0, snapshot.netCashFlow),
      savingsRate: snapshot.savingsRate,
      targetRate: persona.typicalSavingsPercent,
      advice:
        snapshot.savingsRate >= persona.typicalSavingsPercent
          ? `Outstanding! You are beating your ${persona.typicalSavingsPercent}% savings benchmark.`
          : `Aim to boost savings from ${snapshot.savingsRate.toFixed(1)}% to ${persona.typicalSavingsPercent}% by capping discretionary wants.`,
    },
    budgetRuleComparison: {
      needs: {
        actual: rule.needs.amount,
        percent: rule.needs.percent,
        targetPercent: rule.needs.targetPercent,
      },
      wants: {
        actual: rule.wants.amount,
        percent: rule.wants.percent,
        targetPercent: rule.wants.targetPercent,
      },
      savings: {
        actual: rule.savings.amount,
        percent: rule.savings.percent,
        targetPercent: rule.savings.targetPercent,
      },
    },
    actionableTips: [
      snapshot.overspentCategories.length > 0
        ? `Reduce weekly spending in ${snapshot.overspentCategories[0].category} by $${(snapshot.overspentCategories[0].variance / 4).toFixed(0)}.`
        : 'Maintain weekly meal prep and automated transfers into high-yield savings.',
      'Automate your monthly savings deposits the day after your primary paycheck clears.',
      'Check recurring active subscriptions and cancel unused cloud or streaming apps.',
    ],
    nextMonthPlan: {
      suggestedSavingsTarget: Math.round(snapshot.totalIncome * (persona.typicalSavingsPercent / 100)),
      categoryCuts,
    },
  };
}

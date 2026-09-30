import { CategoryMeta, ExpenseCategory } from '../types/finance';

export const CATEGORIES_CONFIG: Record<ExpenseCategory, CategoryMeta> = {
  Housing: {
    name: 'Housing',
    classification: 'needs',
    color: '#3B82F6', // Blue
    iconName: 'Home',
    defaultAllocationPercent: 28,
  },
  'Food & Dining': {
    name: 'Food & Dining',
    classification: 'wants',
    color: '#F97316', // Orange
    iconName: 'Utensils',
    defaultAllocationPercent: 8,
  },
  Groceries: {
    name: 'Groceries',
    classification: 'needs',
    color: '#10B981', // Emerald
    iconName: 'ShoppingBag',
    defaultAllocationPercent: 12,
  },
  Transportation: {
    name: 'Transportation',
    classification: 'needs',
    color: '#6366F1', // Indigo
    iconName: 'Car',
    defaultAllocationPercent: 9,
  },
  Utilities: {
    name: 'Utilities',
    classification: 'needs',
    color: '#06B6D4', // Cyan
    iconName: 'Zap',
    defaultAllocationPercent: 6,
  },
  Entertainment: {
    name: 'Entertainment',
    classification: 'wants',
    color: '#8B5CF6', // Purple
    iconName: 'Film',
    defaultAllocationPercent: 5,
  },
  Healthcare: {
    name: 'Healthcare',
    classification: 'needs',
    color: '#EF4444', // Red
    iconName: 'HeartPulse',
    defaultAllocationPercent: 5,
  },
  Shopping: {
    name: 'Shopping',
    classification: 'wants',
    color: '#EC4899', // Pink
    iconName: 'Tag',
    defaultAllocationPercent: 6,
  },
  Education: {
    name: 'Education',
    classification: 'needs',
    color: '#14B8A6', // Teal
    iconName: 'GraduationCap',
    defaultAllocationPercent: 4,
  },
  Subscriptions: {
    name: 'Subscriptions',
    classification: 'wants',
    color: '#F43F5E', // Rose
    iconName: 'Tv',
    defaultAllocationPercent: 3,
  },
  'Personal Care': {
    name: 'Personal Care',
    classification: 'wants',
    color: '#D946EF', // Fuchsia
    iconName: 'Sparkles',
    defaultAllocationPercent: 2,
  },
  'Debt & Loans': {
    name: 'Debt & Loans',
    classification: 'needs',
    color: '#64748B', // Slate
    iconName: 'CreditCard',
    defaultAllocationPercent: 5,
  },
  Miscellaneous: {
    name: 'Miscellaneous',
    classification: 'wants',
    color: '#94A3B8', // Gray
    iconName: 'MoreHorizontal',
    defaultAllocationPercent: 2,
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORIES_CONFIG) as ExpenseCategory[];

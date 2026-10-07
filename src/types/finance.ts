export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank' | 'credit_card' | 'promptpay' | 'ewallet';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  isEssential?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  yearMonth: string; // 'YYYY-MM'
  targetBudget: number;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currency?: string;
  defaultMonthlyBudget?: number;
  createdAt?: string;
}

export interface CategoryMeta {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  bgColor: string;
  iconName: string;
  description?: string;
}

export interface MonthlySummaryData {
  yearMonth: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage
  dailyAverageExpense: number;
  essentialExpense: number;
  nonEssentialExpense: number;
  daysInMonth: number;
  daysPassed: number;
  budgetTarget: number | null;
  budgetRemaining: number | null;
  budgetPercentageUsed: number | null;
  categoryBreakdown: {
    category: string;
    label: string;
    amount: number;
    percentage: number;
    color: string;
    count: number;
  }[];
  incomeBreakdown: {
    category: string;
    label: string;
    amount: number;
    percentage: number;
    color: string;
    count: number;
  }[];
  dailyTrend: {
    date: string;
    day: number;
    income: number;
    expense: number;
  }[];
}

import { Transaction, MonthlySummaryData, MonthlyBudget } from '../types/finance';
import { getCategoryMeta } from '../constants/categories';

export function calculateMonthlySummary(
  transactions: Transaction[],
  yearMonth: string,
  budget: MonthlyBudget | null
): MonthlySummaryData {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Find how many days have passed in this month if current month
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let daysPassed = daysInMonth;
  if (yearMonth === currentYearMonth) {
    daysPassed = Math.max(1, now.getDate());
  }

  // Filter transactions for this month
  const monthlyTx = transactions.filter((t) => t.date.startsWith(yearMonth));

  let totalIncome = 0;
  let totalExpense = 0;
  let essentialExpense = 0;
  let nonEssentialExpense = 0;

  const expenseCategoryMap: Record<string, { amount: number; count: number }> = {};
  const incomeCategoryMap: Record<string, { amount: number; count: number }> = {};

  // Initialize daily trend for all days in month
  const dailyTrend: { date: string; day: number; income: number; expense: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPad = String(d).padStart(2, '0');
    dailyTrend.push({
      date: `${yearMonth}-${dayPad}`,
      day: d,
      income: 0,
      expense: 0
    });
  }

  monthlyTx.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    const dayNum = parseInt(tx.date.split('-')[2], 10);
    const dayItem = dailyTrend[dayNum - 1];

    if (tx.type === 'income') {
      totalIncome += amt;
      if (dayItem) dayItem.income += amt;
      if (!incomeCategoryMap[tx.category]) {
        incomeCategoryMap[tx.category] = { amount: 0, count: 0 };
      }
      incomeCategoryMap[tx.category].amount += amt;
      incomeCategoryMap[tx.category].count += 1;
    } else {
      totalExpense += amt;
      if (dayItem) dayItem.expense += amt;
      if (tx.isEssential !== false) {
        essentialExpense += amt;
      } else {
        nonEssentialExpense += amt;
      }

      if (!expenseCategoryMap[tx.category]) {
        expenseCategoryMap[tx.category] = { amount: 0, count: 0 };
      }
      expenseCategoryMap[tx.category].amount += amt;
      expenseCategoryMap[tx.category].count += 1;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const dailyAverageExpense = daysPassed > 0 ? Math.round(totalExpense / daysPassed) : 0;

  // Process category breakdowns
  const categoryBreakdown = Object.entries(expenseCategoryMap)
    .map(([catId, data]) => {
      const meta = getCategoryMeta(catId, 'expense');
      const percentage = totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0;
      return {
        category: catId,
        label: meta.name,
        amount: data.amount,
        percentage,
        color: meta.color,
        count: data.count
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const incomeBreakdown = Object.entries(incomeCategoryMap)
    .map(([catId, data]) => {
      const meta = getCategoryMeta(catId, 'income');
      const percentage = totalIncome > 0 ? Math.round((data.amount / totalIncome) * 100) : 0;
      return {
        category: catId,
        label: meta.name,
        amount: data.amount,
        percentage,
        color: meta.color,
        count: data.count
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const budgetTarget = budget ? budget.targetBudget : null;
  const budgetRemaining = budgetTarget !== null ? budgetTarget - totalExpense : null;
  const budgetPercentageUsed = budgetTarget && budgetTarget > 0 ? Math.round((totalExpense / budgetTarget) * 100) : null;

  return {
    yearMonth,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    dailyAverageExpense,
    essentialExpense,
    nonEssentialExpense,
    daysInMonth,
    daysPassed,
    budgetTarget,
    budgetRemaining,
    budgetPercentageUsed,
    categoryBreakdown,
    incomeBreakdown,
    dailyTrend
  };
}

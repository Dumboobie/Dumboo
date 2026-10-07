import React, { useState } from 'react';
import { MonthlySummaryData } from '../types/finance';
import { formatCurrency } from '../constants/categories';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Target, 
  Edit3, 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthlySummaryData;
  onOpenBudgetModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onOpenBudgetModal }) => {
  const isSurplus = summary.netSavings >= 0;
  const hasBudget = summary.budgetTarget !== null && summary.budgetTarget > 0;
  const isOverBudget = hasBudget && summary.totalExpense > (summary.budgetTarget || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวม (Income)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(summary.totalIncome)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{summary.incomeBreakdown.length} หมวดหมู่รายรับ</span>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวม (Expense)
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(summary.totalExpense)}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>เฉลี่ยวันละ {formatCurrency(summary.dailyAverageExpense)}</span>
          <span className="font-mono text-slate-400">{summary.categoryBreakdown.length} หมวด</span>
        </div>
      </div>

      {/* 3. Net Balance / Savings */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            เงินคงเหลือสุทธิ (Net Balance)
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isSurplus ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl font-extrabold tracking-tight ${
          isSurplus ? 'text-indigo-950' : 'text-rose-600'
        }`}>
          {formatCurrency(summary.netSavings)}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-500" />
            <span>อัตราการออม</span>
          </div>
          <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
            summary.savingsRate >= 20 
              ? 'bg-emerald-100 text-emerald-800' 
              : summary.savingsRate > 0 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-rose-100 text-rose-800'
          }`}>
            {summary.savingsRate}%
          </span>
        </div>
      </div>

      {/* 4. Monthly Budget Progress */}
      <div className={`rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all ${
        isOverBudget 
          ? 'bg-rose-50/50 border-rose-200' 
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              งบประมาณเดือนนี้
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="แก้ไขงบประมาณ"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasBudget ? (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(summary.budgetTarget!)}
              </span>
              <span className={`text-xs font-bold ${
                isOverBudget ? 'text-rose-600' : 'text-slate-600'
              }`}>
                {summary.budgetPercentageUsed}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget 
                    ? 'bg-rose-500' 
                    : (summary.budgetPercentageUsed || 0) > 85 
                      ? 'bg-amber-500' 
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, summary.budgetPercentageUsed || 0)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              {isOverBudget ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  เกินงบ {formatCurrency(Math.abs(summary.budgetRemaining!))}
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  เหลืองบ {formatCurrency(summary.budgetRemaining!)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-xs text-slate-500 mb-2">ยังไม่ได้ตั้งเป้าหมายงบประมาณเดือนนี้</p>
            <button
              type="button"
              onClick={onOpenBudgetModal}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors w-full text-center"
            >
              + ตั้งงบประมาณรายจ่าย
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

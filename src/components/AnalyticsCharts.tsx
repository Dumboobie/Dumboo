import React, { useState } from 'react';
import { MonthlySummaryData } from '../types/finance';
import { formatCurrency, formatThaiDate } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { PieChart, BarChart3, TrendingDown, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: MonthlySummaryData;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ summary }) => {
  const [activeCategoryType, setActiveCategoryType] = useState<'expense' | 'income'>('expense');
  const [hoveredDailyIndex, setHoveredDailyIndex] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const categories = activeCategoryType === 'expense' ? summary.categoryBreakdown : summary.incomeBreakdown;
  const totalAmount = activeCategoryType === 'expense' ? summary.totalExpense : summary.totalIncome;

  // Find max daily amount for chart scale
  const maxDaily = Math.max(
    ...summary.dailyTrend.map((d) => Math.max(d.income, d.expense)),
    100
  );

  // Find peak spending day
  const peakExpenseDay = summary.dailyTrend.reduce((prev, current) => 
    (current.expense > prev.expense) ? current : prev
  , summary.dailyTrend[0]);

  // Donut chart math
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const donutSlices = categories.map((cat) => {
    const fraction = totalAmount > 0 ? cat.amount / totalAmount : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Section: Category Breakdown + Essential vs Discretionary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Donut & List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                สัดส่วนตามหมวดหมู่
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกสลับเพื่อดูโครงสร้างรายจ่ายหรือรายรับ
              </p>
            </div>
            
            {/* Toggle buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveCategoryType('expense')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeCategoryType === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายจ่าย ({summary.categoryBreakdown.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryType('income')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeCategoryType === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายรับ ({summary.incomeBreakdown.length})
              </button>
            </div>
          </div>

          {totalAmount === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-3">
                <PieChart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">ยังไม่มีข้อมูล{activeCategoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">กดปุ่ม "+ บันทึกรายการ" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* SVG Donut */}
              <div className="relative w-52 h-52 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="24"
                  />
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredSlice === slice.category;
                    return (
                      <circle
                        key={slice.category}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 28 : 24}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice.category)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {hoveredSlice 
                      ? categories.find(c => c.category === hoveredSlice)?.label 
                      : (activeCategoryType === 'expense' ? 'รวมรายจ่าย' : 'รวมรายรับ')}
                  </span>
                  <span className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                    {formatCurrency(
                      hoveredSlice 
                        ? (categories.find(c => c.category === hoveredSlice)?.amount || 0)
                        : totalAmount
                    )}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {hoveredSlice 
                      ? `${categories.find(c => c.category === hoveredSlice)?.percentage || 0}%`
                      : '100%'}
                  </span>
                </div>
              </div>

              {/* Category Breakdown Progress List */}
              <div className="flex-1 w-full space-y-3 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isHovered = hoveredSlice === cat.category;
                  return (
                    <div
                      key={cat.category}
                      onMouseEnter={() => setHoveredSlice(cat.category)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">{cat.label}</span>
                          <span className="text-[11px] text-slate-400">({cat.count} รายการ)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(cat.amount)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono w-8 text-right">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Bar progress */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(2, cat.percentage)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right (5 cols): Needs vs Wants & Financial Health Insight */}
        <div className="lg:col-span-5 space-y-6">
          {/* Essential vs Discretionary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              ความจำเป็นของการใช้จ่าย
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              แยกแยะระหว่างค่าใช้จ่ายที่จำเป็น และสิ่งที่ให้ความสุข/สิ้นเปลือง
            </p>

            {summary.totalExpense === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลรายจ่าย</p>
            ) : (
              <div className="space-y-4">
                {/* 2-color segmented bar */}
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${(summary.essentialExpense / summary.totalExpense) * 100}%`
                    }}
                    title={`จำเป็น: ${formatCurrency(summary.essentialExpense)}`}
                  />
                  <div
                    className="h-full bg-rose-400 transition-all duration-500"
                    style={{
                      width: `${(summary.nonEssentialExpense / summary.totalExpense) * 100}%`
                    }}
                    title={`สิ้นเปลือง/ตามใจ: ${formatCurrency(summary.nonEssentialExpense)}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold mb-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      ค่าใช้จ่ายจำเป็น
                    </div>
                    <div className="text-base font-bold text-indigo-950">
                      {formatCurrency(summary.essentialExpense)}
                    </div>
                    <div className="text-[11px] text-indigo-600 mt-0.5">
                      {Math.round((summary.essentialExpense / summary.totalExpense) * 100)}% ของรายจ่าย
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                    <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      ตามใจ / ไม่จำเป็น
                    </div>
                    <div className="text-base font-bold text-rose-950">
                      {formatCurrency(summary.nonEssentialExpense)}
                    </div>
                    <div className="text-[11px] text-rose-600 mt-0.5">
                      {Math.round((summary.nonEssentialExpense / summary.totalExpense) * 100)}% ของรายจ่าย
                    </div>
                  </div>
                </div>

                {/* Advice banner */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 border border-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    {summary.essentialExpense >= summary.nonEssentialExpense ? (
                      <span>คุณควบคุมค่าใช้จ่ายจำเป็นได้ดีกว่าตามใจตนเอง รักษาวินัยต่อไปครับ!</span>
                    ) : (
                      <span>ค่าใช้จ่ายตามใจมากกว่าค่าจำเป็น ลองทบทวนหมวดหมู่ที่ไม่จำเป็นเพื่อเพิ่มเงินออม</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Peak Spending Day Info */}
          {peakExpenseDay && peakExpenseDay.expense > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-2xl p-5 border border-amber-200/60">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                วันที่มีการใช้จ่ายสูงสุดในเดือนนี้
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <div className="text-xl font-bold text-slate-800">
                    {formatThaiDate(peakExpenseDay.date)}
                  </div>
                  <div className="text-xs text-slate-500">
                    วันที่มีบิลจ่ายหนักที่สุดของเดือน
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-rose-600">
                    {formatCurrency(peakExpenseDay.expense)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {Math.round((peakExpenseDay.expense / summary.totalExpense) * 100)}% ของยอดรวม
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Daily Trend Bar Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              แนวโน้มรายรับ-รายจ่ายรายวัน (Daily Flow)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงการไหลเวียนของเงินในแต่ละวันตลอดทั้งเดือน
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              รายรับ
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              รายจ่าย
            </div>
          </div>
        </div>

        {/* Daily Bars Container */}
        <div className="pt-8 pb-4 overflow-x-auto">
          <div className="min-w-[650px]">
            {/* Chart Grid Height */}
            <div className="h-44 w-full flex items-end gap-1.5 border-b border-slate-200 relative pb-1">
              {/* Guidelines */}
              <div className="absolute inset-x-0 top-0 border-t border-slate-100" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100" />

              {summary.dailyTrend.map((dayData, idx) => {
                const incomeHeightPct = maxDaily > 0 ? (dayData.income / maxDaily) * 100 : 0;
                const expenseHeightPct = maxDaily > 0 ? (dayData.expense / maxDaily) * 100 : 0;
                const isHovered = hoveredDailyIndex === idx;

                return (
                  <div
                    key={dayData.date}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredDailyIndex(idx)}
                    onMouseLeave={() => setHoveredDailyIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 z-20 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none whitespace-nowrap -translate-x-1/2 left-1/2">
                        <div className="font-semibold text-slate-200 mb-1">
                          {formatThaiDate(dayData.date)}
                        </div>
                        <div className="text-emerald-400 flex items-center justify-between gap-3">
                          <span>รายรับ:</span>
                          <span className="font-mono">{formatCurrency(dayData.income)}</span>
                        </div>
                        <div className="text-rose-400 flex items-center justify-between gap-3">
                          <span>รายจ่าย:</span>
                          <span className="font-mono">{formatCurrency(dayData.expense)}</span>
                        </div>
                        <div className="text-slate-300 border-t border-slate-800 mt-1 pt-1 flex items-between justify-between gap-3 text-[11px]">
                          <span>สุทธิ:</span>
                          <span className={`font-mono font-bold ${
                            dayData.income - dayData.expense >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatCurrency(dayData.income - dayData.expense)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Income Bar */}
                      <div
                        className={`w-full max-w-[8px] bg-emerald-500 rounded-t-sm transition-all duration-300 ${
                          isHovered ? 'bg-emerald-400 brightness-110' : ''
                        }`}
                        style={{ height: `${Math.max(dayData.income > 0 ? 4 : 0, incomeHeightPct)}%` }}
                      />
                      {/* Expense Bar */}
                      <div
                        className={`w-full max-w-[8px] bg-rose-500 rounded-t-sm transition-all duration-300 ${
                          isHovered ? 'bg-rose-400 brightness-110' : ''
                        }`}
                        style={{ height: `${Math.max(dayData.expense > 0 ? 4 : 0, expenseHeightPct)}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[10px] mt-2 font-mono ${
                      isHovered ? 'text-indigo-600 font-bold' : 'text-slate-400'
                    }`}>
                      {dayData.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
              <span>วันที่ 1 ของเดือน</span>
              <span className="text-[11px] font-medium text-slate-500">
                ค่าเฉลี่ยรายจ่ายต่อวัน: {formatCurrency(summary.dailyAverageExpense)}
              </span>
              <span>วันที่ {summary.daysInMonth} ของเดือน</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

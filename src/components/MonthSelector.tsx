import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { THAI_MONTH_NAMES } from '../constants/categories';

interface MonthSelectorProps {
  currentYearMonth: string;
  onChangeMonth: (yearMonth: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentYearMonth, onChangeMonth }) => {
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonth = parseInt(monthStr, 10); // 1-12

  const today = new Date();
  const todayYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = currentYearMonth === todayYearMonth;

  const handlePrevMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleSelectYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeMonth(`${e.target.value}-${String(currentMonth).padStart(2, '0')}`);
  };

  const handleSelectMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeMonth(`${currentYear}-${e.target.value}`);
  };

  const thaiMonthName = THAI_MONTH_NAMES[currentMonth - 1];
  const thaiBuddhistYear = currentYear + 543;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Month & Year Title with Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="เดือนก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-5 h-5 text-indigo-600 hidden sm:block" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {thaiMonthName}
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-500">
              {thaiBuddhistYear}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="เดือนถัดไป"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Selectors and "Today" button */}
      <div className="flex items-center gap-2">
        {/* Month Dropdown */}
        <select
          value={String(currentMonth).padStart(2, '0')}
          onChange={handleSelectMonth}
          className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {THAI_MONTH_NAMES.map((m, idx) => {
            const val = String(idx + 1).padStart(2, '0');
            return (
              <option key={val} value={val}>
                {m}
              </option>
            );
          })}
        </select>

        {/* Year Dropdown */}
        <select
          value={String(currentYear)}
          onChange={handleSelectYear}
          className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
            <option key={y} value={y}>
              {y + 543} ({y})
            </option>
          ))}
        </select>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onChangeMonth(todayYearMonth)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            เดือนปัจจุบัน
          </button>
        )}
      </div>
    </div>
  );
};

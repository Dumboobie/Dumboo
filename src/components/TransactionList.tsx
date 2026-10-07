import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types/finance';
import { 
  formatCurrency, 
  formatThaiDate, 
  getCategoryMeta, 
  PAYMENT_METHODS, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES 
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Sparkles,
  Inbox,
  X
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  yearMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => Promise<void>;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  yearMonth,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEssential, setFilterEssential] = useState<'all' | 'essential' | 'non_essential'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter items for the selected month
  const monthlyItems = transactions.filter((t) => t.date.startsWith(yearMonth));

  // Apply filters
  const filteredItems = monthlyItems.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterEssential === 'essential' && t.type === 'expense' && t.isEssential === false) return false;
    if (filterEssential === 'non_essential' && t.type === 'expense' && t.isEssential !== false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = getCategoryMeta(t.category, t.type);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchCat = meta.name.toLowerCase().includes(q);
      if (!matchTitle && !matchNote && !matchCat) return false;
    }
    return true;
  });

  // Group by date
  const groupedByDate: Record<string, Transaction[]> = {};
  filteredItems.forEach((item) => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = [];
    }
    groupedByDate[item.date].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const handleDeleteClick = async (txId: string, title: string) => {
    if (confirm(`คุณต้องการลบรายการ "${title}" ใช่หรือไม่?`)) {
      setDeletingId(txId);
      try {
        await onDelete(txId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header and Filter Bar */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              รายการทั้งหมดในเดือนนี้
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {filteredItems.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาและจัดการบันทึกรายรับ-รายจ่าย
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="self-start sm:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            + บันทึกรายการใหม่
          </button>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อรายการ, หมวดหมู่, บันทึก..."
              className="w-full text-xs text-slate-800 pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setFilterCategory('all');
              }}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">ทุกประเภท (ทั้งหมด)</option>
              <option value="expense">เฉพาะรายจ่าย</option>
              <option value="income">เฉพาะรายรับ</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {filterType === 'income' ? (
                INCOME_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : filterType === 'expense' ? (
                EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                allCategories.map((c) => (
                  <option key={`${c.type}_${c.id}`} value={c.id}>
                    [{c.type === 'income' ? 'รับ' : 'จ่าย'}] {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Grouped Content */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-600">ไม่พบรายการบันทึก</p>
            <p className="text-xs text-slate-400 mt-1">
              {monthlyItems.length === 0
                ? 'ยังไม่มีรายการใดๆ ในเดือนนี้ เริ่มต้นบันทึกเพื่อดูสรุปผล'
                : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา/ตัวกรอง'}
            </p>
            {monthlyItems.length === 0 && (
              <button
                type="button"
                onClick={onAddNew}
                className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors"
              >
                + บันทึกรายการแรกของเดือนนี้
              </button>
            )}
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const items = groupedByDate[dateStr];
            const dailyIncome = items.filter((i) => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
            const dailyExpense = items.filter((i) => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);

            return (
              <div key={dateStr} className="p-4 sm:p-5">
                {/* Date header & Daily totals */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">
                      {formatThaiDate(dateStr)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    {dailyIncome > 0 && (
                      <span className="text-emerald-600 font-mono">
                        +{formatCurrency(dailyIncome)}
                      </span>
                    )}
                    {dailyExpense > 0 && (
                      <span className="text-rose-600 font-mono">
                        -{formatCurrency(dailyExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in this date */}
                <div className="space-y-2">
                  {items.map((tx) => {
                    const meta = getCategoryMeta(tx.category, tx.type);
                    const isExpense = tx.type === 'expense';
                    const paymentMethodMeta = PAYMENT_METHODS.find((p) => p.id === tx.paymentMethod);

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200/60 group"
                      >
                        {/* Left Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Category Badge Icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: meta.bgColor, color: meta.color }}
                          >
                            <CategoryIcon name={meta.iconName} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 truncate">
                                {tx.title}
                              </span>
                              {isExpense && tx.isEssential === false && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                  ตามใจ
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                              <span className="font-medium text-slate-600">{meta.name}</span>
                              {paymentMethodMeta && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400">{paymentMethodMeta.label}</span>
                                </>
                              )}
                              {tx.note && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400 italic truncate max-w-[160px]">"{tx.note}"</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount and Actions */}
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <div className="text-right">
                            <div
                              className={`text-sm sm:text-base font-extrabold font-mono tracking-tight ${
                                isExpense ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {isExpense ? '-' : '+'}
                              {formatCurrency(tx.amount)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="แก้ไขรายการ"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(tx.id, tx.title)}
                              disabled={deletingId === tx.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

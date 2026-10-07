import React, { useState } from 'react';
import { Target, X, Check, AlertCircle } from 'lucide-react';
import { formatCurrency, formatThaiMonthYear } from '../constants/categories';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearMonth: string;
  currentBudget: number | null;
  onSaveBudget: (amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  yearMonth,
  currentBudget,
  onSaveBudget
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(
    currentBudget ? String(currentBudget) : '20000'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(budgetInput);
    if (isNaN(num) || num < 0) {
      setError('กรุณาระบุจำนวนงบประมาณที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveBudget(num);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRESETS = [10000, 15000, 20000, 30000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                ตั้งงบประมาณรายจ่าย
              </h2>
              <p className="text-xs text-slate-500">
                ประจำเดือน {formatThaiMonthYear(yearMonth)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              วงเงินงบประมาณสูงสุดของเดือนนี้ (บาท ฿)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="20,000"
                className="w-full text-2xl font-extrabold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
                required
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ฿
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              งบประมาณยอดนิยม:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBudgetInput(String(p))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors"
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            ระบบจะคอยคำนวณและแจ้งเตือนสถานะเมื่อรายจ่ายสะสมใกล้ถึงหรือเกินวงเงินที่กำหนดไว้
          </p>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

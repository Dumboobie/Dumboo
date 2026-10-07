import React from 'react';
import { QUICK_PRESETS } from '../constants/categories';
import { Transaction } from '../types/finance';
import { Zap, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickShortcutsProps {
  onQuickAdd: (preset: typeof QUICK_PRESETS[0]) => Promise<void>;
  yearMonth: string;
}

export const QuickShortcuts: React.FC<QuickShortcutsProps> = ({ onQuickAdd, yearMonth }) => {
  const handlePresetClick = async (preset: typeof QUICK_PRESETS[0]) => {
    try {
      await onQuickAdd(preset);
      // Small celebratory confetti burst
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b']
      });
    } catch {
      // handled in parent
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-100/70 rounded-2xl p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              บันทึกด่วน 1-คลิก (Quick Shortcuts)
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline ml-2">
              คลิกเพื่อบันทึกรายการยอดฮิตได้ทันที
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => handlePresetClick(p)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold shadow-2xs border border-slate-200/80 transition-all flex items-center gap-1.5 shrink-0 group active:scale-95"
            >
              <Plus className="w-3 h-3 text-indigo-500 group-hover:text-white" />
              <span>{p.title}</span>
              <span className="font-mono text-slate-400 group-hover:text-indigo-100">
                {p.amount}฿
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

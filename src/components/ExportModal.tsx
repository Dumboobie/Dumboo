import React, { useState } from 'react';
import { Transaction, MonthlySummaryData } from '../types/finance';
import { 
  formatCurrency, 
  formatThaiDate, 
  formatThaiMonthYear, 
  getCategoryMeta, 
  PAYMENT_METHODS 
} from '../constants/categories';
import { Download, Copy, Check, X, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearMonth: string;
  transactions: Transaction[];
  summary: MonthlySummaryData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  yearMonth,
  transactions,
  summary
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const monthlyTx = transactions.filter((t) => t.date.startsWith(yearMonth));

  // CSV Export logic with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายการ', 'จำนวนเงิน (บาท)', 'วิธีชำระเงิน', 'จำเป็น/สิ้นเปลือง', 'บันทึกช่วยจำ'];
    
    const rows = monthlyTx.map((t) => {
      const meta = getCategoryMeta(t.category, t.type);
      const payment = PAYMENT_METHODS.find((p) => p.id === t.paymentMethod)?.label || '';
      const essentialText = t.type === 'expense' ? (t.isEssential !== false ? 'จำเป็น' : 'ตามใจ/สิ้นเปลือง') : '-';
      
      return [
        `"${t.date}"`,
        `"${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
        `"${meta.name}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${payment}"`,
        `"${essentialText}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dumboo_Financial_Report_${yearMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate plain text summary for copying to LINE / Notes
  const textSummary = `📊 สรุปรายรับรายจ่ายประจำเดือน: ${formatThaiMonthYear(yearMonth)} (Dumboo)
----------------------------------------
💰 รายรับรวม: ${formatCurrency(summary.totalIncome)}
💸 รายจ่ายรวม: ${formatCurrency(summary.totalExpense)}
🎯 เงินคงเหลือสุทธิ: ${formatCurrency(summary.netSavings)}
📈 อัตราการออม: ${summary.savingsRate}%
📅 เฉลี่ยรายจ่ายต่อวัน: ${formatCurrency(summary.dailyAverageExpense)}

🏆 3 อันดับรายจ่ายสูงสุด:
${summary.categoryBreakdown.slice(0, 3).map((c, i) => `${i + 1}. ${c.label}: ${formatCurrency(c.amount)} (${c.percentage}%)`).join('\n') || '- ไม่มีข้อมูล'}

บันทึกผ่านเว็บจัดการรายรับรายจ่าย Dumboo`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                ส่งออกข้อมูล & สรุปผลรายงาน
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

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* CSV Download Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  ดาวน์โหลดไฟล์ CSV (Excel)
                </h4>
                <p className="text-xs text-slate-500">
                  รองรับภาษาไทย พร้อมข้อมูลทั้งหมด {monthlyTx.length} รายการ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={monthlyTx.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </button>
          </div>

          {/* Copy Summary Text Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                ข้อความสรุปผล (สำหรับแชร์ LINE / บันทึกย่อ)
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกข้อความ</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={textSummary}
              rows={8}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

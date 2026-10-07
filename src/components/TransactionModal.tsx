import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types/finance';
import { 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  PAYMENT_METHODS, 
  getCategoryMeta 
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { X, Plus, Check, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => Promise<void>;
  editingTransaction?: Transaction | null;
  defaultDate?: string;
  userId: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultDate,
  userId,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isEssential, setIsEssential] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setTitle(editingTransaction.title);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'cash');
      setIsEssential(editingTransaction.isEssential !== false);
      setNote(editingTransaction.note || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory('food');
      setDate(defaultDate || today);
      setPaymentMethod('cash');
      setIsEssential(true);
      setNote('');
    }
    setErrorMessage('');
  }, [editingTransaction, defaultDate, isOpen]);

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('food');
    } else {
      setCategory('salary');
    }
  };

  const handleAddPreset = (addon: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addon));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อรายการ');
      return;
    }

    if (!date) {
      setErrorMessage('กรุณาเลือกวันที่');
      return;
    }

    setIsSubmitting(true);
    try {
      const id = editingTransaction?.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload: Transaction = {
        id,
        userId,
        type,
        amount: Math.round(numericAmount * 100) / 100,
        category,
        date,
        title: title.trim().slice(0, 120),
        note: note.trim().slice(0, 500) || undefined,
        paymentMethod,
        isEssential: type === 'expense' ? isEssential : undefined,
        createdAt: editingTransaction?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingTransaction ? 'ปรับปรุงข้อมูลรายการรายรับรายจ่าย' : 'เพิ่มรายรับหรือรายจ่ายเข้าสู่ระบบ Dumboo'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท ฿) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-extrabold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-300 font-mono"
                required
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                THB ฿
              </span>
            </div>

            {/* Quick add buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[+20, +50, +100, +500, +1000].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleAddPreset(num)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่อรายการ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'เช่น ข้าวมื้อเที่ยง, ค่ากาแฟ, น้ำมันรถ' : 'เช่น เงินเดือน, โบนัส, ขายของ'}
              className="w-full text-sm text-slate-900 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              maxLength={120}
              required
            />
          </div>

          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              หมวดหมู่ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                วันที่ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If Expense: Essential vs Want Toggle */}
          {type === 'expense' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  ประเภทความจำเป็น
                </span>
                <span className="text-[11px] text-slate-500">
                  {isEssential ? 'ค่าใช้จ่ายจำเป็น (Needs) สำคัญต่อการใช้ชีวิต' : 'ค่าใช้จ่ายตามใจ/ฟุ่มเฟือย (Wants)'}
                </span>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEssential(true)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    isEssential
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  จำเป็น
                </button>
                <button
                  type="button"
                  onClick={() => setIsEssential(false)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    !isEssential
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ตามใจ
                </button>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม เช่น ร้านค้า, สมาชิกที่หารด้วย..."
              rows={2}
              className="w-full text-xs text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
              maxLength={500}
            />
          </div>

          {/* Action Buttons */}
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
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-500/20'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

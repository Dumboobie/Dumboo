/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  testConnection,
  subscribeUserTransactions, 
  subscribeMonthlyBudget, 
  saveTransaction, 
  removeTransaction, 
  saveMonthlyBudget 
} from './lib/firebase';
import { Transaction, MonthlyBudget } from './types/finance';
import { calculateMonthlySummary } from './utils/calculations';
import { generateSampleTransactions } from './utils/sampleData';
import { Navbar } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ExportModal } from './components/ExportModal';
import { QuickShortcuts } from './components/QuickShortcuts';
import { QUICK_PRESETS } from './constants/categories';
import { 
  Database, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  PieChart, 
  ListOrdered 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Month navigation: defaults to current year-month (e.g. 2026-10)
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [currentTab, setCurrentTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Connection check on mount
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscriptions & Data Loading
  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      // User is authenticated: Subscribe to real Firestore subcollections
      const unsubTx = subscribeUserTransactions(
        user.uid,
        (items) => {
          setTransactions(items);
        },
        (err) => {
          console.error("Transactions subscribe error:", err);
          showToast("ไม่สามารถโหลดข้อมูลจาก Firebase ได้", "error");
        }
      );

      const unsubBudget = subscribeMonthlyBudget(
        user.uid,
        currentYearMonth,
        (budget) => {
          setMonthlyBudget(budget);
        }
      );

      return () => {
        unsubTx();
        unsubBudget();
      };
    } else {
      // Guest / Demo mode: Load from localStorage or rich sample data
      const localDataKey = `dumboo_local_tx_${currentYearMonth}`;
      const savedLocal = localStorage.getItem('dumboo_local_transactions');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          setTransactions(parsed);
        } catch {
          const initial = generateSampleTransactions();
          setTransactions(initial);
          localStorage.setItem('dumboo_local_transactions', JSON.stringify(initial));
        }
      } else {
        const initial = generateSampleTransactions();
        setTransactions(initial);
        localStorage.setItem('dumboo_local_transactions', JSON.stringify(initial));
      }

      // Local budget
      const localBudgetKey = `dumboo_budget_${currentYearMonth}`;
      const savedBudget = localStorage.getItem(localBudgetKey);
      if (savedBudget) {
        try {
          setMonthlyBudget(JSON.parse(savedBudget));
        } catch {
          setMonthlyBudget({
            id: currentYearMonth,
            userId: 'guest',
            yearMonth: currentYearMonth,
            targetBudget: 25000,
          });
        }
      } else {
        setMonthlyBudget({
          id: currentYearMonth,
          userId: 'guest',
          yearMonth: currentYearMonth,
          targetBudget: 25000,
        });
      }
    }
  }, [user, isAuthLoading, currentYearMonth]);

  // Compute monthly calculations and aggregations
  const summary = useMemo(() => {
    return calculateMonthlySummary(transactions, currentYearMonth, monthlyBudget);
  }, [transactions, currentYearMonth, monthlyBudget]);

  // Handle Login & Logout
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        showToast(`ยินดีต้อนรับคุณ ${loggedUser.displayName || 'ผู้ใช้งาน'}! เชื่อมต่อ Firebase สำเร็จ`);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast("เข้าสู่ระบบไม่สำเร็จ หรือคุณได้ยกเลิกหน้าต่าง", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast("ออกจากระบบเรียบร้อยแล้ว");
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการออกจากระบบ", "error");
    }
  };

  // Transaction Actions
  const handleSaveTx = async (tx: Transaction) => {
    if (user) {
      await saveTransaction(user.uid, tx);
      showToast(editingTx ? "แก้ไขรายการใน Firebase เรียบร้อย" : "บันทึกรายการลง Firebase สำเร็จ");
    } else {
      // Local storage update
      const updated = editingTx
        ? transactions.map((t) => (t.id === tx.id ? tx : t))
        : [tx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('dumboo_local_transactions', JSON.stringify(updated));
      showToast(editingTx ? "แก้ไขรายการเรียบร้อย" : "บันทึกรายการเรียบร้อย");
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (user) {
      await removeTransaction(user.uid, txId);
      showToast("ลบรายการออกจาก Firebase เรียบร้อยแล้ว");
    } else {
      const updated = transactions.filter((t) => t.id !== txId);
      setTransactions(updated);
      localStorage.setItem('dumboo_local_transactions', JSON.stringify(updated));
      showToast("ลบรายการเรียบร้อยแล้ว");
    }
  };

  // Budget Actions
  const handleSaveBudget = async (amount: number) => {
    if (user) {
      await saveMonthlyBudget(user.uid, currentYearMonth, amount);
      showToast(`ตั้งงบประมาณเดือนนี้เป็น ${amount.toLocaleString()} บาท เรียบร้อย`);
    } else {
      const b: MonthlyBudget = {
        id: currentYearMonth,
        userId: 'guest',
        yearMonth: currentYearMonth,
        targetBudget: amount,
        updatedAt: new Date().toISOString()
      };
      setMonthlyBudget(b);
      localStorage.setItem(`dumboo_budget_${currentYearMonth}`, JSON.stringify(b));
      showToast(`ตั้งงบประมาณเดือนนี้เป็น ${amount.toLocaleString()} บาท เรียบร้อย`);
    }
  };

  // Quick 1-click Preset Add
  const handleQuickAdd = async (preset: typeof QUICK_PRESETS[0]) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user ? user.uid : 'guest',
      type: preset.type,
      amount: preset.amount,
      category: preset.category,
      date: today.startsWith(currentYearMonth) ? today : `${currentYearMonth}-01`,
      title: preset.title,
      paymentMethod: 'cash',
      isEssential: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (user) {
      await saveTransaction(user.uid, newTx);
      showToast(`บันทึกด่วน "${preset.title}" ${preset.amount}฿ สำเร็จ`);
    } else {
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('dumboo_local_transactions', JSON.stringify(updated));
      showToast(`บันทึกด่วน "${preset.title}" ${preset.amount}฿ สำเร็จ`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold text-white ${
            toast.type === 'success' ? 'bg-slate-900 border border-slate-800' : 'bg-rose-600 border border-rose-700'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        isFirebaseReady={isFirebaseConnected}
      />

      {/* Cloud Sync Banner for Guest Mode */}
      {!user && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-semibold text-slate-900">
                โหมดทดลองใช้งาน (Preview Mode)
              </span>
              <span className="text-slate-500 hidden md:inline">
                • คุณสามารถลองเพิ่ม ลบ แก้ไข และดูกราฟได้ทันที หรือเข้าสู่ระบบด้วย Google เพื่อซิงค์กับฐานข้อมูล Firebase [Dumboo] ถาวร
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              เข้าสู่ระบบ Google เพื่อบันทึกบน Firebase
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Month Selector Bar */}
        <MonthSelector
          currentYearMonth={currentYearMonth}
          onChangeMonth={(newYearMonth) => setCurrentYearMonth(newYearMonth)}
        />

        {/* 1-Click Quick Shortcuts */}
        <QuickShortcuts
          onQuickAdd={handleQuickAdd}
          yearMonth={currentYearMonth}
        />

        {/* Summary Metric Cards */}
        <SummaryCards
          summary={summary}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Tab View Switch */}
        {currentTab === 'overview' ? (
          <div className="space-y-6">
            {/* Analytics Charts & Graphs */}
            <AnalyticsCharts summary={summary} />

            {/* Recent Transactions Preview in Overview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-indigo-600" />
                  รายการบันทึกในเดือนนี้
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentTab('transactions')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  ดูทั้งหมด & ค้นหาละเอียด →
                </button>
              </div>

              <TransactionList
                transactions={transactions}
                yearMonth={currentYearMonth}
                onEdit={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDelete={handleDeleteTx}
                onAddNew={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <TransactionList
              transactions={transactions}
              yearMonth={currentYearMonth}
              onEdit={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDelete={handleDeleteTx}
              onAddNew={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Dumboo</span>
            <span>• เว็บจัดการรายรับรายจ่าย สรุปผลรายเดือนและกราฟวิเคราะห์</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3 h-3" />
              Firebase Database [Dumboo]
            </span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTx}
        editingTransaction={editingTx}
        defaultDate={`${currentYearMonth}-${String(new Date().getDate()).padStart(2, '0')}`}
        userId={user ? user.uid : 'guest'}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        yearMonth={currentYearMonth}
        currentBudget={monthlyBudget ? monthlyBudget.targetBudget : null}
        onSaveBudget={handleSaveBudget}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        yearMonth={currentYearMonth}
        transactions={transactions}
        summary={summary}
      />
    </div>
  );
}

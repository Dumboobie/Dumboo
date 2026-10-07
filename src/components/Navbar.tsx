import React from 'react';
import { User } from 'firebase/auth';
import { 
  Wallet, 
  LogIn, 
  LogOut, 
  Database, 
  Download, 
  PieChart, 
  ListOrdered, 
  Plus, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  currentTab: 'overview' | 'transactions';
  setCurrentTab: (tab: 'overview' | 'transactions') => void;
  onOpenNewTransaction: () => void;
  onOpenExport: () => void;
  isFirebaseReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  currentTab,
  setCurrentTab,
  onOpenNewTransaction,
  onOpenExport,
  isFirebaseReady,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-xl tracking-tighter">
              🐘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Dumboo
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-2.5 h-2.5" />
                  Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
                จัดการรายรับ-รายจ่าย & วิเคราะห์ข้อมูล
              </p>
            </div>
          </div>

          {/* Nav Tabs for Desktop */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setCurrentTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'overview'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              สรุปผล & กราฟวิเคราะห์
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'transactions'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              รายการทั้งหมด
            </button>
          </div>

          {/* Right Action buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Export button */}
            <button
              type="button"
              onClick={onOpenExport}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200/80"
              title="ส่งออกรายงาน CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">บันทึกรายการ</span>
              <span className="sm:hidden">บันทึก</span>
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-2">
          <button
            type="button"
            onClick={() => setCurrentTab('overview')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              currentTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            สรุปผล & กราฟ
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('transactions')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              currentTab === 'transactions'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            รายการทั้งหมด
          </button>
        </div>
      </div>
    </header>
  );
};


import React, { useState } from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  Users, 
  CreditCard,
  BarChart3,
  Link as LinkIcon,
  RefreshCw,
  Cloud,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isSyncing?: boolean;
  onSync?: () => void;
  lastSyncTime?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView, 
  isSyncing = false, 
  onSync,
  lastSyncTime
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'INVENTORY', label: 'Kho hàng', icon: Package },
    { id: 'SALES', label: 'Bán hàng', icon: ShoppingCart },
    { id: 'PURCHASES', label: 'Nhập hàng', icon: Truck },
    { id: 'FINANCE', label: 'Thu chi', icon: Wallet },
    { id: 'CONTACTS', label: 'Khách & NCC', icon: Users },
    { id: 'DEBT', label: 'Công nợ', icon: CreditCard },
    { id: 'REPORTS', label: 'Báo cáo', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Cài đặt', icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setCurrentView(id as ViewType);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased text-gray-900">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-[101] transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">S</div>
            <span className="font-black text-lg">SmartBiz</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0 hidden md:flex">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/30">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-none tracking-tight">SmartBiz</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">ERP System</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-2 border border-slate-800">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
               <LinkIcon size={14} className="shrink-0" />
               <span className="truncate font-mono">Cloud Sync Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-4 sm:px-10 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-gray-50 text-gray-600 rounded-xl md:hidden hover:bg-gray-100 border"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-none uppercase">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className={`hidden sm:flex px-5 py-2.5 rounded-xl text-xs font-black transition-all border items-center gap-2 ${
                isSyncing 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100'
              }`}
            >
              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
              {isSyncing ? 'SYCING...' : 'ĐỒNG BỘ'}
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900">Admin</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Hệ thống</p>
              </div>
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border-2 border-white shadow-sm ring-1 ring-slate-200 text-xs sm:text-base">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 sm:p-8 bg-gray-50/50">
          <div className="max-w-[1600px] mx-auto h-full min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

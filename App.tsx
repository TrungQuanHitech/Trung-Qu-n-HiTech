
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import InventoryView from './components/InventoryView';
import DebtView from './components/DebtView';
import SalesView from './components/SalesView';
import PurchasesView from './components/PurchasesView';
import FinanceView from './components/FinanceView';
import ContactsView from './components/ContactsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import { ViewType, Product, Transaction, Contact, ContactType, TransactionType, TelegramConfig, BankConfig, InvoiceConfig, PrinterConfig, BarcodeConfig } from './types';
import { INITIAL_PRODUCTS, INITIAL_CONTACTS, INITIAL_TRANSACTIONS, formatCurrency } from './constants';
import { getAIInsights } from './services/geminiService';
import { syncToGoogleSheet } from './services/sheetService';
import { sendTelegramMessage } from './services/telegramService';
import { TrendingUp, TrendingDown, DollarSign, Activity, Sparkles, RefreshCw, Lock, ShieldCheck, ChevronRight, KeyRound, AlertCircle, Wallet, Layers, User, PieChart, ShoppingBag, ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('smartbiz_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('smartbiz_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smartbiz_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [aiAnalysis, setAiAnalysis] = useState<string>('Đang xử lý dữ liệu...');
  const [scriptUrl, setScriptUrl] = useState<string>(localStorage.getItem('smartbiz_script_url') || '');
  
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('smartbiz_telegram_config');
    return saved ? JSON.parse(saved) : { botToken: '', chatId: '', enabled: false };
  });

  const [bankConfig, setBankConfig] = useState<BankConfig>(() => {
    const saved = localStorage.getItem('smartbiz_bank_config');
    return saved ? JSON.parse(saved) : { bankId: 'mbbank', accountNo: '123456789', accountName: 'TRUNG QUAN' };
  });

  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig>(() => {
    const saved = localStorage.getItem('smartbiz_invoice_config');
    return saved ? JSON.parse(saved) : { 
      storeName: 'SMARTBIZ POS', address: 'Số 123 Đường ABC, HCM', phone: '0987.654.321', footerMessage: 'Cảm ơn Quý khách!' 
    };
  });

  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(() => {
    const saved = localStorage.getItem('smartbiz_printer_config');
    return saved ? JSON.parse(saved) : { paperSize: 'K80', autoPrint: false, showLogo: true, copies: 1 };
  });

  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>(() => {
    const saved = localStorage.getItem('smartbiz_barcode_config');
    return saved ? JSON.parse(saved) : { width: 35, height: 22, fontSize: 8, showName: true, showPrice: true, labelsPerRow: 2 };
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => localStorage.getItem('smartbiz_admin_password') || 'admin');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(localStorage.getItem('smartbiz_last_sync_time'));
  const [isSettingsAuth, setIsSettingsAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    localStorage.setItem('smartbiz_products', JSON.stringify(products));
    localStorage.setItem('smartbiz_contacts', JSON.stringify(contacts));
    localStorage.setItem('smartbiz_transactions', JSON.stringify(transactions));
  }, [products, contacts, transactions]);

  const fetchAI = useCallback(async () => {
    if (currentView !== 'DASHBOARD') return;
    try {
      const insight = await getAIInsights(products, transactions, contacts);
      setAiAnalysis(insight || "Gemini chưa có phân tích mới.");
    } catch (e) { setAiAnalysis("Lỗi AI."); }
  }, [products, transactions, contacts, currentView]);

  useEffect(() => { fetchAI(); }, [fetchAI]);

  // Tài chính Dashboard
  const salesTotal = transactions.filter(t => t.type === TransactionType.SALE).reduce((s, t) => s + t.total, 0);
  const purchaseTotal = transactions.filter(t => t.type === TransactionType.PURCHASE).reduce((s, t) => s + t.total, 0);
  const revenue = salesTotal - transactions.filter(t => t.type === TransactionType.SALE).reduce((s, t) => {
    const cost = t.items?.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return sum + (p?.costPrice || 0) * item.quantity;
    }, 0) || 0;
    return s + cost;
  }, 0);

  const totalIncome = transactions.filter(t => [TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(t.type)).reduce((sum, t) => sum + t.paidAmount, 0);
  const totalExpense = transactions.filter(t => [TransactionType.PURCHASE, TransactionType.EXPENSE, TransactionType.DEBT_PAYMENT].includes(t.type)).reduce((sum, t) => sum + t.paidAmount, 0);
  const netIncome = totalIncome - totalExpense;

  const customerDebt = contacts.filter(c => c.type === ContactType.CUSTOMER).reduce((s, c) => s + c.balance, 0);
  const supplierDebt = contacts.filter(c => c.type === ContactType.SUPPLIER).reduce((s, c) => s + c.balance, 0);
  const outOfStockProducts = products.filter(p => p.stock <= 0);

  const handleSync = async () => {
    if (!scriptUrl) { setCurrentView('SETTINGS'); return; }
    setIsSyncing(true);
    try {
      await syncToGoogleSheet(scriptUrl, { products, transactions, contacts });
      setLastSyncTime(new Date().toISOString());
    } catch (e) { alert("Lỗi kết nối!"); } finally { setIsSyncing(false); }
  };

  const handleTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    if (t.type === TransactionType.SALE || t.type === TransactionType.PURCHASE) {
      setProducts(prev => prev.map(p => {
        const item = t.items?.find(i => i.productId === p.id);
        if (!item) return p;
        return { ...p, stock: Math.max(0, p.stock + (t.type === TransactionType.SALE ? -item.quantity : item.quantity)) };
      }));
      if (telegramConfig.enabled) sendTelegramMessage(telegramConfig, t);
    }
    if (t.contactId) {
      setContacts(prev => prev.map(c => c.id === t.contactId ? { ...c, balance: c.balance + t.debtAmount } : c));
    }
  };

  const handleUpdateContact = (c: Contact) => setContacts(prev => prev.map(x => x.id === c.id ? c : x));
  const handleDeleteContact = (id: string) => setContacts(prev => prev.filter(x => x.id !== id));

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} isSyncing={isSyncing} onSync={handleSync} lastSyncTime={lastSyncTime}>
      {currentView === 'DASHBOARD' && (
        <div className="space-y-4 pb-24">
          {/* Row 1: Bán hàng | Nhập hàng | Doanh thu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setCurrentView('REPORTS')} className="bg-white p-5 rounded-2xl border shadow-sm text-left active:scale-95 transition-all">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Bán hàng</span>
              <h3 className="text-xl font-black text-slate-900">{formatCurrency(salesTotal)}</h3>
            </button>
            <button onClick={() => setCurrentView('REPORTS')} className="bg-white p-5 rounded-2xl border shadow-sm text-left active:scale-95 transition-all">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">Nhập hàng</span>
              <h3 className="text-xl font-black text-slate-900">{formatCurrency(purchaseTotal)}</h3>
            </button>
            <button onClick={() => setCurrentView('REPORTS')} className="bg-indigo-600 p-5 rounded-2xl shadow-lg text-left active:scale-95 transition-all">
              <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest block mb-1">Doanh thu gộp</span>
              <h3 className="text-xl font-black text-white">{formatCurrency(revenue)}</h3>
            </button>
          </div>

          {/* Row 2: Thu | Chi | Tổng thu nhập */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setCurrentView('FINANCE')} className="bg-white p-4 rounded-2xl border shadow-sm text-left">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ArrowUpRight size={14}/><span className="text-[9px] font-black uppercase tracking-widest">Thu thực tế</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{formatCurrency(totalIncome)}</h3>
            </button>
            <button onClick={() => setCurrentView('FINANCE')} className="bg-white p-4 rounded-2xl border shadow-sm text-left">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <ArrowDownRight size={14}/><span className="text-[9px] font-black uppercase tracking-widest">Chi thực tế</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{formatCurrency(totalExpense)}</h3>
            </button>
            <button onClick={() => setCurrentView('FINANCE')} className="bg-emerald-500 p-4 rounded-2xl shadow-lg text-left">
              <span className="text-[9px] font-black text-emerald-50 uppercase tracking-widest block mb-1">Tổng thu nhập</span>
              <h3 className="text-lg font-black text-white">{formatCurrency(netIncome)}</h3>
            </button>
          </div>

          {/* Row 3: Công nợ khách | Nhà cung cấp */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setCurrentView('DEBT')} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between active:scale-95 transition-all">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Công nợ khách</p>
                <h3 className="text-xl font-black text-red-600 truncate">{formatCurrency(customerDebt)}</h3>
              </div>
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0"><User size={20}/></div>
            </button>
            <button onClick={() => setCurrentView('DEBT')} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between active:scale-95 transition-all">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nhà cung cấp</p>
                <h3 className="text-xl font-black text-indigo-600 truncate">{formatCurrency(supplierDebt)}</h3>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><Layers size={20}/></div>
            </button>
          </div>

          {/* Row 4: Sản phẩm hết hàng */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black uppercase tracking-tighter flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={18}/> Sản phẩm hết hàng ({outOfStockProducts.length})
              </h4>
              <button onClick={() => setCurrentView('INVENTORY')} className="text-[10px] font-black text-indigo-600 uppercase">Xem kho</button>
            </div>
            {outOfStockProducts.length > 0 ? (
              <div className="space-y-2">
                {outOfStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => setCurrentView('PURCHASES')} className="p-3 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer">
                    <span className="text-xs font-black uppercase text-red-700 truncate">{p.name}</span>
                    <ChevronRight size={14} className="text-red-300"/>
                  </div>
                ))}
              </div>
            ) : <p className="text-center py-4 text-gray-400 font-bold uppercase text-[10px]">Kho hàng an toàn</p>}
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-3">
               <div className="flex items-center gap-2"><Sparkles className="text-indigo-400" size={16}/><h4 className="font-black uppercase tracking-widest text-[10px]">Phân tích Gemini</h4></div>
               <div className="text-[11px] text-slate-300 leading-relaxed italic">{aiAnalysis}</div>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
        </div>
      )}

      {currentView === 'SALES' && <SalesView products={products} contacts={contacts} onCompleteSale={handleTransaction} bankConfig={bankConfig} invoiceConfig={invoiceConfig} printerConfig={printerConfig} />}
      {currentView === 'INVENTORY' && <InventoryView products={products} transactions={transactions} barcodeConfig={barcodeConfig} onAddProduct={(p) => setProducts(prev => [...prev, p])} onDeleteProduct={(id) => setProducts(prev => prev.filter(x => x.id !== id))} onUpdateProduct={(p) => setProducts(prev => prev.map(x => x.id === p.id ? p : x))} />}
      {currentView === 'PURCHASES' && <PurchasesView products={products} contacts={contacts} onCompletePurchase={handleTransaction} onQuickAddProduct={(p) => setProducts(prev => [...prev, p])} />}
      {currentView === 'FINANCE' && <FinanceView transactions={transactions} contacts={contacts} onAddTransaction={handleTransaction} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(x => x.id !== id))} onUpdateTransaction={(t) => setTransactions(prev => prev.map(x => x.id === t.id ? t : x))} />}
      {currentView === 'CONTACTS' && <ContactsView contacts={contacts} transactions={transactions} onAddContact={(c) => setContacts(prev => [...prev, c])} onUpdateContact={handleUpdateContact} onDeleteContact={handleDeleteContact} />}
      {currentView === 'DEBT' && <DebtView contacts={contacts} transactions={transactions} onAddTransaction={handleTransaction} />}
      {currentView === 'REPORTS' && <ReportsView transactions={transactions} />}
      {currentView === 'SETTINGS' && (
        !isSettingsAuth ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border w-full max-w-md text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Lock size={40}/></div>
              <h3 className="text-xl font-black uppercase tracking-tight">Xác thực quyền hạn</h3>
              <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === adminPassword) setIsSettingsAuth(true); else alert("Sai mật mã!"); }} className="space-y-4">
                <input autoFocus type="password" placeholder="Mật mã admin" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-black text-center text-sm" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">XÁC NHẬN</button>
              </form>
            </div>
          </div>
        ) : (
          <SettingsView scriptUrl={scriptUrl} telegramConfig={telegramConfig} bankConfig={bankConfig} invoiceConfig={invoiceConfig} printerConfig={printerConfig} barcodeConfig={barcodeConfig} adminPassword={adminPassword} onSaveSettings={(u, tg, bk, iv, pr, br) => {
            setScriptUrl(u); setTelegramConfig(tg); setBankConfig(bk); setInvoiceConfig(iv); setPrinterConfig(pr); setBarcodeConfig(br);
            localStorage.setItem('smartbiz_script_url', u);
            localStorage.setItem('smartbiz_telegram_config', JSON.stringify(tg));
            localStorage.setItem('smartbiz_bank_config', JSON.stringify(bk));
            localStorage.setItem('smartbiz_invoice_config', JSON.stringify(iv));
            localStorage.setItem('smartbiz_printer_config', JSON.stringify(pr));
            localStorage.setItem('smartbiz_barcode_config', JSON.stringify(br));
            alert("Đã lưu!");
          }} onUpdateAdminPassword={(p) => { setAdminPassword(p); localStorage.setItem('smartbiz_admin_password', p); alert("Đã đổi!"); }} onResetData={() => { if (confirm("Xóa hết?")) { localStorage.clear(); location.reload(); } }} />
        )
      )}
    </Layout>
  );
};

export default App;

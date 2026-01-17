
import React, { useState } from 'react';
import { Transaction, TransactionType, Contact, ContactType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { Wallet, ArrowUpRight, ArrowDownRight, Search, Plus, Download, Eye, Printer, X, CheckCircle2, DollarSign, FileText, Trash2, Edit, Calendar, Info, User, FilterX, ChevronRight } from 'lucide-react';

interface FinanceViewProps {
  transactions: Transaction[];
  contacts: Contact[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ transactions, contacts, onAddTransaction, onDeleteTransaction, onUpdateTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTx, setNewTx] = useState({ type: TransactionType.INCOME, contactId: '', amount: 0, note: '' });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesDate = true;
    const txDate = new Date(t.date);
    if (startDate) { const start = new Date(startDate); start.setHours(0, 0, 0, 0); matchesDate = matchesDate && txDate >= start; }
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); matchesDate = matchesDate && txDate <= end; }
    return matchesSearch && matchesDate;
  });

  const totalIncome = transactions.filter(t => [TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(t.type)).reduce((sum, t) => sum + t.paidAmount, 0);
  const totalExpense = transactions.filter(t => [TransactionType.PURCHASE, TransactionType.EXPENSE, TransactionType.DEBT_PAYMENT].includes(t.type)).reduce((sum, t) => sum + t.paidAmount, 0);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTx.amount <= 0) return alert("Vui lòng nhập số tiền!");
    const contact = contacts.find(c => c.id === newTx.contactId);
    const transaction: Transaction = {
      id: `${newTx.type === TransactionType.INCOME ? 'INC' : 'EXP'}${Date.now().toString().slice(-6)}`,
      type: newTx.type, date: new Date().toISOString(), contactId: newTx.contactId || undefined, contactName: contact?.name || (newTx.type === TransactionType.INCOME ? 'Khoản thu ngoài' : 'Khoản chi ngoài'),
      subtotal: newTx.amount, discount: 0, total: newTx.amount, paidAmount: newTx.amount, debtAmount: 0, note: newTx.note
    };
    onAddTransaction(transaction);
    setIsModalOpen(false);
    setNewTx({ type: TransactionType.INCOME, contactId: '', amount: 0, note: '' });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Thực thu</p>
          <h3 className="text-sm sm:text-lg font-black text-emerald-600 truncate">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Thực chi</p>
          <h3 className="text-sm sm:text-lg font-black text-red-600 truncate">{formatCurrency(totalExpense)}</h3>
        </div>
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg col-span-2 sm:col-span-1">
          <p className="text-[10px] font-black text-indigo-100 uppercase mb-1">Quỹ hiện tại</p>
          <h3 className="text-sm sm:text-lg font-black text-white truncate">{formatCurrency(totalIncome - totalExpense)}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white p-4 rounded-[2rem] border shadow-sm print:hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm đơn, đối tác..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"><Plus size={16} className="inline mr-1" /> Ghi sổ Thu/Chi</button>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="flex flex-col gap-2 md:hidden">
        {filteredTransactions.map(t => {
          const isIncome = [TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(t.type);
          return (
            <div key={t.id} onClick={() => setViewTransaction(t)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between active:bg-gray-50 transition-all">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{TRANSACTION_TYPE_LABELS[t.type]}</span>
                  <span className="text-[9px] font-bold text-gray-400">#{t.id}</span>
                </div>
                <h4 className="text-xs font-black text-gray-900 truncate uppercase">{t.contactName}</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className={`text-sm font-black ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.paidAmount).replace(' ₫', '')}
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE remains same... */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Thời gian</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Đối tác</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Số tiền</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTransactions.map(t => {
              const isIncome = [TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(t.type);
              return (
                <tr key={t.id} onClick={() => setViewTransaction(t)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 font-black text-sm text-gray-900 uppercase truncate max-w-[200px]">{t.contactName}</td>
                  <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>{isIncome ? '+' : '-'}{formatCurrency(t.paidAmount)}</td>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditTransaction(t)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16}/></button>
                    <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal Optimized for Mobile */}
      {viewTransaction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[85vh]">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Chi tiết đơn #{viewTransaction.id}</h3>
              <button onClick={() => setViewTransaction(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{TRANSACTION_TYPE_LABELS[viewTransaction.type]}</p>
                <h2 className={`text-4xl font-black ${[TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(viewTransaction.type) ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(viewTransaction.paidAmount)}
                </h2>
                <p className="text-sm font-black uppercase tracking-tight text-gray-900">{viewTransaction.contactName}</p>
                <p className="text-[10px] font-bold text-gray-400">{new Date(viewTransaction.date).toLocaleString('vi-VN')}</p>
              </div>

              {viewTransaction.items && viewTransaction.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Hàng hóa</h4>
                  <div className="space-y-2">
                    {viewTransaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-black uppercase truncate pr-4">{item.name} x {item.quantity}</span>
                        <span className="font-bold shrink-0">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewTransaction.note && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-xs text-gray-500">
                  {viewTransaction.note}
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t shrink-0">
              <button onClick={() => window.print()} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest mb-3">IN CHỨNG TỪ</button>
              <button onClick={() => setViewTransaction(null)} className="w-full py-4 bg-white border rounded-2xl font-bold text-xs uppercase text-gray-500">ĐÓNG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;

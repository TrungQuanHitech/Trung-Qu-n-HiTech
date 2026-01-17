
import React, { useState } from 'react';
import { Transaction, TransactionType, Contact, ContactType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { Wallet, Search, Plus, X, Trash2, Edit, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

interface FinanceViewProps {
  transactions: Transaction[];
  contacts: Contact[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ transactions, contacts, onAddTransaction, onDeleteTransaction, onUpdateTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  
  const [newTx, setNewTx] = useState({ type: TransactionType.INCOME, contactId: '', amount: 0, note: '' });

  const filteredTransactions = transactions.filter(t => 
    t.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTx.amount <= 0) return alert("Nhập số tiền!");
    
    if (editTx) {
      onUpdateTransaction({ ...editTx, paidAmount: newTx.amount, total: newTx.amount, note: newTx.note, type: newTx.type });
      setEditTx(null);
    } else {
      const contact = contacts.find(c => c.id === newTx.contactId);
      const transaction: Transaction = {
        id: `${newTx.type === TransactionType.INCOME ? 'INC' : 'EXP'}${Date.now().toString().slice(-6)}`,
        type: newTx.type, date: new Date().toISOString(), contactId: newTx.contactId || undefined, contactName: contact?.name || 'Vãng lai',
        subtotal: newTx.amount, discount: 0, total: newTx.amount, paidAmount: newTx.amount, debtAmount: 0, note: newTx.note
      };
      onAddTransaction(transaction);
    }
    setIsModalOpen(false);
    setNewTx({ type: TransactionType.INCOME, contactId: '', amount: 0, note: '' });
  };

  const handleEdit = (t: Transaction) => {
    setEditTx(t);
    setNewTx({ type: t.type, contactId: t.contactId || '', amount: t.paidAmount, note: t.note || '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row gap-2 sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 py-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm đơn hoặc người nộp/nhận..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-bold text-[11px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setEditTx(null); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <Plus size={16}/> Thêm Thu/Chi
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filteredTransactions.map(t => {
          const isIncome = [TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(t.type);
          return (
            <div key={t.id} onClick={() => setViewTransaction(t)} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:bg-slate-50 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isIncome ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{TRANSACTION_TYPE_LABELS[t.type]}</span>
                  <span className="text-[9px] font-bold text-slate-400">#{t.id}</span>
                </div>
                <h4 className="font-black text-slate-800 text-xs truncate uppercase leading-none">{t.contactName}</h4>
              </div>
              <div className="text-right shrink-0 mr-1">
                <p className={`font-black text-xs ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>{isIncome ? '+' : '-'}{formatCurrency(t.paidAmount).replace(' ₫', '')}</p>
                <p className="text-[8px] font-bold text-gray-400">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-1 no-print">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600"><Edit size={14}/></button>
                <button onClick={(e) => { e.stopPropagation(); setTxToDelete(t.id); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal chi tiết */}
      {viewTransaction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col h-full sm:h-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Chi tiết giao dịch</h3>
              <button onClick={() => setViewTransaction(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-6 text-center">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{TRANSACTION_TYPE_LABELS[viewTransaction.type]}</p>
                 <h2 className={`text-4xl font-black ${[TransactionType.SALE, TransactionType.INCOME, TransactionType.DEBT_COLLECTION].includes(viewTransaction.type) ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(viewTransaction.paidAmount)}</h2>
               </div>
               <div className="py-6 border-y border-dashed space-y-3">
                  <div className="flex justify-between items-center text-[11px]"><span className="text-gray-400 uppercase font-black">Mã đơn</span><span className="font-black">#{viewTransaction.id}</span></div>
                  <div className="flex justify-between items-center text-[11px]"><span className="text-gray-400 uppercase font-black">Người giao dịch</span><span className="font-black uppercase">{viewTransaction.contactName}</span></div>
                  <div className="flex justify-between items-center text-[11px]"><span className="text-gray-400 uppercase font-black">Thời gian</span><span className="font-bold">{new Date(viewTransaction.date).toLocaleString('vi-VN')}</span></div>
               </div>
               {viewTransaction.note && <div className="p-4 bg-slate-50 rounded-2xl border italic text-xs text-slate-500">"{viewTransaction.note}"</div>}
            </div>
            <div className="p-6 bg-slate-50 border-t shrink-0">
               <button onClick={() => setViewTransaction(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95">ĐÓNG</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col h-full sm:h-auto">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">{editTx ? 'Sửa thông tin' : 'Tạo mới Thu/Chi'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.INCOME})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newTx.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>PHIẾU THU</button>
                <button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.EXPENSE})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>PHIẾU CHI</button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Đối tác</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTx.contactId} onChange={e => setNewTx({...newTx, contactId: e.target.value})}>
                    <option value="">Khác (Vãng lai)</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Số tiền giao dịch</label>
                  <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl text-center outline-none" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Ghi chú nội dung</label>
                  <textarea rows={3} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none resize-none" value={newTx.note} onChange={e => setNewTx({...newTx, note: e.target.value})} placeholder="Nhập lý do thu/chi..." />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">HOÀN TẤT GHI SỔ</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-xs w-full text-center space-y-4 shadow-2xl">
            <AlertCircle className="mx-auto text-red-500" size={40}/>
            <h3 className="font-black uppercase text-xs">Xóa giao dịch này?</h3>
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">Hành động này sẽ xóa vĩnh viễn dữ liệu giao dịch khỏi sổ sách.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-50 border rounded-xl font-black uppercase text-[10px]">Hủy</button>
              <button onClick={() => { if (txToDelete) onDeleteTransaction(txToDelete); setIsDeleteModalOpen(false); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-100">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;

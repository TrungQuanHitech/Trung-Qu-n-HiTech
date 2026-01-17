
import React, { useState } from 'react';
import { Contact, ContactType, Transaction, TransactionType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { ArrowUpCircle, ArrowDownCircle, Search, CreditCard, X, Download, User, ChevronRight } from 'lucide-react';

interface DebtViewProps {
  contacts: Contact[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
}

const DebtView: React.FC<DebtViewProps> = ({ contacts, transactions, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<ContactType>(ContactType.CUSTOMER);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [payAmount, setPayAmount] = useState(0);

  const debtContacts = contacts.filter(c => 
    c.type === activeTab && 
    c.balance > 0 &&
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
  );

  const handleDebtAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || payAmount <= 0) return;
    const transaction: Transaction = {
      id: `${activeTab === ContactType.CUSTOMER ? 'DC' : 'DP'}${Date.now().toString().slice(-6)}`,
      type: activeTab === ContactType.CUSTOMER ? TransactionType.DEBT_COLLECTION : TransactionType.DEBT_PAYMENT,
      date: new Date().toISOString(), contactId: selectedContact.id, contactName: selectedContact.name, subtotal: 0, discount: 0, total: 0,
      paidAmount: payAmount, debtAmount: -payAmount, note: `${activeTab === ContactType.CUSTOMER ? 'Thu nợ khách' : 'Trả nợ nhà cung cấp'}: ${selectedContact.name}`
    };
    onAddTransaction(transaction);
    setSelectedContact(null);
    setPayAmount(0);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Khách hàng nợ</p>
          <h3 className="text-sm font-black text-gray-900 mt-1 truncate">
            {formatCurrency(contacts.filter(c => c.type === ContactType.CUSTOMER).reduce((s, c) => s + c.balance, 0))}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Nợ Nhà cung cấp</p>
          <h3 className="text-sm font-black text-gray-900 mt-1 truncate">
            {formatCurrency(contacts.filter(c => c.type === ContactType.SUPPLIER).reduce((s, c) => s + c.balance, 0))}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white p-4 rounded-[2rem] border shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full">
          <button onClick={() => setActiveTab(ContactType.CUSTOMER)} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === ContactType.CUSTOMER ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>KHÁCH HÀNG</button>
          <button onClick={() => setActiveTab(ContactType.SUPPLIER)} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === ContactType.SUPPLIER ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>NHÀ CUNG CẤP</button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm tên, số điện thoại..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="flex flex-col gap-2">
        {debtContacts.map(c => (
          <div key={c.id} onClick={() => setSelectedContact(c)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="min-w-0">
              <h4 className="text-xs font-black text-gray-900 uppercase truncate">{c.name}</h4>
              <p className="text-[10px] text-gray-400 font-bold">{c.phone}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-sm font-black text-red-500">{formatCurrency(c.balance).replace(' ₫', '')}</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CreditCard size={16}/></div>
            </div>
          </div>
        ))}
        {debtContacts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
             <User size={32} className="mx-auto text-gray-200 mb-2" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Không có dư nợ</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xs font-black uppercase tracking-widest">{activeTab === ContactType.CUSTOMER ? 'Thu nợ khách' : 'Trả nợ NCC'}</h3>
              <button onClick={() => setSelectedContact(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleDebtAction} className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Đối tác: {selectedContact.name}</p>
                <p className="text-3xl font-black text-red-500">{formatCurrency(selectedContact.balance)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Dư nợ hiện tại</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Số tiền thanh toán</label>
                <input required type="number" max={selectedContact.balance} className="w-full p-4 bg-gray-50 border rounded-2xl font-black text-xl outline-none" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="0" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest">XÁC NHẬN GIAO DỊCH</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtView;

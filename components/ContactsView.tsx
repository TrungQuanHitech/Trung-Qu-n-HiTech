
import React, { useState } from 'react';
import { Contact, ContactType, Transaction, TransactionType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { User, UserPlus, Phone, MapPin, Search, ChevronRight, X, History, Calendar, ArrowRightLeft, MessageCircle } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  transactions: Transaction[];
  onAddContact: (c: Contact) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ contacts, transactions, onAddContact }) => {
  const [activeTab, setActiveTab] = useState<ContactType>(ContactType.CUSTOMER);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyContact, setHistoryContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', address: '' });

  const filtered = contacts.filter(c => 
    c.type === activeTab && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact({
      ...newContact,
      id: 'c' + Date.now(),
      type: activeTab,
      balance: 0
    });
    setIsModalOpen(false);
    setNewContact({ name: '', phone: '', address: '' });
  };

  const getContactHistory = (contactId: string) => {
    return transactions.filter(t => t.contactId === contactId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-4">
      {/* TABS & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab(ContactType.CUSTOMER)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all ${activeTab === ContactType.CUSTOMER ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Khách hàng
          </button>
          <button 
            onClick={() => setActiveTab(ContactType.SUPPLIER)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all ${activeTab === ContactType.SUPPLIER ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Nhà cung cấp
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 uppercase tracking-widest"
        >
          <UserPlus size={16} /> Thêm mới
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder={`Tìm theo tên hoặc số điện thoại...`} 
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CONTACT LIST - HORIZONTAL BARS OPTIMIZED */}
      <div className="flex flex-col gap-2 pb-10">
        {filtered.map(contact => (
          <div 
            key={contact.id} 
            className="flex items-center bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group gap-3 sm:gap-6 active:bg-gray-50"
          >
            {/* Avatar - Smaller on mobile */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs sm:text-base font-black text-gray-900 tracking-tight uppercase truncate">
                  {contact.name}
                </h4>
                {contact.balance > 0 && (
                  <span className="shrink-0 px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-black rounded-md uppercase tracking-tighter">NỢ</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 font-bold">
                <Phone size={10} className="text-indigo-400 shrink-0"/> {contact.phone}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Số dư nợ</p>
                <p className={`text-xs sm:text-lg font-black tracking-tight ${contact.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {formatCurrency(contact.balance)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setHistoryContact(contact)}
                  className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                >
                  <History size={16} sm:size={20} />
                </button>
                <a 
                  href={`tel:${contact.phone}`}
                  className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm"
                >
                  <Phone size={16} sm:size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
             <User size={32} className="mx-auto text-gray-200 mb-2" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Danh sách trống</p>
          </div>
        )}
      </div>

      {/* History Modal remains similar but optimized for smaller viewports */}
      {historyContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[120] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-full sm:h-[85vh]">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><History size={20} /></div>
                <div>
                  <h3 className="font-black text-sm sm:text-xl tracking-tight uppercase">Lịch sử</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{historyContact.name}</p>
                </div>
              </div>
              <button onClick={() => setHistoryContact(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                {getContactHistory(historyContact.id).length > 0 ? (
                  <div className="space-y-3">
                    {getContactHistory(historyContact.id).map(t => (
                      <div key={t.id} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                              t.type === TransactionType.SALE ? 'bg-indigo-50 text-indigo-600' :
                              t.type === TransactionType.PURCHASE ? 'bg-orange-50 text-orange-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>{TRANSACTION_TYPE_LABELS[t.type]}</span>
                            <span className="text-[9px] font-bold text-gray-400">#{t.id}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-gray-900">{formatCurrency(t.total)}</p>
                          <p className={`text-[9px] font-bold ${t.debtAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {t.debtAmount === 0 ? 'Hoàn tất' : (t.debtAmount > 0 ? 'Còn nợ' : 'Dư nợ')+ ': ' + formatCurrency(Math.abs(t.debtAmount))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 py-12">
                    <ArrowRightLeft size={48} strokeWidth={1} />
                    <p className="mt-2 font-black uppercase tracking-widest text-[9px]">Chưa có giao dịch</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-10 text-center sm:text-left">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Giao dịch</p>
                  <p className="text-lg font-black text-gray-900">{getContactHistory(historyContact.id).length}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Số dư nợ</p>
                  <p className={`text-lg font-black ${historyContact.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {formatCurrency(historyContact.balance)}
                  </p>
                </div>
              </div>
              <button onClick={() => setHistoryContact(null)} className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest">ĐÓNG</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-black text-gray-800 tracking-tight uppercase">Thêm {activeTab === ContactType.CUSTOMER ? 'khách' : 'NCC'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ tên đối tác</label>
                <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-sm" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Địa chỉ</label>
                <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm" value={newContact.address} onChange={e => setNewContact({...newContact, address: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs">LƯU ĐỐI TÁC</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsView;


import React, { useState } from 'react';
import { Contact, ContactType, Transaction, TransactionType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { User, UserPlus, Phone, Search, X, History, Trash2, Edit, ChevronRight, AlertCircle } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  transactions: Transaction[];
  onAddContact: (c: Contact) => void;
  onUpdateContact: (c: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ contacts, transactions, onAddContact, onUpdateContact, onDeleteContact }) => {
  const [activeTab, setActiveTab] = useState<ContactType>(ContactType.CUSTOMER);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [historyContact, setHistoryContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const filtered = contacts.filter(c => 
    c.type === activeTab && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      onUpdateContact({ ...editingContact, ...formData });
      setEditingContact(null);
    } else {
      onAddContact({ ...formData, id: 'c' + Date.now(), type: activeTab, balance: 0 });
    }
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({ name: c.name, phone: c.phone, address: c.address || '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-col sm:flex-row gap-3 items-center sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 py-1">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto shadow-inner">
          <button onClick={() => setActiveTab(ContactType.CUSTOMER)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === ContactType.CUSTOMER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Khách hàng</button>
          <button onClick={() => setActiveTab(ContactType.SUPPLIER)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === ContactType.SUPPLIER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Nhà cung cấp</button>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm tên hoặc số điện thoại..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none text-[11px] font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setEditingContact(null); setFormData({name:'', phone:'', address:''}); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] shadow-lg uppercase tracking-widest active:scale-95 transition-all"><UserPlus size={16} /> Thêm mới</button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(c => (
          <div key={c.id} onClick={() => setHistoryContact(c)} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:bg-slate-50 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-800 text-xs truncate uppercase leading-none mb-1">{c.name}</h4>
              <p className="text-[10px] text-gray-400 font-bold">{c.phone}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-black text-xs ${c.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(c.balance).replace(' ₫', '')}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Số dư nợ</p>
            </div>
            <div className="flex gap-1 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
              <a href={`tel:${c.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Phone size={14}/></a>
              <button onClick={() => handleEdit(c)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600"><Edit size={14}/></button>
              <button onClick={() => { setContactToDelete(c.id); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lịch sử & Chi tiết */}
      {historyContact && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col h-full sm:h-[85vh] shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Chi tiết đối tác</h3>
              <button onClick={() => setHistoryContact(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto text-3xl font-black shadow-xl shadow-indigo-100">{historyContact.name.charAt(0).toUpperCase()}</div>
                 <h2 className="text-xl font-black uppercase tracking-tight">{historyContact.name}</h2>
                 <p className="text-indigo-600 font-black text-sm">{historyContact.phone}</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">{historyContact.address || 'Chưa cập nhật địa chỉ'}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 border-y border-dashed py-6">
                  <div className="text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Giao dịch</p><p className="text-lg font-black">{transactions.filter(t => t.contactId === historyContact.id).length}</p></div>
                  <div className="text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dư nợ</p><p className={`text-lg font-black ${historyContact.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(historyContact.balance)}</p></div>
               </div>
               <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giao dịch gần nhất</h4>
                 <div className="space-y-2">
                   {transactions.filter(t => t.contactId === historyContact.id).slice(0, 5).map(t => (
                     <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border flex justify-between items-center">
                       <div><p className="text-[10px] font-black uppercase">#{t.id}</p><p className="text-[9px] font-bold text-gray-400">{new Date(t.date).toLocaleDateString('vi-VN')}</p></div>
                       <p className="text-xs font-black">{formatCurrency(t.total)}</p>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t shrink-0">
               <button onClick={() => setHistoryContact(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">ĐÓNG CHI TIẾT</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-xs w-full text-center space-y-4 shadow-2xl">
            <AlertCircle className="mx-auto text-red-500" size={40}/>
            <h3 className="font-black uppercase text-xs">Xóa đối tác này?</h3>
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">Mọi lịch sử giao dịch và công nợ liên quan sẽ bị ảnh hưởng.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-50 border rounded-xl font-black uppercase text-[10px]">Hủy</button>
              <button onClick={() => { if (contactToDelete) onDeleteContact(contactToDelete); setIsDeleteModalOpen(false); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-100">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col h-full sm:h-auto">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">{editingContact ? 'Sửa đối tác' : 'Thêm đối tác'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Họ và tên</label><input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Số điện thoại</label><input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Địa chỉ (Tùy chọn)</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">LƯU ĐỐI TÁC</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsView;

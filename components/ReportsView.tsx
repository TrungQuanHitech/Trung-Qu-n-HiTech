
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { ShoppingBag, Truck, Search, Download, FileText, Calendar, FilterX, ChevronDown } from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'SALE' | 'PURCHASE'>('SALE');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const isCorrectType = t.type === (activeTab === 'SALE' ? TransactionType.SALE : TransactionType.PURCHASE);
      const matchesSearch = t.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesDate = true;
      if (startDate) matchesDate = matchesDate && new Date(t.date) >= new Date(startDate);
      if (endDate) matchesDate = matchesDate && new Date(t.date) <= new Date(endDate);
      return isCorrectType && matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeTab, searchTerm, startDate, endDate]);

  const totalAmount = filteredData.reduce((sum, t) => sum + t.total, 0);
  const totalPaid = filteredData.reduce((sum, t) => sum + t.paidAmount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* TABS */}
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full">
        <button onClick={() => setActiveTab('SALE')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SALE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><ShoppingBag size={14} /> Bán hàng</button>
        <button onClick={() => setActiveTab('PURCHASE')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'PURCHASE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Truck size={14} /> Nhập hàng</button>
      </div>

      {/* STATS MINI */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 mb-1">Tổng cộng</p>
          <p className="text-sm font-black truncate">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 mb-1">Thực thu/chi</p>
          <p className="text-sm font-black truncate">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-[2rem] border shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm đơn/đối tác..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"><FileText size={16} /> Xuất PDF</button>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="flex flex-col gap-2">
        {filteredData.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">#{t.id}</span>
                <h4 className="text-xs font-black text-gray-900 uppercase truncate pr-4">{t.contactName}</h4>
              </div>
              <p className="text-xs font-black text-indigo-600">{formatCurrency(t.total)}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-[9px] font-bold text-gray-400">
               <div className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={10}/> {new Date(t.date).toLocaleDateString('vi-VN')}</div>
               <div className={`uppercase px-2 py-0.5 rounded-md ${t.debtAmount > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                 {t.debtAmount > 0 ? 'Còn nợ' : 'Đã xong'}
               </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
             <FilterX size={32} className="mx-auto text-gray-200 mb-2" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Không tìm thấy dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;

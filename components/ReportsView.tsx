
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, TRANSACTION_TYPE_LABELS } from '../constants';
import { ShoppingBag, Truck, Search, FileText, Calendar, FilterX, ChevronDown, Download } from 'lucide-react';

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

  return (
    <div className="space-y-4 pb-24">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full sticky top-0 z-20 shadow-sm backdrop-blur-md">
        <button onClick={() => setActiveTab('SALE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SALE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><ShoppingBag size={14} /> Bán hàng</button>
        <button onClick={() => setActiveTab('PURCHASE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'PURCHASE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Truck size={14} /> Nhập hàng</button>
      </div>

      <div className="bg-white p-4 rounded-3xl border shadow-sm space-y-3 no-print">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm đơn, khách hàng..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r">Mã đơn</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r">Ngày</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r">Đối tác</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r min-w-[200px]">Danh sách hàng hóa</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r text-right">Tổng tiền</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-r text-right">Đã trả</th>
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Còn nợ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-[10px] font-black text-indigo-600 border-r">#{t.id}</td>
                <td className="p-4 text-[10px] font-bold text-slate-500 border-r">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-[10px] font-black uppercase text-slate-800 border-r">{t.contactName}</td>
                <td className="p-4 text-[10px] font-medium text-slate-600 border-r">
                   <div className="flex flex-col gap-1">
                     {t.items?.map((item, idx) => (
                       <div key={idx} className="flex justify-between gap-4 border-b border-slate-50 pb-0.5 last:border-0">
                         <span className="truncate uppercase">{item.name}</span>
                         <span className="shrink-0 font-bold">x{item.quantity} | {formatCurrency(item.price).replace(' ₫', '')}</span>
                       </div>
                     ))}
                   </div>
                </td>
                <td className="p-4 text-[11px] font-black text-slate-900 text-right border-r bg-slate-50/30">{formatCurrency(t.total).replace(' ₫', '')}</td>
                <td className="p-4 text-[11px] font-black text-emerald-600 text-right border-r">{formatCurrency(t.paidAmount).replace(' ₫', '')}</td>
                <td className="p-4 text-[11px] font-black text-red-500 text-right">{formatCurrency(t.debtAmount).replace(' ₫', '')}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="py-24 text-center">
                   <FilterX size={32} className="mx-auto text-slate-200 mb-3" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Không có dữ liệu báo cáo</p>
                </td>
              </tr>
            )}
          </tbody>
          {filteredData.length > 0 && (
            <tfoot className="bg-slate-900 text-white font-black uppercase text-[10px]">
               <tr>
                 <td colSpan={4} className="p-4 text-right">Tổng kết trang</td>
                 <td className="p-4 text-right">{formatCurrency(filteredData.reduce((s,x) => s+x.total, 0)).replace(' ₫', '')}</td>
                 <td className="p-4 text-right text-emerald-400">{formatCurrency(filteredData.reduce((s,x) => s+x.paidAmount, 0)).replace(' ₫', '')}</td>
                 <td className="p-4 text-right text-red-400">{formatCurrency(filteredData.reduce((s,x) => s+x.debtAmount, 0)).replace(' ₫', '')}</td>
               </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      <div className="flex justify-end no-print pt-4">
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
           <FileText size={18}/> Xuất báo cáo (In/PDF)
         </button>
      </div>
    </div>
  );
};

export default ReportsView;

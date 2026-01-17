
import React, { useState } from 'react';
import { Settings, Save, Lock, QrCode, Trash2, Printer, ScanBarcode, Store, Phone, Cloud, KeyRound, Bell, MessageSquare } from 'lucide-react';
import { TelegramConfig, BankConfig, InvoiceConfig, PrinterConfig, BarcodeConfig } from '../types';

interface SettingsViewProps {
  scriptUrl: string;
  telegramConfig: TelegramConfig;
  bankConfig: BankConfig;
  invoiceConfig: InvoiceConfig;
  printerConfig: PrinterConfig;
  barcodeConfig: BarcodeConfig;
  adminPassword: string;
  onSaveSettings: (u: string, tg: TelegramConfig, bk: BankConfig, iv: InvoiceConfig, pr: PrinterConfig, br: BarcodeConfig) => void;
  onUpdateAdminPassword: (newPassword: string) => void;
  onResetData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ scriptUrl, telegramConfig, bankConfig, invoiceConfig, printerConfig, barcodeConfig, adminPassword, onSaveSettings, onUpdateAdminPassword, onResetData }) => {
  const [url, setUrl] = useState(scriptUrl);
  const [tgConfig, setTgConfig] = useState<TelegramConfig>(telegramConfig);
  const [bankCfg, setBankCfg] = useState<BankConfig>(bankConfig);
  const [invCfg, setInvCfg] = useState<InvoiceConfig>(invoiceConfig);
  const [prnCfg, setPrnCfg] = useState<PrinterConfig>(printerConfig);
  const [barCfg, setBarCfg] = useState<BarcodeConfig>(barcodeConfig);
  const [newPass, setNewPass] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Settings size={22} /></div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Cấu hình hệ thống</h3>
          </div>
          <button onClick={() => onSaveSettings(url, tgConfig, bankCfg, invCfg, prnCfg, barCfg)} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl text-xs tracking-widest uppercase active:scale-95 transition-all">
            <Save size={18} /> Lưu tất cả
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Admin Password */}
          <section className="space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><KeyRound size={16} className="text-indigo-600" /> Mật mã quản trị</h4>
            <div className="flex gap-2">
              <input type="password" placeholder="Mật mã mới" className="flex-1 p-4 bg-slate-50 border rounded-2xl font-black text-xs" value={newPass} onChange={e => setNewPass(e.target.value)} />
              <button onClick={() => { onUpdateAdminPassword(newPass); setNewPass(''); }} className="px-6 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase">Cập nhật</button>
            </div>
          </section>

          {/* Store Info */}
          <section className="space-y-6 border-t pt-10">
            <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><Store size={16} className="text-indigo-600" /> Thông tin cửa hàng</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Tên thương hiệu</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-xs" value={invCfg.storeName} onChange={e => setInvCfg({...invCfg, storeName: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Hotline</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-xs" value={invCfg.phone} onChange={e => setInvCfg({...invCfg, phone: e.target.value})} /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Địa chỉ kinh doanh</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-xs" value={invCfg.address} onChange={e => setInvCfg({...invCfg, address: e.target.value})} /></div>
            </div>
          </section>

          {/* Cloud Sync */}
          <section className="space-y-6 border-t pt-10">
            <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><Cloud size={16} className="text-blue-500" /> Đồng bộ Google Sheet</h4>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">Apps Script Web App URL</label>
              <input type="text" className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl font-mono text-[10px]" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." />
            </div>
          </section>

          {/* Telegram Notifications */}
          <section className="space-y-6 border-t pt-10">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><Bell size={16} className="text-sky-500" /> Thông báo Telegram</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={tgConfig.enabled} onChange={e => setTgConfig({...tgConfig, enabled: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Bot Token</label><input type="password" placeholder="Bot Token từ BotFather" className="w-full p-4 bg-slate-50 border rounded-2xl text-[10px] font-mono" value={tgConfig.botToken} onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Chat ID</label><input type="text" placeholder="Chat ID của bạn" className="w-full p-4 bg-slate-50 border rounded-2xl text-[10px] font-mono" value={tgConfig.chatId} onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})} /></div>
            </div>
          </section>

          {/* Hardware Config */}
          <section className="space-y-6 border-t pt-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><Printer size={16} className="text-slate-600" /> Cấu hình máy in</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setPrnCfg({...prnCfg, paperSize: 'K80'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] border ${prnCfg.paperSize === 'K80' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}>KHỔ K80 (80mm)</button>
                    <button onClick={() => setPrnCfg({...prnCfg, paperSize: 'K58'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] border ${prnCfg.paperSize === 'K58' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}>KHỔ K58 (58mm)</button>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={prnCfg.autoPrint} onChange={e => setPrnCfg({...prnCfg, autoPrint: e.target.checked})} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tự động in hóa đơn</span>
                  </label>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><ScanBarcode size={16} className="text-slate-600" /> Cấu hình máy quét</h4>
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3">
                     <ScanBarcode size={24} className="animate-pulse" />
                     <p className="text-[9px] font-black uppercase leading-tight">Cổng USB/Bluetooth sẵn sàng. Hệ thống tự động nhận diện thiết bị đầu vào.</p>
                  </div>
                </div>
             </div>
          </section>

          {/* VietQR Pay */}
          <section className="space-y-6 border-t pt-10">
             <h4 className="font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase text-xs"><QrCode size={16} className="text-orange-500" /> Cấu hình VIETQR</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Ngân hàng (ID)</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold uppercase text-xs" value={bankCfg.bankId} onChange={e => setBankCfg({...bankCfg, bankId: e.target.value})} placeholder="mbbank, vcb..." /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Số tài khoản</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-xs" value={bankCfg.accountNo} onChange={e => setBankCfg({...bankCfg, accountNo: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Tên thụ hưởng</label><input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-black uppercase text-xs" value={bankCfg.accountName} onChange={e => setBankCfg({...bankCfg, accountName: e.target.value.toUpperCase()})} /></div>
             </div>
          </section>

          <div className="pt-10 border-t">
            <button onClick={onResetData} className="w-full py-5 bg-red-50 text-red-600 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2 shadow-sm"><Trash2 size={16} /> RESET TOÀN BỘ DỮ LIỆU</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

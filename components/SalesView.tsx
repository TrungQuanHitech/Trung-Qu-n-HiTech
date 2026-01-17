
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Contact, ContactType, Transaction, TransactionType, TransactionItem, BankConfig, InvoiceConfig, PrinterConfig } from '../types';
import { formatCurrency } from '../constants';
import { ShoppingCart, User, Plus, Minus, Trash2, Search, Printer, X, CheckCircle2, Image as ImageIcon, Box, ChevronRight, ScanBarcode } from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  contacts: Contact[];
  onCompleteSale: (transaction: Transaction) => void;
  bankConfig: BankConfig;
  invoiceConfig: InvoiceConfig;
  printerConfig: PrinterConfig;
}

const SalesView: React.FC<SalesViewProps> = ({ products, contacts, onCompleteSale, bankConfig, invoiceConfig, printerConfig }) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('WALKIN');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(0);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  // Global Barcode Listener (Supports USB Scanners acting as Keyboards)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      // Scanners typically send characters very fast (< 30ms apart)
      if (now - lastKeyTime.current > 50) {
        barcodeBuffer.current = '';
      }
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length >= 2) {
          const sku = barcodeBuffer.current;
          const product = products.find(p => p.sku === sku);
          if (product) {
            addToCart(product);
            setSearchTerm('');
          }
          barcodeBuffer.current = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Sản phẩm [${product.name}] đã hết hàng! Không thể bán.`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Không đủ tồn kho!");
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item);
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.salePrice, total: product.salePrice, image: product.image }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stock) { alert("Vượt quá tồn kho!"); return item; }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const handleSale = () => {
    if (cart.length === 0) return;
    const customer = contacts.find(c => c.id === selectedCustomerId);
    const transaction: Transaction = {
      id: `S${Date.now().toString().slice(-6)}`,
      type: TransactionType.SALE,
      date: new Date().toISOString(),
      contactId: selectedCustomerId === 'WALKIN' ? undefined : selectedCustomerId,
      contactName: customer?.name || 'Khách lẻ',
      items: [...cart], subtotal, discount, total,
      paidAmount: paidAmount || total,
      debtAmount: selectedCustomerId === 'WALKIN' ? 0 : Math.max(0, total - (paidAmount || total))
    };
    onCompleteSale(transaction);
    setLastTransaction(transaction);
    setShowInvoice(true);
    setCart([]);
    setSelectedCustomerId('WALKIN');
    setPaidAmount(0);
    setDiscount(0);
    setShowMobileCart(false);
  };

  const qrUrl = lastTransaction ? 
    `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact.png?amount=${lastTransaction.total}&addInfo=Don hang ${lastTransaction.id}&accountName=${encodeURIComponent(bankConfig.accountName)}` : '';

  const CartContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><ShoppingCart size={14}/> Giỏ hàng ({cart.length})</h3>
        <button onClick={() => setCart([])} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">Xóa</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <ScanBarcode size={40} strokeWidth={1} className="mb-2"/>
            <p className="text-[10px] font-black uppercase">Chưa có sản phẩm</p>
          </div>
        ) : cart.map(item => (
          <div key={item.productId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-gray-100">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase truncate text-slate-800 leading-tight">{item.name}</p>
              <p className="text-[10px] text-indigo-600 font-black mt-1">{formatCurrency(item.price).replace(' ₫', '')}</p>
            </div>
            <div className="flex items-center bg-white rounded-xl border">
              <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 text-gray-400 hover:text-indigo-600"><Minus size={12}/></button>
              <span className="text-[10px] font-black w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, 1)} className="p-2 text-gray-400 hover:text-indigo-600"><Plus size={12}/></button>
            </div>
            <button onClick={() => setCart(cart.filter(x => x.productId !== item.productId))} className="text-red-400 p-2"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
      <div className="p-6 border-t space-y-4 bg-gray-50/50">
        <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-xs font-black shadow-sm outline-none">
          <option value="WALKIN">Khách lẻ vãng lai</option>
          {contacts.filter(c => c.type === ContactType.CUSTOMER).map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
        </select>
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
             <span>Giảm giá</span>
             <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-24 text-right bg-white border border-gray-100 px-3 py-1.5 rounded-lg font-black outline-none" placeholder="0"/>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-dashed border-gray-100 mt-2">
             <span className="text-xs font-black text-slate-900 uppercase">Tổng cộng</span>
             <span className="text-xl font-black text-indigo-600">{formatCurrency(total)}</span>
          </div>
        </div>
        <button onClick={handleSale} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2">
           <ShoppingCart size={18} /> THANH TOÁN & IN
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden relative">
      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        <div className="relative shrink-0 sticky top-0 bg-gray-50 z-10 py-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm tên hoặc quét SKU..." className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-black text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="hidden sm:block text-[8px] font-black text-emerald-500 uppercase tracking-widest">Scanner Ready</span>
               <ScanBarcode size={20} className="text-indigo-600 animate-pulse"/>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-24 min-h-0 pr-1">
          {filteredProducts.map(p => {
            const isOutOfStock = p.stock <= 0;
            return (
              <button 
                key={p.id} 
                onClick={() => !isOutOfStock && addToCart(p)} 
                className={`flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all text-left group w-full ${isOutOfStock ? 'opacity-50' : 'hover:border-indigo-300 active:scale-[0.99]'}`}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-50 relative flex items-center justify-center">
                  {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-gray-200" />}
                  {isOutOfStock && <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center text-white text-[8px] font-black uppercase">Hết hàng</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-xs truncate uppercase leading-tight mb-1">{p.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.sku}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isOutOfStock ? 'text-red-500' : 'text-slate-500 bg-slate-50'}`}>Kho: {p.stock}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-indigo-600 font-black text-xs">{formatCurrency(p.salePrice).replace(' ₫', '')}</p>
                  <ChevronRight size={14} className="ml-auto text-gray-300 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:flex w-[400px] flex-col bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden shrink-0 h-full">
        <CartContent />
      </div>

      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button onClick={() => setShowMobileCart(true)} className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center relative">
          <ShoppingCart size={28} />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
        </button>
      </div>

      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileCart(false)} />
          <div className="relative bg-white rounded-t-[3rem] shadow-2xl h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3" />
            <button onClick={() => setShowMobileCart(false)} className="absolute top-4 right-6 text-gray-400 p-2"><X size={28}/></button>
            <CartContent />
          </div>
        </div>
      )}

      {showInvoice && lastTransaction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col h-full sm:h-auto sm:my-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0 no-print">
              <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Thành công</h3>
              <button onClick={() => setShowInvoice(false)} className="text-gray-400 p-2"><X size={24}/></button>
            </div>
            <div id="invoice-print-area" className="p-6 bg-white font-mono text-black leading-tight max-w-[80mm] mx-auto text-[9pt]">
               <h2 className="text-center font-black uppercase text-base mb-1">{invoiceConfig.storeName}</h2>
               <p className="text-center text-[7pt] mb-4 opacity-70">{invoiceConfig.address}</p>
               <div className="border-y border-black border-dashed py-2 mb-4 text-[7pt] uppercase font-bold flex flex-col gap-0.5">
                  <p>Mã đơn: #{lastTransaction.id}</p>
                  <p>Ngày: {new Date(lastTransaction.date).toLocaleString('vi-VN')}</p>
                  <p>Khách: {lastTransaction.contactName}</p>
               </div>
               <div className="space-y-1 mb-4 text-[7pt]">
                 <div className="flex justify-between font-black border-b border-black border-dashed pb-1 mb-1">
                   <span>Sản phẩm</span>
                   <span>T.Tiền</span>
                 </div>
                 {lastTransaction.items?.map((item, idx) => (
                   <div key={idx} className="flex justify-between">
                     <span className="uppercase pr-2">{item.name} x{item.quantity}</span>
                     <span>{formatCurrency(item.total).replace(' ₫', '')}</span>
                   </div>
                 ))}
               </div>
               <div className="border-t border-black border-dashed pt-2 space-y-1 font-black">
                  <div className="flex justify-between text-base"><span>TỔNG CỘNG:</span><span>{formatCurrency(lastTransaction.total)}</span></div>
                  <div className="flex justify-between text-[7pt] font-bold opacity-60"><span>Đã trả:</span><span>{formatCurrency(lastTransaction.paidAmount)}</span></div>
                  {lastTransaction.debtAmount > 0 && <div className="flex justify-between text-red-600"><span>Còn nợ:</span><span>{formatCurrency(lastTransaction.debtAmount)}</span></div>}
               </div>

               {/* QR VIETQR IN PRINTED INVOICE */}
               <div className="mt-6 flex flex-col items-center border-t border-black border-dashed pt-4">
                 <div className="p-1 border-2 border-black rounded-lg mb-2">
                   <img src={qrUrl} alt="VIETQR" className="w-28 h-28" />
                 </div>
                 <div className="text-[7pt] text-center font-black uppercase">
                   <p>QUÉT MÃ THANH TOÁN</p>
                   <p className="mt-0.5 opacity-50">{bankConfig.bankId.toUpperCase()} - {bankConfig.accountNo}</p>
                 </div>
               </div>

               <p className="text-center mt-6 text-[7pt] italic border-t border-black border-dashed pt-4">{invoiceConfig.footerMessage}</p>
               <p className="text-center mt-2 text-[5pt] opacity-30 uppercase tracking-widest font-black">SmartBiz System</p>
            </div>
            <div className="p-6 bg-gray-50 border-t space-y-3 no-print">
               <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg">
                 <Printer size={18} /> IN HÓA ĐƠN
               </button>
               <button onClick={() => setShowInvoice(false)} className="w-full py-4 text-gray-500 font-bold uppercase text-[9px] border border-gray-200 rounded-2xl">Hoàn tất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;

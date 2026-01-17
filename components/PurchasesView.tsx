
import React, { useState, useMemo } from 'react';
import { Product, Contact, ContactType, Transaction, TransactionType, TransactionItem } from '../types';
import { formatCurrency, generateSKU } from '../constants';
import { Truck, Package, Plus, Minus, Trash2, ArrowDownCircle, PlusCircle, X, Search, RefreshCw, Image as ImageIcon, ShoppingCart } from 'lucide-react';

interface PurchasesViewProps {
  products: Product[];
  contacts: Contact[];
  onCompletePurchase: (transaction: Transaction) => void;
  onQuickAddProduct: (p: Product) => void;
}

const PurchasesView: React.FC<PurchasesViewProps> = ({ products, contacts, onCompletePurchase, onQuickAddProduct }) => {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [showMobileSlip, setShowMobileSlip] = useState(false);
  
  const [newProd, setNewProd] = useState<Omit<Product, 'id' | 'stock' | 'minStock'>>({ 
    name: '', 
    sku: '', 
    category: '', 
    costPrice: 0, 
    salePrice: 0, 
    unit: 'Cái',
    image: ''
  });

  const suppliers = contacts.filter(c => c.type === ContactType.SUPPLIER);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const addItem = (product: Product) => {
    const existing = items.find(item => item.productId === product.id);
    if (existing) {
      setItems(items.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item
      ));
    } else {
      setItems([...items, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        price: product.costPrice, 
        total: product.costPrice,
        image: product.image 
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const handlePurchase = () => {
    if (items.length === 0) return alert('Chưa chọn mặt hàng nhập!');
    if (!selectedSupplierId) return alert('Vui lòng chọn nhà cung cấp!');
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const transaction: Transaction = {
      id: `P${Date.now().toString().slice(-6)}`,
      type: TransactionType.PURCHASE,
      date: new Date().toISOString(),
      contactId: selectedSupplierId,
      contactName: supplier?.name || 'NCC lẻ',
      items,
      subtotal: items.reduce((sum, item) => sum + item.total, 0),
      discount: 0,
      total: items.reduce((sum, item) => sum + item.total, 0),
      paidAmount,
      debtAmount: Math.max(0, items.reduce((sum, item) => sum + item.total, 0) - paidAmount),
    };
    onCompletePurchase(transaction);
    setItems([]);
    setSelectedSupplierId('');
    setPaidAmount(0);
    setShowMobileSlip(false);
  };

  const SlipContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-orange-600 text-white flex justify-between items-center shrink-0">
        <h3 className="font-black text-xs uppercase tracking-widest">Phiếu nhập ({items.length})</h3>
        <button onClick={() => setItems([])} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">Xóa</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <Package size={32} strokeWidth={1} />
            <p className="text-[9px] font-black uppercase mt-2">Phiếu đang trống</p>
          </div>
        ) : items.map(item => (
          <div key={item.productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
              <p className="text-[10px] text-orange-600 font-bold">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center bg-white rounded-lg shadow-sm border">
              <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 hover:bg-gray-100"><Minus size={10}/></button>
              <span className="text-[10px] font-black w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, 1)} className="p-2 hover:bg-gray-100"><Plus size={10}/></button>
            </div>
            <button onClick={() => setItems(items.filter(x => x.productId !== item.productId))} className="text-red-400 p-1"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
      <div className="p-6 border-t space-y-4 shrink-0 bg-gray-50/50">
        <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full p-3 bg-white border rounded-xl text-xs font-bold outline-none shadow-sm">
          <option value="">-- Chọn nhà cung cấp --</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest"><span>Tổng tiền nhập</span><span>{formatCurrency(items.reduce((s, x) => s + x.total, 0))}</span></div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Thực trả NCC</span>
            <input type="number" value={paidAmount || ''} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-24 text-right bg-white border border-gray-100 px-2 py-1 rounded-md font-black text-gray-900 text-xs" placeholder="0" />
          </div>
        </div>
        <button onClick={handlePurchase} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase">
          <ArrowDownCircle size={18} /> XÁC NHẬN NHẬP KHO
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-0 h-full overflow-hidden relative">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Tìm mã hoặc tên..." className="w-full pl-11 pr-4 py-3 border border-gray-100 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsNewProductModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-orange-600 bg-orange-50 hover:bg-orange-100 px-5 py-3 rounded-2xl transition-all border border-orange-100 uppercase">
            <PlusCircle size={16} /> TẠO MÃ MỚI
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-24 min-h-0">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => addItem(p)} className="w-full flex items-center bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all text-left active:scale-[0.98]">
              <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={18}/></div>}
              </div>
              <div className="flex-1 ml-3 min-w-0">
                <h4 className="font-black text-gray-900 text-xs truncate uppercase tracking-tight leading-none mb-1">{p.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">{p.sku} | Tồn: {p.stock}</span>
                  <span className="text-orange-600 font-black text-xs">{formatCurrency(p.costPrice)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[400px] flex-col bg-white rounded-3xl border shadow-xl overflow-hidden shrink-0 h-full">
        <SlipContent />
      </div>

      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setShowMobileSlip(true)}
          className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center relative animate-pulse"
        >
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      {showMobileSlip && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSlip(false)} />
          <div className="relative bg-white rounded-t-[2.5rem] shadow-2xl h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3" />
            <button onClick={() => setShowMobileSlip(false)} className="absolute top-4 right-6 text-gray-400 p-2"><X size={24}/></button>
            <SlipContent />
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-black text-gray-800 tracking-tight uppercase">Tạo nhanh sản phẩm</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="p-2 text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const p: Product = { ...newProd, id: 'p' + Date.now(), stock: 0, minStock: 5 }; onQuickAddProduct(p); addItem(p); setIsNewProductModalOpen(false); }} className="p-6 space-y-6">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Tên sản phẩm</label>
                <input required type="text" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value, sku: generateSKU(e.target.value)})} placeholder="iPhone 16..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Giá nhập</label>
                  <input required type="number" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" value={newProd.costPrice} onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Đơn vị</label>
                  <input required type="text" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm" value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl text-xs uppercase tracking-widest">THÊM VÀO PHIẾU NHẬP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesView;

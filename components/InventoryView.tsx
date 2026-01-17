
import React, { useState, useRef, useEffect } from 'react';
import { Product, Transaction, TransactionType, BarcodeConfig } from '../types';
import { formatCurrency, generateSKU } from '../constants';
import { Search, Plus, Minus, Edit3, Trash2, X, Image as ImageIcon, Upload, ChevronRight, ScanBarcode, Printer, AlertTriangle } from 'lucide-react';

declare var JsBarcode: any;

interface InventoryViewProps {
  products: Product[];
  transactions: Transaction[];
  barcodeConfig: BarcodeConfig;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, transactions, barcodeConfig, onAddProduct, onDeleteProduct, onUpdateProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeToPrint, setBarcodeToPrint] = useState<{product: Product, count: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '', sku: '', category: '', unit: 'Cái', costPrice: 0, salePrice: 0, stock: 0, minStock: 5, image: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("Dưới 1MB!"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingProduct) setEditingProduct({ ...editingProduct, image: reader.result as string });
        else setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
    } else {
      onAddProduct({ ...newProduct, id: 'p' + Date.now() } as Product);
      setIsModalOpen(false);
      setNewProduct({ name: '', sku: '', category: '', unit: 'Cái', costPrice: 0, salePrice: 0, stock: 0, minStock: 5, image: '' });
    }
  };

  useEffect(() => {
    if (barcodeToPrint) {
      setTimeout(() => {
        const svgs = document.querySelectorAll('.barcode-svg');
        svgs.forEach((svg) => {
          JsBarcode(svg, barcodeToPrint.product.sku, {
            format: "CODE128", width: 1.5, height: 35, displayValue: true, fontSize: barcodeConfig.fontSize, margin: 0
          });
        });
      }, 100);
    }
  }, [barcodeToPrint, barcodeConfig]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row gap-2 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Tìm tên hoặc SKU..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
          <Plus size={16}/> Thêm hàng
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:bg-gray-50 transition-all">
            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
              {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-gray-200" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-800 text-xs truncate uppercase leading-tight mb-1">{p.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock <= p.minStock ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>Tồn: {p.stock}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{p.sku}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-indigo-600 font-black text-xs">{formatCurrency(p.salePrice).replace(' ₫', '')}</p>
            </div>
            <div className="flex gap-1 shrink-0 ml-1">
              <button onClick={() => setBarcodeToPrint({ product: p, count: 2 })} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600"><ScanBarcode size={14}/></button>
              <button onClick={() => setEditingProduct(p)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-orange-500"><Edit3 size={14}/></button>
              <button onClick={() => { setProductToDelete(p); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Barcode Print Modal */}
      {barcodeToPrint && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col h-[80vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 no-print">
              <h3 className="text-xs font-black uppercase tracking-widest">In {barcodeToPrint.count} mã vạch</h3>
              <button onClick={() => setBarcodeToPrint(null)} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-print space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border justify-center">
                <button onClick={() => setBarcodeToPrint({...barcodeToPrint, count: Math.max(1, barcodeToPrint.count - 1)})} className="p-2 bg-white rounded-xl"><Minus size={18}/></button>
                <div className="text-center w-20"><span className="text-xl font-black">{barcodeToPrint.count}</span><p className="text-[8px] font-bold text-gray-400 uppercase">Tem</p></div>
                <button onClick={() => setBarcodeToPrint({...barcodeToPrint, count: barcodeToPrint.count + 1})} className="p-2 bg-white rounded-xl"><Plus size={18}/></button>
              </div>
              <div className="border border-dashed p-4 flex flex-wrap gap-2 justify-center opacity-50">
                {Array.from({ length: Math.min(6, barcodeToPrint.count) }).map((_, i) => (
                  <div key={i} className="border p-2 bg-white"><svg className="barcode-svg !w-24 !h-12"></svg></div>
                ))}
                {barcodeToPrint.count > 6 && <div className="p-4 text-xs font-bold text-gray-400">...và {barcodeToPrint.count - 6} tem khác</div>}
              </div>
            </div>
            
            <div id="barcode-print-area" className="hidden print:flex print:flex-wrap">
              {Array.from({ length: barcodeToPrint.count }).map((_, i) => (
                <div key={i} style={{ 
                  width: `${100/barcodeConfig.labelsPerRow}%`, 
                  height: `${barcodeConfig.height}mm`, 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  padding: '2mm', boxSizing: 'border-box', pageBreakInside: 'avoid'
                }}>
                  {barcodeConfig.showName && <p style={{ fontSize: `${barcodeConfig.fontSize}pt`, fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{barcodeToPrint.product.name}</p>}
                  <svg className="barcode-svg" style={{ maxWidth: '100%' }}></svg>
                  {barcodeConfig.showPrice && <p style={{ fontSize: `${barcodeConfig.fontSize + 2}pt`, fontWeight: 'black', margin: 0 }}>{formatCurrency(barcodeToPrint.product.salePrice).replace(' ₫', '')}</p>}
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t no-print">
              <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2"><Printer size={20}/> IN NGAY</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(isModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[120] p-0 sm:p-4 flex items-center justify-center">
          <div className="bg-white rounded-none sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col h-full sm:h-auto max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xs font-black uppercase tracking-widest">{editingProduct ? 'Sửa hàng hóa' : 'Thêm hàng hóa'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="p-2 text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
                  {(editingProduct?.image || newProduct.image) ? <img src={editingProduct?.image || newProduct.image} className="w-full h-full object-cover" /> : <><Upload className="text-gray-300" size={24}/><span className="text-[8px] font-black text-gray-400 uppercase">Ảnh</span></>}
                </div>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, !!editingProduct)} />
              </div>
              <div className="space-y-4">
                <div><label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Tên mặt hàng</label><input required type="text" className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-xs uppercase" value={editingProduct?.name || newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value, sku: generateSKU(e.target.value)})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Giá vốn</label><input type="number" className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-xs" value={editingProduct?.costPrice || newProduct.costPrice} onChange={e => editingProduct ? setEditingProduct({...editingProduct, costPrice: Number(e.target.value)}) : setNewProduct({...newProduct, costPrice: Number(e.target.value)})} /></div>
                  <div><label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Giá bán</label><input type="number" className="w-full p-3 bg-indigo-50 border-indigo-100 rounded-xl font-black text-indigo-600 text-xs" value={editingProduct?.salePrice || newProduct.salePrice} onChange={e => editingProduct ? setEditingProduct({...editingProduct, salePrice: Number(e.target.value)}) : setNewProduct({...newProduct, salePrice: Number(e.target.value)})} /></div>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">LƯU THÔNG TIN</button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-[2rem] max-w-xs w-full text-center space-y-4">
            <AlertTriangle className="mx-auto text-red-500" size={40}/>
            <h3 className="font-black uppercase text-xs">Xác nhận xóa?</h3>
            <p className="text-[10px] text-gray-500 font-bold">Dữ liệu sản phẩm <span className="text-slate-900">{productToDelete.name}</span> sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl font-black uppercase text-[10px]">Hủy</button>
              <button onClick={() => { onDeleteProduct(productToDelete.id); setIsDeleteModalOpen(false); }} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-black uppercase text-[10px]">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;

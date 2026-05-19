import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Package, Tag, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Products() {
  const { dbStatus } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({ 
    queryKey: ['products', search], 
    queryFn: () => axios.get(`/api/products?search=${search}`).then(res => res.data) 
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    // Explicitly cast numeric fields
    const data = {
      ...rawData,
      sellingPrice: Number(rawData.sellingPrice),
      stockQuantity: Number(rawData.stockQuantity),
      reorderLevel: Number(rawData.reorderLevel),
      taxRate: Number(rawData.taxRate)
    };
    
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data);
        alert('Product updated successfully');
      } else {
        await axios.post('/api/products', data);
        setSearch(''); // Clear search so the new item is visible
        alert('Product registered successfully');
      }
      setModalOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error saving product';
      alert(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Inventory Management System</h2>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Master Product Catalog</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded font-black text-[10px] uppercase shadow-md hover:bg-emerald-700 transition-all tracking-widest"
        >
          <Plus size={14} /> NEW ENTRY
        </button>
      </div>

      <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="FILTER CATALOG..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none placeholder:text-slate-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-200">
              <th className="px-5 py-3 w-1/3">Item Title / SKU</th>
              <th className="px-5 py-3">Dept / Category</th>
              <th className="px-5 py-3 text-center">UOM</th>
              <th className="px-5 py-3">Selling Price (NPR)</th>
              <th className="px-5 py-3">Inventory Count</th>
              <th className="px-5 py-3 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-mono text-xs uppercase">Retrieving Data...</td></tr>
            ) : Array.isArray(products) && products.length > 0 ? products.map((p: any) => (
              <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-400">
                       <Package size={14} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.productName}</p>
                      <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">{p.barcode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-2.5">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-black uppercase">{p.category}</span>
                </td>
                <td className="px-5 py-2.5 text-center">
                   <span className="text-[9px] text-slate-400 uppercase font-black">{p.unit}</span>
                </td>
                <td className="px-5 py-2.5 font-black text-slate-900 font-mono text-sm italic">
                  {p.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-black font-mono text-sm italic", p.stockQuantity <= p.reorderLevel ? "text-rose-600" : "text-emerald-700")}>
                      {p.stockQuantity}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 uppercase font-black leading-none">Safety</span>
                        <span className="text-[9px] text-slate-500 font-bold leading-none">{p.reorderLevel}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-100 rounded">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if(confirm('Delete product?')) deleteMutation.mutate(p._id); }} className="p-1.5 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={6} className="p-20 text-center">
                        <Package className="mx-auto text-slate-200 mb-3" size={40} />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No matching records found in catalog</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.98, opacity: 0 }}
               className="bg-white rounded border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden"
             >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{editingProduct ? 'Edit Record' : 'New Catalog Entry'}</h3>
                   <span className="text-[9px] font-black text-slate-400 uppercase">Product Module</span>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                   {dbStatus === 'disconnected' && (
                       <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded text-[9px] font-black text-amber-700 uppercase tracking-widest text-center">
                           ⚠️ Operational Notice: Demo Mode Active (Records will not persist)
                       </div>
                   )}
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Item Title</label>
                      <input name="productName" defaultValue={editingProduct?.productName} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Unique Identifier / SKU</label>
                      <input name="barcode" defaultValue={editingProduct?.barcode} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono uppercase" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Dept / Category</label>
                      <input name="category" defaultValue={editingProduct?.category} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold uppercase" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">UOM (Unit of Measure)</label>
                      <input name="unit" defaultValue={editingProduct?.unit || 'pcs'} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold uppercase tracking-widest" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Selling Price (NPR)</label>
                      <input name="sellingPrice" type="number" step="0.01" defaultValue={editingProduct?.sellingPrice} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono italic font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Inventory Count</label>
                      <input name="stockQuantity" type="number" defaultValue={editingProduct?.stockQuantity || 0} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Safety Stock Level</label>
                      <input name="reorderLevel" type="number" defaultValue={editingProduct?.reorderLevel || 10} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Tax Configuration</label>
                      <select name="taxRate" defaultValue={editingProduct?.taxRate || 13} className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-black uppercase">
                          <option value="13">13% Standard VAT</option>
                          <option value="0">0% Non-Taxable / Exempt</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">Abort</button>
                    <button type="submit" className="px-8 py-2 bg-slate-900 text-white rounded font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all tracking-widest">
                       {editingProduct ? 'Commit Changes' : 'Register Item'}
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

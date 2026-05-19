import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Package, AlertTriangle, TrendingUp, ArrowDownCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Inventory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = useQuery({ 
    queryKey: ['products', search], 
    queryFn: () => axios.get(`/api/products?search=${search}`).then(res => res.data) 
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string, stock: number }) => axios.put(`/api/products/${id}`, { stockQuantity: stock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleStockUpdate = (p: any, change: number) => {
    const newStock = Math.max(0, p.stockQuantity + change);
    updateStockMutation.mutate({ id: p._id, stock: newStock });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Inventory Adjustment Hub</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Real-time stock synchronization and control</p>
      </div>

      <div className="max-w-xl flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="FILTER STOCK POOL..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none uppercase tracking-widest placeholder:text-slate-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.isArray(products) ? products.map((p: any) => (
          <motion.div 
            layout
            key={p._id}
            className={cn(
              "p-4 rounded border transition-all shadow-sm",
              p.stockQuantity <= p.reorderLevel ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 text-sm truncate">{p.productName}</p>
                <p className="text-[9px] text-slate-400 font-mono italic tracking-tighter uppercase">{p.barcode}</p>
              </div>
              {p.stockQuantity <= p.reorderLevel && (
                <div className="text-rose-500 animate-pulse shrink-0">
                  <AlertTriangle size={16} />
                </div>
              )}
            </div>

            <div className="flex items-end justify-between bg-white/50 p-2 rounded border border-slate-100">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">On Hand</p>
                <p className={cn("text-2xl font-black font-mono italic", p.stockQuantity <= p.reorderLevel ? "text-rose-600" : "text-emerald-700")}>
                  {p.stockQuantity} <span className="text-[10px] font-black text-slate-400 uppercase not-italic ml-1">{p.unit}</span>
                </p>
              </div>
              
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleStockUpdate(p, 10)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm transition-all uppercase"
                >
                  ADD 10
                </button>
                <button 
                  onClick={() => handleStockUpdate(p, -10)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-sm transition-all uppercase"
                >
                  SUB 10
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-slate-400 italic">Reorder: {p.reorderLevel}</span>
              <span className={p.stockQuantity > p.reorderLevel ? "text-emerald-600" : "text-rose-600"}>
                {p.stockQuantity > p.reorderLevel ? "Level Stable" : "REPLENISH NOW"}
              </span>
            </div>
          </motion.div>
        )) : null}
      </div>
    </div>
  );
}

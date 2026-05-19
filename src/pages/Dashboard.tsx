import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp, Users, ShoppingBag, Clock, Package, AlertCircle, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import PrintableReceipt from '../components/PrintableReceipt';

export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: () => axios.get('/api/config').then(res => res.data) });
  const { data: sales } = useQuery({ queryKey: ['sales'], queryFn: () => axios.get('/api/analytics/sales').then(res => res.data) });
  const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: () => axios.get('/api/billing/transactions').then(res => res.data) });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => axios.get('/api/products').then(res => res.data) });

  const productList = Array.isArray(products) ? products : [];
  const lowStock = productList.filter((p: any) => p.stockQuantity <= p.reorderLevel);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(sales?.total || 0), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Transactions', value: sales?.count || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Catalog Size', value: productList.length, icon: Package, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    { label: 'Inventory Alerts', value: lowStock.length, icon: AlertCircle, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label} 
            className={cn("bg-white p-5 rounded border shadow-sm flex items-center gap-4", stat.color.split(' ').filter(c => c.startsWith('border')).join(' '))}
          >
            <div className={cn("w-10 h-10 rounded border flex items-center justify-center shrink-0", stat.color)}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 font-mono tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 xl:col-span-8 bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
               <Clock size={14} className="text-slate-400" />
               Live Transaction Feed
            </h3>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Real-time</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 sticky top-0 z-[5]">
                   <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-5 py-2">Invoice ID</th>
                      <th className="px-5 py-2">Timestamp</th>
                      <th className="px-5 py-2">Method</th>
                      <th className="px-5 py-2 text-right">Amount</th>
                      <th className="px-5 py-2 text-right">Review</th>
                      <th className="px-5 py-2 text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Array.isArray(transactions) ? transactions.map((t: any) => (
                    <tr 
                      key={t._id} 
                      onClick={() => setSelectedTransaction(t)}
                      className="hover:bg-slate-50 transition-all group cursor-pointer"
                    >
                      <td className="px-5 py-2.5 font-bold text-slate-900 font-mono text-sm uppercase tracking-tighter">{t.invoiceId}</td>
                      <td className="px-5 py-2.5 text-[10px] text-slate-500 font-medium">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-2.5">
                        <span className="text-[9px] font-black uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{t.paymentMode}</span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-black text-slate-900 font-mono italic">{formatCurrency(t.grandTotal)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="flex justify-end">
                          <button 
                            className="p-1.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all group-hover:scale-110"
                            title="Review Invoice"
                          >
                            <TrendingUp size={14} className="rotate-45" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded border shadow-sm",
                          t.paymentStatus === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>{t.paymentStatus}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-300 font-mono text-[10px] uppercase tracking-widest italic">
                        {transactions ? 'Data format mismatch' : 'Retrieving transaction records...'}
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
           <div className="px-5 py-3 border-b border-rose-100 flex justify-between items-center bg-rose-50/40">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
               <AlertCircle size={14} className="text-rose-500" />
               Critical Alerts
            </h3>
            <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-black">{lowStock.length} ISSUE</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {lowStock.map((p: any) => (
              <div key={p._id} className="p-4 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{p.productName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.category} | {p.barcode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-rose-600 font-mono italic">{p.stockQuantity} {p.unit}</p>
                  <div className="w-16 h-1 mt-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(p.stockQuantity / p.reorderLevel) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && (
                <div className="p-12 text-center">
                   <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                      <Package size={24} />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Optimized</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors z-[60] print:hidden"
            >
              <X size={20} />
            </button>
            <PrintableReceipt 
              transaction={selectedTransaction} 
              config={config}
              onClose={() => setSelectedTransaction(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

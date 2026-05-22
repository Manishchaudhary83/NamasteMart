import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { Printer, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function PrintReceipt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [configRes, transRes] = await Promise.all([
          axios.get('/api/config'),
          axios.get(`/api/billing/transactions/${id}`)
        ]);
        
        setConfig(configRes.data);
        setTransaction(transRes.data);
      } catch (err: any) {
        console.error('Failed to load printable invoice data:', err);
        setError(err.response?.data?.message || 'Failed to retrieve receipt details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchData();
    }
  }, [id]);

  // Attempt to trigger auto Printing once successfully loaded
  useEffect(() => {
    if (transaction && config) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [transaction, config]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.close();
    } else {
      navigate('/billing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono text-sm uppercase tracking-widest text-slate-500 font-bold">Preparing Invoice...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-rose-100">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <h2 className="text-lg font-black uppercase text-slate-900 mb-2">Invoice Error</h2>
          <p className="text-slate-500 text-sm font-mono mb-6">{error || 'Receipt was not found in database records'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs transition-all uppercase tracking-widest"
            >
              Back to POS
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all uppercase tracking-widest"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:p-0 print:bg-white flex flex-col items-center">
      
      {/* Print Control Bar - Hidden in print mode */}
      <div className="w-[80mm] mb-4 flex justify-between items-center print:hidden shrink-0 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
          title="Go Back or Close Tab"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="text-[10px] font-black text-slate-400 font-mono">BILL #{transaction.invoiceId}</span>
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-colors flex items-center gap-1"
        >
          <Printer size={14} />
          PRINT
        </button>
      </div>

      {/* Actual Thermal Paper Roll container */}
      <div 
        id="thermal-bill"
        className="bg-white w-[80mm] p-6 shadow-md print:shadow-none print:p-2 border border-slate-200 print:border-none font-mono text-[11px] leading-tight text-black"
      >
        {/* Mart Info */}
        <div className="text-center mb-5 space-y-1">
          <h1 className="text-lg font-black uppercase tracking-tight">{config?.martName || 'NAMASTE MART'}</h1>
          <p className="whitespace-pre-line text-[10px] leading-relaxed opacity-80">{config?.address || 'Kathmandu, Nepal'}</p>
          <p className="text-[10px]">Tel: {config?.phone || '01-xxxxxxx'}</p>
          
          <div className="my-3 border-y py-1 font-bold uppercase tracking-widest text-[9px] border-black border-dashed">
            Tax Invoice
          </div>
        </div>

        {/* Bill Metadata */}
        <div className="mb-4 space-y-1 text-[10px] tabular-nums">
          <div className="flex justify-between">
            <span>Bill No:</span>
            <span className="font-bold">{transaction.invoiceId}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Mode:</span>
            <span className="uppercase font-bold">{transaction.paymentMode}</span>
          </div>
          {transaction.customerName && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold uppercase">{transaction.customerName}</span>
            </div>
          )}
          {transaction.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{transaction.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-3 border-t border-black border-dashed">
          <thead>
            <tr className="border-b border-black border-dashed text-[9px] font-black">
              <th className="py-1 text-left">DESCRIPTION</th>
              <th className="py-1 text-center w-8">QTY</th>
              <th className="py-1 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {(transaction.items || []).map((item: any, idx: number) => (
              <tr key={idx} className="align-top border-b border-black border-dotted">
                <td className="py-1.5 pr-2">
                  <p className="font-bold uppercase leading-tight mb-0.5">{item.productName}</p>
                  <p className="text-[8px] italic opacity-75">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </td>
                <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                <td className="py-1.5 text-right font-bold">{formatCurrency(item.subtotal || (item.quantity * item.unitPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculations / Totals */}
        <div className="space-y-1 border-t border-black border-dashed pt-2 tabular-nums">
          <div className="flex justify-between text-[10px]">
            <span>Sub-Total:</span>
            <span>{formatCurrency(transaction.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>VAT:</span>
            <span>{formatCurrency(transaction.totalVAT || 0)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold border-t border-black/10 pt-1">
            <span>Amount with VAT:</span>
            <span>{formatCurrency((transaction.subtotal || 0) + (transaction.totalVAT || 0))}</span>
          </div>
          
          {transaction.loyaltyDiscount > 0 && (
            <div className="flex justify-between font-bold text-red-650">
              <span>Loyalty Discount:</span>
              <span>-{formatCurrency(transaction.loyaltyDiscount)}</span>
            </div>
          )}
          {transaction.manualDiscount > 0 && (
            <div className="flex justify-between font-bold text-red-650">
              <span>Manual Discount:</span>
              <span>-{formatCurrency(transaction.manualDiscount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-ce font-black border-t-2 border-black border-double pt-1.5 mt-1 text-xs">
            <span>GRAND TOTAL:</span>
            <span>{formatCurrency(transaction.grandTotal || 0)}</span>
          </div>
        </div>

        {/* Invoice Footer Block */}
        <div className="mt-6 text-center space-y-3 pt-2">
          <p className="text-[9px] font-black tracking-widest">--- THANK YOU ---</p>
          <p className="text-[8px] italic opacity-75">Goods once sold will not be taken back</p>
          
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="h-5 w-48 bg-black flex items-center justify-center">
              <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px, transparent 3px)', backgroundSize: '4px 100%' }}></div>
            </div>
            <p className="text-[7px] tracking-[0.3em] font-bold">{transaction.invoiceId}</p>
          </div>
          
          <div className="pt-2 text-[7px] space-y-0.5">
            <div className="opacity-60 uppercase">
              Billed by: {transaction.cashier || 'System Admin'}
            </div>
            <div className="font-bold uppercase tracking-tight text-slate-800">
              All right reserved 2026 and created by Manish chaudhary
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS settings so print fits cleanly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden, button {
            display: none !important;
          }
          #thermal-bill {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 80mm !important;
            padding: 4mm !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}

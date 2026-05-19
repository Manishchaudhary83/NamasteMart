import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Trash2, CreditCard, Wallet, User as UserIcon, Barcode, Phone, ReceiptText, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

export default function Billing() {
  const { items, addItem, removeItem, updateQuantity, subtotal, totalVAT, grandTotal, clearCart } = useCart();
  const { dbStatus } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'eSewa_QR' | 'Card'>('Cash');
  const [qrModal, setQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search.length > 2) {
      const fetchProducts = async () => {
        const { data } = await axios.get(`/api/products?search=${search}`);
        setProducts(data);
      };
      const timeout = setTimeout(fetchProducts, 300);
      return () => clearTimeout(timeout);
    } else {
      setProducts([]);
    }
  }, [search]);

  const handlePhoneLookup = async () => {
    if (customerPhone.length === 10) {
      try {
        const { data } = await axios.get(`/api/customers/${customerPhone}`);
        setCustomer(data);
      } catch (e) {
        setCustomer(null);
      }
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    try {
      const { data } = await axios.get(`/api/products/barcode/${search.trim()}`);
      addItem(data);
      setSearch('');
    } catch (e: any) {
      // If not found by barcode, try searching by name and take the first exact match
      try {
        const { data: searchResults } = await axios.get(`/api/products?search=${search.trim()}`);
        if (searchResults.length > 0) {
          // If there's an exact name match, add it
          const exactMatch = searchResults.find((p: any) => p.productName.toLowerCase() === search.trim().toLowerCase());
          if (exactMatch) {
            addItem(exactMatch);
            setSearch('');
            setProducts([]);
          } else if (searchResults.length === 1) {
            // Or if there's only one result, add it
            addItem(searchResults[0]);
            setSearch('');
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Search failed', err);
      }
    }
  };

  const generatePaymentQR = async () => {
      const { data } = await axios.get('/api/config');
      const invoiceId = `INV-${Date.now()}`;
      // Simulating eSewa dynamic QR payload
      const qrData = `esewa://pay?merchant=${data.esewaMerchantCode}&amount=${grandTotal}&invoice=${invoiceId}`;
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
      setQrModal(true);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await axios.post('/api/billing/checkout', {
        items,
        customerPhone,
        paymentMode,
        paymentReferenceId: 'REF-' + Date.now()
      });
      alert('Transaction Completed!');
      clearCart();
      setCustomerPhone('');
      setCustomer(null);
      setQrModal(false);
    } catch (error: any) {
      alert('Checkout Failed: ' + error.response?.data?.message || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0.5 h-[calc(100vh-6rem)] bg-slate-200 -m-8">
      {/* Left Panel: Cart & Search */}
      <div className="lg:col-span-8 flex flex-col bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3 shadow-sm z-10">
          <form id="barcode-form" onSubmit={handleBarcodeSubmit} className="relative flex-grow">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Scan Barcode or Search Product (F1)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-lg font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            
            <AnimatePresence>
              {products.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-b border border-slate-200 z-50 mt-1 max-h-80 overflow-y-auto"
                >
                  {products.map(p => (
                    <button
                      type="button"
                      key={p._id}
                      onClick={() => { addItem(p); setSearch(''); setProducts([]); }}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b last:border-none border-slate-100"
                    >
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-sm">{p.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{p.barcode} • STOCK: {p.stockQuantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 font-mono">{formatCurrency(p.sellingPrice)}</p>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{p.unit}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <button 
            type="submit" 
            form="barcode-form"
            className="px-6 bg-slate-900 text-white font-black rounded text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md"
          >
            ADD ITEM
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8">
                <Barcode size={64} strokeWidth={1} className="opacity-20" />
                <p className="mt-4 font-black uppercase tracking-widest text-sm">Waiting for Entry</p>
                <p className="text-[10px] uppercase font-bold tracking-tighter">Scan items to begin billing operation</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-slate-100 z-[5] border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-2 w-1/2">Item Details</th>
                    <th className="py-3 px-2 text-right">Unit Price</th>
                    <th className="py-3 px-2 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <motion.tr layout key={item.productId} className="text-sm hover:bg-slate-50 group">
                      <td className="py-3 px-4 text-center text-slate-400 text-xs font-mono">{index + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.barcode}</p>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-medium text-slate-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 border border-slate-200 bg-white rounded flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm text-xs">-</button>
                          <span className="font-black text-slate-900 w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 border border-slate-200 bg-white rounded flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm text-xs">+</button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-3 group">
                           <span className="font-black text-slate-900 font-mono">{formatCurrency(item.unitPrice * item.quantity)}</span>
                           <button onClick={() => removeItem(item.productId)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-1">
                            <Trash2 size={14} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Shortcut bar placeholder for design */}
        <div className="h-8 bg-slate-100 border-t border-slate-200 flex items-center px-4 justify-between text-[9px] font-black text-slate-500 uppercase tracking-tighter">
          <div className="flex gap-4">
             <span>[F1] Search</span>
             <span>[F2] Edit Qty</span>
             <span>[F8] Cash</span>
             <span>[F10] eSewa</span>
             <span>[F12] Checkout</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
             CONNECTED
          </div>
        </div>
      </div>

      {/* Right Panel: Summary */}
      <div className="lg:col-span-4 flex flex-col bg-white border-l border-slate-200">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Lookup</h3>
            <button className="text-[10px] font-black text-emerald-600 hover:underline">+ REGISTER</button>
          </div>
          <div className="flex gap-1.5 mb-4">
            <input 
              type="text" 
              placeholder="98XXXXXXXX" 
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded font-bold text-sm tracking-widest outline-none focus:ring-1 focus:ring-emerald-500"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={handlePhoneLookup}
            />
            <button 
              onClick={handlePhoneLookup}
              className="px-4 bg-slate-200 text-slate-600 rounded text-[10px] font-black uppercase hover:bg-slate-300 transition-all"
            >
              FIND
            </button>
          </div>
          
          {customer ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-3 rounded border shadow-sm",
                customer.membershipTier === 'Gold' ? "bg-amber-50 border-amber-200" : 
                customer.membershipTier === 'Silver' ? "bg-slate-50 border-slate-300" : "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">{customer.fullName}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Points: <span className="text-emerald-600">{customer.loyaltyPoints.toLocaleString()}</span></p>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 text-[9px] rounded font-black border",
                  customer.membershipTier === 'Gold' ? "bg-amber-200 text-amber-800 border-amber-300" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                )}>
                  {customer.membershipTier} MEMBER
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                 <p className="text-[9px] font-black text-emerald-700 uppercase">{customer.membershipTier === 'Gold' ? '10%' : customer.membershipTier === 'Silver' ? '5%' : 'Standard'} Tier Discount Active</p>
              </div>
            </motion.div>
          ) : (
            <div className="p-3 border border-dashed border-slate-300 rounded bg-white text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase italic">Walk-in Customer</p>
            </div>
          )}
        </div>

        <div className="p-6 flex-grow flex flex-col justify-end bg-white">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span>Sub Total</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span>VAT (13%)</span>
              <span className="font-mono">{formatCurrency(totalVAT)}</span>
            </div>
            {customer && (
              <div className="flex justify-between text-emerald-600 text-xs font-black uppercase tracking-widest">
                <span>Loyalty Disc.</span>
                <span className="font-mono">-{formatCurrency(subtotal * (customer.membershipTier === 'Gold' ? 0.1 : customer.membershipTier === 'Silver' ? 0.05 : 0))}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-4"></div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grand Total</span>
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
                  <span className="text-xl mr-1">Rs.</span>
                  {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-tighter">NPR {grandTotal.toFixed(2)} TOTAL TAXABLE INVOICE</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
             <button 
              onClick={() => setPaymentMode('Cash')}
              className={cn(
                "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-1", 
                paymentMode === 'Cash' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
              )}>
                <Wallet size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">CASH (F8)</span>
             </button>
             <button 
              onClick={() => setPaymentMode('Card')}
              className={cn(
                "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-1", 
                paymentMode === 'Card' ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
              )}>
                <CreditCard size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">CARD (F9)</span>
             </button>
          </div>
          
          <button 
            onClick={generatePaymentQR}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#612A87] text-white rounded-xl hover:bg-[#522372] transition-all mb-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-100"
          >
            <span className="bg-white px-1.5 py-0.5 rounded text-[#612A87] text-[9px] font-black">eSewa</span>
            SCAN DYNAMIC QR (F10)
          </button>
          
          <button 
            disabled={items.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:translate-y-[-2px] transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Checkout (F12)'}
          </button>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {qrModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-green-500" />
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Scan to Pay</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">Please scan with eSewa app</p>
                
                <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                  <img src={qrCodeUrl} alt="eSewa QR" className="w-full aspect-square" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-400">Merchant</span>
                    <span className="text-gray-900">Namaste Mart</span>
                  </div>
                  <div className="flex justify-between text-lg font-black">
                    <span className="text-gray-400">Total</span>
                    <span className="text-green-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
                >
                  Verify Payment
                </button>
                <button 
                  onClick={() => setQrModal(false)}
                  className="w-full mt-2 py-3 text-gray-400 font-medium hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

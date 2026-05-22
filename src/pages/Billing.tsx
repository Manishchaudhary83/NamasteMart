import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Trash2, CreditCard, Wallet, User as UserIcon, Barcode, Phone, ReceiptText, ShoppingCart, Cpu, Keyboard } from 'lucide-react';
import axios from 'axios';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import PrintableReceipt from '../components/PrintableReceipt';

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
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ fullName: '', phoneNumber: '', membershipTier: 'Regular' });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [manualDiscountInput, setManualDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'NPR' | '%'>('NPR');
  const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Hardware Barcode Scanner State & Timing Config ---
  const [useHardwareScanner, setUseHardwareScanner] = useState(true);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'listening' | 'scanning' | 'success' | 'error'>('listening');
  const [scannerMessage, setScannerMessage] = useState('');
  const [showScannerSim, setShowScannerSim] = useState(false);
  const [simulatedBarcode, setSimulatedBarcode] = useState('');

  const scannerBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Directly check/add barcode items
  const addBarcodeItem = async (barcodeVal: string) => {
    const trimmed = barcodeVal.trim();
    if (!trimmed) return;
    
    setScannerStatus('scanning');
    setScannerMessage(`Processing barcode ${trimmed}...`);
    try {
      const { data } = await axios.get(`/api/products/barcode/${trimmed}`);
      addItem(data);
      
      // Clear input if the scanner typed into focused search bar
      setSearch((prev) => {
        if (prev.trim() === trimmed) {
          setProducts([]);
          return '';
        }
        return prev;
      });
      
      setScannerStatus('success');
      setScannerMessage(`Successfully added "${data.productName}"`);
      setTimeout(() => {
        setScannerStatus('listening');
        setScannerMessage('');
      }, 2000);
    } catch (err: any) {
      // Fallback query by code name/exact barcode match if DB connection state or API doesn't support direct EAN matching
      try {
        const { data: searchResults } = await axios.get(`/api/products?search=${trimmed}`);
        if (searchResults.length > 0) {
          const exactMatch = searchResults.find((p: any) => 
            p.productName.toLowerCase() === trimmed.toLowerCase() ||
            p.barcode === trimmed
          );
          
          if (exactMatch) {
            addItem(exactMatch);
            setSearch((prev) => {
              if (prev.trim() === trimmed) {
                setProducts([]);
                return '';
              }
              return prev;
            });
            setScannerStatus('success');
            setScannerMessage(`Successfully added "${exactMatch.productName}"`);
            setTimeout(() => {
              setScannerStatus('listening');
              setScannerMessage('');
            }, 2000);
            return;
          } else if (searchResults.length === 1) {
            addItem(searchResults[0]);
            setSearch((prev) => {
              if (prev.trim() === trimmed) {
                setProducts([]);
                return '';
              }
              return prev;
            });
            setScannerStatus('success');
            setScannerMessage(`Successfully added "${searchResults[0].productName}"`);
            setTimeout(() => {
              setScannerStatus('listening');
              setScannerMessage('');
            }, 2000);
            return;
          }
        }
      } catch (innerErr) {
        // ignore
      }
      
      setScannerStatus('error');
      setScannerMessage(`Product not found: "${trimmed}"`);
      setTimeout(() => {
        setScannerStatus('listening');
        setScannerMessage('');
      }, 3000);
    }
  };

  // Simulate hardware typing at physical speed (<10ms per character with exact KeyboardEvents)
  const simulateHardwareScanner = (barcodeStr: string) => {
    if (!barcodeStr.trim()) return;
    setScannerStatus('scanning');
    setScannerMessage('Simulating physical scanner keys at 10ms intervals...');
    
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < barcodeStr.length) {
        const char = barcodeStr[index];
        
        // Dispatch high speed keystroke event
        const event = new KeyboardEvent('keydown', {
          key: char,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(event);
        index++;
      } else {
        clearInterval(interval);
        
        // Dispatch physical Enter suffix triggers submission
        setTimeout(() => {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(enterEvent);
        }, 15);
      }
    }, 10);
  };

  // Continuous listener that collects fast keys
  useEffect(() => {
    if (!useHardwareScanner) {
      setScannerStatus('idle');
      return;
    }

    setScannerStatus('listening');

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting operational keys like tab, arrows, escape
      if (
        e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' ||
        e.key === 'Tab' || e.key === 'Escape' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight'
      ) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Reset buffer if delay suggests human speed (>75ms)
      if (timeDiff > 75) {
        scannerBufferRef.current = '';
      }

      if (e.key.length === 1) {
        scannerBufferRef.current += e.key;
        // Prevent typing from polluting and contaminating other focused form fields
        if (scannerBufferRef.current.length > 1) {
          e.preventDefault();
        }
      } else if (e.key === 'Enter') {
        const finalBarcode = scannerBufferRef.current.trim();
        if (finalBarcode.length >= 4) {
          e.preventDefault();
          e.stopPropagation();
          addBarcodeItem(finalBarcode);
          scannerBufferRef.current = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [useHardwareScanner]);

  const loyaltyDiscount = customer 
    ? subtotal * (customer.membershipTier === 'Gold' ? 0.1 : customer.membershipTier === 'Silver' ? 0.05 : 0)
    : 0;
  
  const parsedDiscountVal = parseFloat(manualDiscountInput) || 0;
  const calculatedManualDiscount = discountType === '%' 
    ? (subtotal * parsedDiscountVal / 100) 
    : parsedDiscountVal;

  const calculatedGrandTotal = Math.max(0, subtotal + totalVAT - loyaltyDiscount - calculatedManualDiscount);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('/api/config');
        setConfig(data);
      } catch (e) {
        console.error('Failed to fetch config', e);
      }
    };
    fetchConfig();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get('/api/billing/transactions');
      setTransactions(data);
      setHistoryModal(true);
    } catch (e) {
      alert('Failed to fetch transactions');
    }
  };

  const handleKeyDownRef = useRef<(e: KeyboardEvent) => void>(() => {});

  // Update effect ref to store latest render state to avoid state closure bugs (eSewa, checkout, customer, items)
  useEffect(() => {
    handleKeyDownRef.current = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowReceipt(false);
        setHistoryModal(false);
        setCustomerModal(false);
        setQrModal(false);
      }
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyDownRef.current(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  useEffect(() => {
    if (!customerPhone.trim()) {
      setCustomer(null);
    }
  }, [customerPhone]);

  const handlePhoneLookup = async () => {
    if (!customerPhone.trim()) return;
    try {
      const { data } = await axios.get(`/api/customers/${customerPhone}`);
      setCustomer(data);
    } catch (e: any) {
      setCustomer(null);
      if (e.response?.status === 404) {
        alert('Customer not found with this phone number.');
      } else {
        alert('Error looking up customer.');
      }
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setIsProcessing(true);
    try {
      const { data } = await axios.get(`/api/products/barcode/${search.trim()}`);
      addItem(data);
      setSearch('');
      setProducts([]);
      setScannerStatus('success');
      setScannerMessage(`Successfully added "${data.productName}"`);
      setTimeout(() => {
        setScannerStatus('listening');
        setScannerMessage('');
      }, 2000);
    } catch (e: any) {
      // If not found by barcode, try searching by name and take the first exact match
      try {
        const { data: searchResults } = await axios.get(`/api/products?search=${search.trim()}`);
        if (searchResults.length > 0) {
          const exactMatch = searchResults.find((p: any) => 
            p.productName.toLowerCase() === search.trim().toLowerCase() ||
            p.barcode === search.trim()
          );
          
          if (exactMatch) {
            addItem(exactMatch);
            setSearch('');
            setProducts([]);
            setScannerStatus('success');
            setScannerMessage(`Successfully added "${exactMatch.productName}"`);
            setTimeout(() => {
              setScannerStatus('listening');
              setScannerMessage('');
            }, 2000);
          } else if (searchResults.length === 1) {
            addItem(searchResults[0]);
            setSearch('');
            setProducts([]);
            setScannerStatus('success');
            setScannerMessage(`Successfully added "${searchResults[0].productName}"`);
            setTimeout(() => {
              setScannerStatus('listening');
              setScannerMessage('');
            }, 2000);
          } else {
            // Multiple results but no exact match - keep search open for selection
            alert(`Found ${searchResults.length} matches. Please select from the dropdown.`);
            setScannerStatus('listening');
          }
        } else {
          alert('Item not found. Please try again or search by name.');
          setScannerStatus('error');
          setScannerMessage(`Not found: "${search}"`);
          setTimeout(() => {
            setScannerStatus('listening');
            setScannerMessage('');
          }, 3000);
        }
      } catch (err) {
        alert('Search failed. Check your connection.');
        setScannerStatus('idle');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePaymentQR = async () => {
      const { data } = await axios.get('/api/config');
      const invoiceId = `INV-${Date.now()}`;
      // Simulating eSewa dynamic QR payload
      const qrData = `esewa://pay?merchant=${data.esewaMerchantCode}&amount=${calculatedGrandTotal}&invoice=${invoiceId}`;
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
      setQrModal(true);
  };

  const executeCheckout = async () => {
    setShowConfirmCheckout(false);
    setIsProcessing(true);
    try {
      const { data } = await axios.post('/api/billing/checkout', {
        items,
        customerPhone,
        customerName: customer?.fullName || 'Walk-in',
        paymentMode,
        paymentReferenceId: 'REF-' + Date.now(),
        manualDiscount: calculatedManualDiscount,
        loyaltyDiscount: loyaltyDiscount
      });
      
      setLastTransaction(data.transaction);
      setShowReceipt(true);
      
      clearCart();
      setCustomerPhone('');
      setCustomer(null);
      setManualDiscountInput('');
      setQrModal(false);
    } catch (error: any) {
      alert('Checkout Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowConfirmCheckout(true);
  };

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/customers', newCustomerData);
      setCustomer(data);
      setCustomerPhone(data.phoneNumber);
      setCustomerModal(false);
      setNewCustomerData({ fullName: '', phoneNumber: '', membershipTier: 'Regular' });
      alert('Customer Registered Successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0.5 h-[calc(100vh-6rem)] bg-slate-200 -m-8">
      {showReceipt && (
        <PrintableReceipt 
          transaction={lastTransaction} 
          config={config} 
          onClose={() => setShowReceipt(false)} 
        />
      )}

      {historyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-end">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                <ReceiptText className="text-emerald-600" />
                History
              </h2>
              <button onClick={() => setHistoryModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                CLOSE
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transactions.map(tx => (
                <div key={tx._id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-900">{tx.invoiceId}</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <p className="font-black text-emerald-600 font-mono">{formatCurrency(tx.grandTotal)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-black uppercase text-slate-500">{tx.paymentMode}</span>
                    <button 
                      onClick={() => {
                        setLastTransaction(tx);
                        setShowReceipt(true);
                        setHistoryModal(false);
                      }}
                      className="text-[10px] font-black text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      REPRINT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Left Panel: Cart & Search */}
      <div className="lg:col-span-8 flex flex-col bg-white overflow-hidden">
        {/* Continuous Hardware Barcode Scanner Status Banner */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className={cn(
              "h-2 w-2 rounded-full",
              scannerStatus === 'listening' ? "bg-emerald-500 animate-pulse" :
              scannerStatus === 'scanning' ? "bg-blue-500 animate-ping" :
              scannerStatus === 'success' ? "bg-teal-400" :
              "bg-rose-500"
            )}></span>
            <span className="font-extrabold uppercase tracking-widest text-[9px] text-slate-100 flex items-center gap-1.5 font-sans">
              <Cpu size={11} className="text-emerald-400" /> Continuous Scanner Support:
            </span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide border font-mono",
              scannerStatus === 'listening' ? "bg-emerald-950/80 text-emerald-400 border-emerald-900/40" :
              scannerStatus === 'scanning' ? "bg-blue-950/80 text-blue-400 border-blue-900/30 font-bold" :
              scannerStatus === 'success' ? "bg-teal-950/90 text-teal-400 border-teal-900/30" :
              "bg-rose-950/90 text-rose-400 border-rose-900/30"
            )}>
              {scannerStatus === 'listening' && '🔌 Active & Intercepting'}
              {scannerStatus === 'scanning' && '⚡ Decoding...'}
              {scannerStatus === 'success' && '✅ Added to Cart'}
              {scannerStatus === 'error' && '❌ Unrecognized Barcode'}
            </span>
            {scannerMessage && (
              <span className="text-[10px] text-slate-400 font-mono italic max-w-[200px] sm:max-w-xs truncate">{scannerMessage}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={useHardwareScanner}
                onChange={(e) => setUseHardwareScanner(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-[9px] uppercase font-bold tracking-tight text-slate-400">Enable Hardware Listener</span>
            </label>
            <button
              type="button"
              onClick={() => setShowScannerSim(!showScannerSim)}
              className={cn(
                "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 active:scale-95",
                showScannerSim 
                  ? "bg-rose-600 border-rose-500 text-white" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              )}
            >
              <Keyboard size={11} />
              {showScannerSim ? 'Hide Simulator' : 'Test Scanner Simulator'}
            </button>
          </div>
        </div>

        {/* Barcode Scanner Simulator Panel */}
        <AnimatePresence>
          {showScannerSim && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-950 border-b border-slate-800 overflow-hidden text-xs text-slate-400 shadow-inner shrink-0 z-20"
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="font-extrabold uppercase tracking-wider text-slate-350 flex items-center gap-1.5 md:text-xs text-[10px]">
                    <Keyboard size={12} className="text-emerald-500" />
                    Interactive Keyboard Barcode Gun Simulator
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Simulates raw USB virtual scans</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Select a demo product to scan */}
                  <div className="space-y-2">
                    <p className="font-black uppercase text-[10px] text-slate-450 tracking-wider">Option A: Quick Scan Preset Products</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {[
                        { name: '🌾 Atta 5kg', code: '1000000000001' },
                        { name: '🛢️ Mustard Oil 1L', code: '1000000000004' },
                        { name: '🧂 Tata Salt 1kg', code: '1000000000005' },
                        { name: '🌶️ Hot Noodles', code: '1000000000072' },
                        { name: '🥔 Lay\'s Chips', code: '1000000000074' },
                        { name: '🧼 Dove Soap', code: '1000000000097' },
                      ].map((item) => (
                        <div key={item.code} className="p-1 px-2 rounded bg-slate-900/50 border border-slate-900 flex items-center justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 text-[10px] truncate">{item.name}</p>
                            <span className="font-mono text-[9px] text-slate-550">{item.code}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                simulateHardwareScanner(item.code);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[8px] rounded transition-all tracking-wider"
                              title="Simulate hardware rapid-typing script events of this barcode"
                            >
                              ⚡ Scan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                addBarcodeItem(item.code);
                              }}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-[8px] rounded transition-all tracking-wider"
                              title="Instant manual mock trigger"
                            >
                              Instant
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Option 2: Custom Barcode input */}
                  <div className="space-y-2">
                    <p className="font-black uppercase text-[10px] text-slate-450 tracking-wider">Option B: Scanned Raw Value Input</p>
                    <div className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type code (e.g. 1000000000006)..."
                          className="flex-grow px-3 py-1.5 bg-slate-950 border border-slate-800 rounded outline-none focus:border-emerald-500 text-xs font-mono font-bold text-white text-center"
                          value={simulatedBarcode}
                          onChange={(e) => setSimulatedBarcode(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                          type="button"
                          disabled={!simulatedBarcode.trim()}
                          onClick={() => {
                            simulateHardwareScanner(simulatedBarcode);
                            setSimulatedBarcode('');
                          }}
                          className="px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-[9px] uppercase tracking-widest rounded transition-all shrink-0"
                        >
                          Simulate Gun
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal">
                        🔥 <strong>Timing Check:</strong> Our gun simulator types individual letters at <strong>10ms</strong> intervals. This triggers the background rapid key interceptor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3 shadow-sm z-10">
          <form id="barcode-form" onSubmit={handleBarcodeSubmit} className="relative flex-grow">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Scan Barcode or Search Product..."
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
                          <input
                            id={`qty-${item.productId}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              updateQuantity(item.productId, val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                searchInputRef.current?.focus();
                                searchInputRef.current?.select();
                              }
                            }}
                            className="font-black text-slate-900 w-12 text-center text-sm bg-slate-50 border border-slate-200 rounded py-0.5 focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
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
        
        {/* Interactive Command Panel */}
        <div className="h-11 bg-slate-100 border-t border-slate-200 flex items-center px-4 justify-between text-[11px] font-bold text-slate-600 uppercase tracking-tight overflow-x-auto shrink-0 z-20">
          <div className="flex gap-2 items-center py-1">
             <button 
               type="button"
               onClick={() => {
                 searchInputRef.current?.focus();
                 searchInputRef.current?.select();
               }}
               className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 shadow-sm transition-all active:scale-95 text-slate-700 cursor-pointer"
               title="Focus Search Input"
             >
               Search
             </button>

             <button 
               type="button"
               onClick={() => {
                 if (items.length > 0) {
                   const lastItem = items[items.length - 1];
                   const inputEl = document.getElementById(`qty-${lastItem.productId}`) as HTMLInputElement;
                   if (inputEl) {
                     inputEl.focus();
                     inputEl.select();
                   }
                 } else {
                   alert('Cart is empty. Add an item first.');
                 }
               }}
               className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 shadow-sm transition-all active:scale-95 text-slate-700 cursor-pointer"
               title="Edit Qty of Last Item"
             >
               Edit Qty
             </button>

             <button 
               type="button"
               onClick={fetchTransactions} 
               className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 shadow-sm transition-all active:scale-95 text-slate-700 cursor-pointer"
               title="Show Transactions History"
             >
               History
             </button>

             <button 
               type="button"
               onClick={() => setPaymentMode('Cash')}
               className={`px-2 py-1 rounded border flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer ${paymentMode === 'Cash' ? 'bg-emerald-50 border-emerald-400 text-emerald-850 font-black' : 'bg-white hover:bg-slate-200 border-slate-200 text-slate-700'}`}
               title="Select Cash Mode"
             >
               Cash
             </button>

             <button 
               type="button"
               onClick={() => setPaymentMode('Card')}
               className={`px-2 py-1 rounded border flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer ${paymentMode === 'Card' ? 'bg-blue-50 border-blue-400 text-blue-850 font-black' : 'bg-white hover:bg-slate-200 border-slate-200 text-slate-700'}`}
               title="Select Card Mode"
             >
               Card
             </button>

             <button 
               type="button"
               onClick={() => {
                 if (items.length > 0) {
                   generatePaymentQR();
                 } else {
                   alert('Cart is empty.');
                 }
               }}
               className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 shadow-sm transition-all active:scale-95 text-slate-700 cursor-pointer"
               title="Show eSewa Dynamic QR"
             >
               eSewa
             </button>

             <button 
               type="button"
               disabled={items.length === 0 || isProcessing}
               onClick={() => {
                 if (items.length > 0 && !isProcessing) {
                   handleCheckout();
                 }
               }}
               className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 hover:scale-105 disabled:hover:scale-100 text-white font-black flex items-center gap-1 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
               title="Checkout Invoice"
             >
               Checkout
             </button>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] tracking-wider text-slate-400 shrink-0 select-none">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             NAMASTE MART SYSTEM
          </div>
        </div>
      </div>

      {/* Right Panel: Summary */}
      <div className="lg:col-span-4 flex flex-col bg-white border-l border-slate-200">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Lookup</h3>
            <button 
              onClick={() => {
                setNewCustomerData({ ...newCustomerData, phoneNumber: customerPhone });
                setCustomerModal(true);
              }}
              className="text-[10px] font-black text-emerald-600 hover:underline"
            >
              + REGISTER
            </button>
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
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Points: <span className="text-emerald-600">{(customer.loyaltyPoints || 0).toLocaleString()}</span></p>
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
          {/* Interactive Discount Input Panel */}
          <div className="mb-4 pb-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-450">Manual Discount</label>
              <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDiscountType('NPR')}
                  className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter transition-all cursor-pointer",
                    discountType === 'NPR' ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  NPR (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('%')}
                  className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter transition-all cursor-pointer",
                    discountType === '%' ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Percent %
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder={discountType === 'NPR' ? "Amount in Rs." : "Percentage of discount"}
                className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-200 rounded font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 transition-all font-mono"
                value={manualDiscountInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) {
                     setManualDiscountInput(val);
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                {discountType === 'NPR' ? 'Rs.' : '%'}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span>Sub Total</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span>VAT</span>
              <span className="font-mono">{formatCurrency(totalVAT)}</span>
            </div>
            <div className="flex justify-between text-slate-700 text-xs font-bold uppercase tracking-widest border-t border-slate-100 pt-1">
              <span>Amount with VAT</span>
              <span className="font-mono font-black">{formatCurrency(subtotal + totalVAT)}</span>
            </div>
            {customer && loyaltyDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 text-xs font-black uppercase tracking-widest min-w-0">
                <span className="truncate">Loyalty Disc.</span>
                <span className="font-mono">-{formatCurrency(loyaltyDiscount)}</span>
              </div>
            )}
            {calculatedManualDiscount > 0 && (
              <div className="flex justify-between text-rose-600 text-xs font-black uppercase tracking-widest min-w-0">
                <span className="truncate">Manual Disc.</span>
                <span className="font-mono">-{formatCurrency(calculatedManualDiscount)}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-4"></div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grand Total</span>
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
                  <span className="text-xl mr-1">Rs.</span>
                  {calculatedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-tighter">NPR {calculatedGrandTotal.toFixed(2)} TOTAL TAXABLE INVOICE</p>
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
                <span className="text-[9px] font-black uppercase tracking-widest">CASH</span>
             </button>
             <button 
              onClick={() => setPaymentMode('Card')}
              className={cn(
                "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-1", 
                paymentMode === 'Card' ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
              )}>
                <CreditCard size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">CARD</span>
             </button>
          </div>
          
          <button 
            onClick={generatePaymentQR}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#612A87] text-white rounded-xl hover:bg-[#522372] transition-all mb-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-100"
          >
            <span className="bg-white px-1.5 py-0.5 rounded text-[#612A87] text-[9px] font-black">eSewa</span>
            SCAN DYNAMIC QR
          </button>
          
          <button 
            disabled={items.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:translate-y-[-2px] transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Checkout'}
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
                    <span className="text-green-600">{formatCurrency(calculatedGrandTotal)}</span>
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

      {/* Checkout Confirmation Modal */}
      <AnimatePresence>
        {showConfirmCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ReceiptText size={16} className="text-emerald-600" />
                  Confirm Checkout
                </h3>
                <button onClick={() => setShowConfirmCheckout(false)} className="text-slate-400 hover:text-slate-900 text-xs font-bold font-sans">
                  CANCEL
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide leading-tight">
                  Verify invoice details below before generating receipt.
                </p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 tabular-nums">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer:</span>
                    <span className="text-slate-800 font-extrabold uppercase">{customer?.fullName || 'Walk-In'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Mode:</span>
                    <span className="text-slate-800 font-extrabold uppercase">{paymentMode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Items:</span>
                    <span className="text-slate-800 font-extrabold">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-900 tracking-wide text-xs">GRAND TOTAL:</span>
                    <span className="font-black text-emerald-600 text-base font-mono">{formatCurrency(calculatedGrandTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmCheckout(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 cursor-pointer"
                  >
                    GO BACK
                  </button>
                  <button
                    type="button"
                    onClick={executeCheckout}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 hover:translate-y-[-1px] transition-all rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md cursor-pointer active:scale-95"
                  >
                    CONFIRM
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Registration Modal */}
      <AnimatePresence>
        {customerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon size={16} className="text-emerald-600" />
                  New Customer Enrollment
                </h3>
                <button onClick={() => setCustomerModal(false)} className="text-slate-400 hover:text-slate-900">
                  CLOSE
                </button>
              </div>
              <form onSubmit={handleRegisterCustomer} className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                      placeholder="ENTER NAME..."
                      value={newCustomerData.fullName}
                      onChange={e => setNewCustomerData({...newCustomerData, fullName: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Contact (10 digits)</label>
                    <input 
                      required
                      maxLength={10}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-sm tracking-widest"
                      placeholder="98XXXXXXXX"
                      value={newCustomerData.phoneNumber}
                      onChange={e => setNewCustomerData({...newCustomerData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                    />
                 </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Membership Tier</label>
                     <select 
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                       value={newCustomerData.membershipTier}
                       onChange={e => setNewCustomerData({...newCustomerData, membershipTier: e.target.value})}
                     >
                       <option value="Regular">Regular Member (Basic)</option>
                       <option value="Silver">Silver Member</option>
                       <option value="Gold">Gold Member</option>
                     </select>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-700 font-bold uppercase tracking-tight space-y-1">
                     {newCustomerData.membershipTier === 'Regular' && (
                       <p>🎁 Regular Welcome Bonus: <span className="font-mono underline">50 points</span> awarded immediately! (1.0x loyalty multiplier on checkout)</p>
                     )}
                     {newCustomerData.membershipTier === 'Silver' && (
                       <p>⭐ Silver Welcome Bonus: <span className="font-mono underline">250 points</span> awarded immediately! (1.5x loyalty multiplier and 5% store discount)</p>
                     )}
                     {newCustomerData.membershipTier === 'Gold' && (
                       <p>👑 Gold Welcome Bonus: <span className="font-mono underline">500 points</span> awarded immediately! (2.0x loyalty multiplier and 10% store discount)</p>
                     )}
                  </div>
                 <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                >
                  Complete Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

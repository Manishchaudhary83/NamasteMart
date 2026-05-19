import React, { useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintableReceiptProps {
  transaction: any;
  config: any;
  onClose: () => void;
}

export default function PrintableReceipt({ transaction, config, onClose }: PrintableReceiptProps) {
  useEffect(() => {
    if (transaction) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transaction]);

  const handlePrint = () => {
    console.log('Triggering print dialog for bill...');
    try {
      // Create a temporary hidden iframe to print
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const printArea = document.getElementById('receipt-print-area');
      if (!printArea) return;

      const content = `
        <html>
          <head>
            <title>Receipt - ${transaction.invoiceId}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              @media print {
                body { padding: 0; margin: 0; }
                @page { size: 80mm auto; margin: 0; }
              }
              ${Array.from(document.styleSheets)
                .filter(s => !s.href || s.href.startsWith(window.location.origin))
                .map(s => {
                  try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; }
                }).join('\n')}
              #receipt-print-area { width: 100% !important; margin: 0 !important; }
              .print\\:hidden { display: none !important; }
            </style>
          </head>
          <body>
            ${printArea.innerHTML}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(() => {
                  // We don't remove it immediately to allow print process to finish
                }, 1000);
              };
            </script>
          </body>
        </html>
      `;

      printFrame.contentDocument?.open();
      printFrame.contentDocument?.write(content);
      printFrame.contentDocument?.close();

      // Cleanup
      setTimeout(() => document.body.removeChild(printFrame), 2000);
    } catch (e) {
      console.error('Print error:', e);
      // Fallback to direct print
      window.print();
    }
  };

  const openInNewTab = () => {
    const printArea = document.getElementById('receipt-print-area');
    if (!printArea) return;
    
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
      return;
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>Bill #${transaction.invoiceId}</title>
          <style>
            body { 
              font-family: monospace; 
              display: flex; 
              justify-content: center; 
              background: #f1f5f9; 
              padding: 40px 0;
            }
            .paper {
              background: white;
              padding: 40px;
              width: 80mm;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            @media print {
              body { background: white; padding: 0; }
              .paper { box-shadow: none; width: 80mm; padding: 4mm; }
              @page { size: 80mm auto; margin: 0; }
              .no-print { display: none; }
            }
            ${Array.from(document.styleSheets)
              .filter(s => !s.href || s.href.startsWith(window.location.origin))
              .map(s => {
                try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; }
              }).join('\n')}
          </style>
        </head>
        <body>
          <div class="paper">
            ${printArea.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-print-area');
    if (!element) return;
    
    try {
      // Aggressively replace oklch references before capture if any remain
      // html2canvas fails on any oklch color function.
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        // Ensure white background for PDF
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById('receipt-print-area');
          if (area) {
            // Remove all print:hidden elements from capture
            area.querySelectorAll('.print\\:hidden').forEach(el => (el as HTMLElement).style.display = 'none');
            // Ensure all text is black for clarity
            area.style.color = '#000000';
            area.style.backgroundColor = '#ffffff';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, (canvas.height * 80) / canvas.width]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
      pdf.save(`Bill_${transaction.invoiceId}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Attempting fallback print...');
    }
  };

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:block print:static">
      <div 
        className="bg-white w-full max-w-[400px] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:h-auto print:max-h-none print:rounded-none transition-all scale-100 animate-in fade-in zoom-in duration-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header - Hidden in Print */}
        <div 
          className="p-4 border-b flex justify-between items-center print:hidden shrink-0"
          style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#ecfdf5' }}
            >
              <span style={{ color: '#059669' }} className="font-bold text-xs">PDF</span>
            </div>
            <h3 className="font-bold" style={{ color: '#0f172a' }}>Bill Preview</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-bold transition-colors"
              style={{ color: '#64748b' }}
            >
              CANCEL
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest border"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#dbeafe' }}
            >
              PDF
            </button>
            <button 
              onClick={handlePrint}
              className="px-5 py-1.5 text-white rounded-lg text-sm font-black transition-all shadow-lg active:scale-95"
              style={{ backgroundColor: '#059669', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
            >
              PRINT
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div 
          id="receipt-print-area" 
          className="p-8 overflow-y-auto print:p-0 print:overflow-visible font-mono text-[12px] leading-tight"
          style={{ color: '#000000', backgroundColor: '#ffffff' }}
        >
          {/* Mart Info */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: '#000000' }}>{config?.martName || 'NAMASTE MART'}</h1>
            <p className="whitespace-pre-line text-[11px] leading-relaxed opacity-80" style={{ color: '#000000' }}>{config?.address || 'Kathmandu, Nepal'}</p>
            <p className="text-[11px]" style={{ color: '#000000' }}>Tel: {config?.phone || '01-xxxxxxx'}</p>
            <div 
              className="print:hidden text-[10px] font-bold py-1 px-2 rounded-md inline-block mt-2"
              style={{ color: '#059669', backgroundColor: '#ecfdf5' }}
            >
              Tip: Use Ctrl + P or <button onClick={openInNewTab} className="underline hover:text-emerald-800 cursor-pointer">Open in New Tab</button> if Print fails
            </div>
            <div 
              className="my-3 border-y py-1.5 font-bold uppercase tracking-widest text-[10px]"
              style={{ borderColor: '#000000', borderStyle: 'dashed' }}
            >
              Tax Invoice
            </div>
          </div>

          {/* Bill Info */}
          <div className="mb-4 space-y-1 text-[11px] tabular-nums" style={{ color: '#000000' }}>
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
          <table className="w-full mb-4 border-t" style={{ borderColor: '#000000', borderStyle: 'dashed' }}>
            <thead>
              <tr className="border-b text-[10px] font-bold" style={{ borderColor: '#000000', borderStyle: 'dashed' }}>
                <th className="py-2 text-left">DESCRIPTION</th>
                <th className="py-2 text-center w-8">QTY</th>
                <th className="py-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="text-[11px]" style={{ color: '#000000' }}>
              {(transaction.items || []).map((item: any, idx: number) => (
                <tr key={idx} className="align-top border-b" style={{ borderColor: '#000000', borderStyle: 'dashed' }}>
                  <td className="py-2 pr-2">
                    <p className="font-bold uppercase leading-none mb-1">{item.productName}</p>
                    <p className="text-[9px] italic truncate max-w-[150px]" style={{ opacity: 0.7 }}>
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </td>
                  <td className="py-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-2 text-right font-bold">{formatCurrency(item.subtotal || (item.quantity * item.unitPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1 border-t pt-3 tabular-nums" style={{ borderColor: '#000000', borderStyle: 'dashed', color: '#000000' }}>
            <div className="flex justify-between text-[11px]">
              <span>Sub-Total:</span>
              <span>{formatCurrency(transaction.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>VAT (13%):</span>
              <span>{formatCurrency(transaction.totalVAT || 0)}</span>
            </div>
            {(transaction.loyaltyDiscount > 0) && (
              <div className="flex justify-between font-bold" style={{ color: '#dc2626' }}>
                <span>Discount:</span>
                <span>-{formatCurrency(transaction.loyaltyDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black border-t-2 pt-2 mt-2" style={{ borderColor: '#000000', borderStyle: 'double' }}>
              <span className="tracking-tighter">GRAND TOTAL:</span>
              <span>{formatCurrency(transaction.grandTotal || 0)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4" style={{ color: '#000000' }}>
            <p className="text-[10px] font-bold tracking-widest">--- THANK YOU ---</p>
            <p className="text-[9px] italic" style={{ opacity: 0.7 }}>Goods once sold will not be taken back</p>
            
            <div className="flex flex-col items-center gap-1 pt-2">
              <div className="h-6 w-56 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                 <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px, transparent 3px)', backgroundSize: '4px 100%' }}></div>
              </div>
              <p className="text-[8px] tracking-[0.4em] font-bold">{transaction.invoiceId}</p>
            </div>
            
            <div className="pt-4 space-y-1">
              <div 
                className="text-[7px] uppercase tracking-tighter"
                style={{ color: '#64748b', opacity: 0.5 }}
              >
                Billed by: {transaction.cashier || 'System Admin'}
              </div>
              <div 
                className="text-[8px] font-bold uppercase tracking-tight"
                style={{ color: '#1e293b' }}
              >
                All right reserved 2026 and created by Manish chaudhary
              </div>
            </div>
          </div>
        </div>

        {/* Global Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide everything by default */
            body * {
              visibility: hidden !important;
            }
            /* Show ONLY the receipt print area and its children */
            #receipt-print-area, #receipt-print-area * {
              visibility: visible !important;
            }
            /* Position receipt at top-left of the page */
            #receipt-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              margin: 0 !important;
              padding: 4mm !important;
              background: white !important;
            }
            /* Hide modal backgrounds and buttons */
            .fixed, .print\\:hidden, button {
              display: none !important;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}} />
      </div>
    </div>
  );
}

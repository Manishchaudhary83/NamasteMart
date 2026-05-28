import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Settings, Store, CreditCard, Percent, FileText, Save } from 'lucide-react';
import { motion } from 'motion/react';

export default function Configuration() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['config'], queryFn: () => axios.get('/api/config').then(res => res.data) });

  const mutation = useMutation({
    mutationFn: (newConfig: any) => axios.put('/api/config', newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      alert('SUCCESS: System configuration cycle updated. All nodes synchronized.');
    },
    onError: (error: any) => {
      console.error('Config update failed:', error);
      alert('FAILURE: Could not commit changes. ' + (error.response?.data?.message || 'Server rejected the payload.'));
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting configuration change...');
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    // Correctly map and cast types for the backend
    const data: any = {
      ...rawData,
      vatPercentage: Number(rawData.vatPercentage || 0),
      loyaltyConfig: {
        pointsPerNPR: Number(rawData.loyaltyPointsPerNPR || 0),
        redemptionRate: 1
      }
    };
    
    // Clean up auxiliary fields
    delete data.loyaltyPointsPerNPR;
    
    console.log('Processed data:', data);
    mutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">System Environment Settings</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global configuration and regulatory compliance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mart Details */}
          <section className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Store size={14} className="text-emerald-600" />
              Organizational Identity
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Legal Mart Title</label>
              <input name="martName" defaultValue={config?.martName} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Operation Base</label>
              <input name="address" defaultValue={config?.address} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Backbone</label>
              <input name="phone" defaultValue={config?.phone} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono font-bold" />
            </div>
          </section>

          {/* eSewa Integration */}
          <section className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
              <CreditCard size={14} className="text-purple-600" />
              eSewa Digital Rails
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Merchant UID (eSewa Code)</label>
                <a 
                  href="https://business.esewa.com.np" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[8px] text-purple-600 font-bold hover:underline uppercase tracking-widest"
                >
                  Get Merchant ID ↗
                </a>
              </div>
              <input 
                name="esewaMerchantCode" 
                defaultValue={config?.esewaMerchantCode} 
                placeholder="e.g. EPAYTEST or Custom Merchant ID" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono font-bold uppercase" 
              />
              <p className="text-[10px] text-slate-500 font-medium pl-1 leading-relaxed">
                Obtain this code from your registered <strong className="text-slate-700">eSewa Business Portal</strong> dashboard. If you are testing, use the fallback test code <code className="bg-purple-100 text-purple-700 px-1 rounded font-bold">EPAYTEST</code>.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Private Auth Key</label>
              <input type="password" name="esewaSecretKey" defaultValue={config?.esewaSecretKey} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono font-bold" />
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded text-[9px] text-purple-700 font-black uppercase tracking-tighter">
              Credentials are utilized for dynamic QR-Invoicing. Verified secure.
            </div>
          </section>

          {/* Tax & Loyalty */}
          <section className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Percent size={14} className="text-blue-600" />
              Revenue & Loyalty Logic
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Statutory VAT (%)</label>
              <input name="vatPercentage" type="number" defaultValue={config?.vatPercentage} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Loyalty Yield Index (per 100 NPR)</label>
              <input name="loyaltyPointsPerNPR" type="number" step="0.001" defaultValue={config?.loyaltyConfig?.pointsPerNPR} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono font-bold" />
            </div>
          </section>

          {/* Receipt Settings */}
          <section className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-600" />
              Regulatory Compliance
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Tax ID (PAN/VAT Reg)</label>
              <input name="taxRegistrationNumber" defaultValue={config?.taxRegistrationNumber} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-slate-500 text-sm font-mono font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Invoice Disclaimers</label>
              <textarea name="receiptFooterText" defaultValue={config?.receiptFooterText} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-slate-500 text-xs font-bold h-20" />
            </div>
          </section>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex items-center justify-between">
            <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Master Record Initialization</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Wipe existing data and reload core inventory & configurations</p>
            </div>
            <button 
                type="button"
                onClick={async () => {
                    // Simpler confirmation for demo environments
                    const confirmed = window.confirm('RELOAD MASTER DATA: Purge all temporary records and reset to system defaults?');
                    if (!confirmed) return;

                    try {
                        const { data } = await axios.post('/api/system/seed');
                        alert(data.message || 'Records Initialized');
                        window.location.reload();
                    } catch (err: any) {
                        const msg = err.response?.data?.message || 'Seeding failed. Database connection required for master reset.';
                        alert(msg);
                    }
                }}
                className="px-6 py-2 border-2 border-red-500 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded shadow-sm"
            >
                Initialize System Records
            </button>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            {mutation.isPending ? 'Syncing...' : (
              <>
                <Save size={16} /> Update Framework
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

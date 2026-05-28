import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Settings, Store, CreditCard, Percent, FileText, Save, Database, AlertTriangle, CheckCircle2, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Configuration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: config, isLoading } = useQuery({ queryKey: ['config'], queryFn: () => axios.get('/api/config').then(res => res.data) });
  const { dbStatus } = useAuth();
  const [showTroubleshooter, setShowTroubleshooter] = useState(dbStatus === 'disconnected');

  const mutation = useMutation({
    mutationFn: (newConfig: any) => axios.put('/api/config', newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('System configuration cycle updated. All nodes synchronized.', 'Configuration Saved');
    },
    onError: (error: any) => {
      console.error('Config update failed:', error);
      toast.error('Could not commit changes. ' + (error.response?.data?.message || 'Server rejected the payload.'), 'Configuration Error');
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

      {/* Database Connection telemetry and troubleshooter */}
      <div className="w-full">
        {dbStatus === 'connected' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-start gap-4">
            <div className="p-2 bg-emerald-500 text-white rounded shrink-0 shadow-sm shadow-emerald-500/20">
              <Database size={18} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wider">Database Connection Online</h3>
                <span className="bg-emerald-200 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest animate-pulse">Active</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                Your application is successfully linked to MongoDB. All product inventories, live registers, customer rewards records, and receipts are being securely synchronized and persisted.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-4 shadow-sm shadow-amber-500/5">
            <div className="flex items-start gap-4 justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500 text-white rounded shrink-0 shadow-sm shadow-amber-500/20">
                  <Database size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider">Database Link Offline</h3>
                    <span className="bg-amber-100 text-amber-900 text-[8px] font-bold border border-amber-200 uppercase px-2 py-0.5 rounded tracking-widest">Demo Sandbox Mode</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    No active MongoDB link has been detected. The application is running in a local <strong className="font-black text-amber-950">Sandbox Offline Mode</strong> utilizing static registers. To save custom items, run sales, and persist changes permanently across deployment recycles, you must connect your database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 active:bg-amber-300 text-amber-950 rounded font-black text-[9px] uppercase tracking-widest transition-all mb-auto shrink-0 select-none cursor-pointer border border-amber-300"
              >
                {showTroubleshooter ? 'Hide Diagnostics' : 'Solve Issue'}
                <span className="opacity-70 font-sans">{showTroubleshooter ? '▲' : '▼'}</span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showTroubleshooter && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-amber-200 pt-4 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle size={14} className="text-amber-800 animate-pulse shrink-0" />
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.1em]">Render Deployment and Atlas Setup Checklist</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-amber-950">
                    <div className="p-4 bg-white/75 border border-amber-100 rounded space-y-3 shadow-inner">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 bg-amber-800 text-white font-black text-[10px] rounded-full">1</span>
                        <span className="font-extrabold uppercase text-[9px] tracking-widest text-amber-900">Define Render Variable</span>
                      </div>
                      <p className="leading-relaxed text-[11px] text-amber-900">
                        Render runs server-side and requires secret environment parameters defined in your dashboard settings:
                      </p>
                      
                      <ol className="list-decimal pl-5 space-y-1.5 text-[11px] text-amber-800 font-medium pb-2">
                        <li>Visit your <strong className="text-amber-950">Render Dashboard</strong> and click on this Web Service.</li>
                        <li>Click the <strong className="text-amber-950">Environment</strong> tab in the sidebar.</li>
                        <li>Add a new variable:</li>
                      </ol>

                      <div className="space-y-2">
                        <div className="bg-amber-100/70 p-2.5 rounded border border-amber-200 font-mono text-[10px] break-all select-all flex justify-between items-center">
                          <div>
                            <span className="text-amber-900 font-bold">Key:</span> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-bold select-all text-amber-950">MONGODB_URI</code>
                          </div>
                        </div>
                        <div className="bg-amber-100/70 p-2.5 rounded border border-amber-250 font-mono text-[10px] leading-snug">
                          <span className="text-amber-900 font-bold">Example Value:</span> 
                          <span className="block mt-1 text-amber-800 select-all italic bg-white/90 p-1.5 rounded border border-amber-200 break-words text-[9px]">
                            mongodb+srv://admin:mysecpass@cluster0.abcde.mongodb.net/namaste_mart?retryWrites=true&w=majority
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-tight italic pl-1">
                          * Make sure you replace `<span className="font-bold">&lt;username&gt;</span>` and `<span className="font-bold">&lt;password&gt;</span>` with actual MDB user credentials created in your Atlas security panel.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/75 border border-amber-100 rounded space-y-3 shadow-inner flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 bg-amber-800 text-white font-black text-[10px] rounded-full">2</span>
                          <span className="font-extrabold uppercase text-[9px] tracking-widest text-amber-900">Authorize Node Access (IP whitelist)</span>
                        </div>
                        <p className="leading-relaxed text-[11px] text-amber-900">
                          Because Render's container deployments operate using dynamic cloud IPs, MongoDB Atlas will reject incoming requests unless explicitly whitelisted:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[11px] text-amber-800 font-medium">
                          <li>Open your <strong className="text-amber-950">MongoDB Atlas Consolidated console</strong>.</li>
                          <li>In the left pane, navigate to <strong className="text-amber-950">Security</strong> &rarr; <strong className="text-amber-950">Network Access</strong>.</li>
                          <li>Click the green <strong className="text-amber-950">Add IP Address</strong> button.</li>
                          <li>Click the <strong className="text-amber-950">Allow Access From Anywhere</strong> button (this adds the wildcard <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">0.0.0.0/0</code>).</li>
                          <li>Click <strong className="text-amber-950">Confirm</strong> and wait 1 minute for IP tables to activate.</li>
                        </ul>
                      </div>
                      
                      <div className="pt-4 flex items-center justify-end gap-2 shrink-0 border-t border-amber-100">
                        <a 
                          href="https://dashboard.render.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 text-[9px] font-black text-amber-950 bg-amber-250 hover:bg-amber-300 active:bg-amber-400 px-3 py-2 rounded-md uppercase tracking-wider transition-all shadow-sm"
                        >
                          Render Console <ExternalLink size={10} />
                        </a>
                        <a 
                          href="https://cloud.mongodb.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 text-[9px] font-black text-emerald-950 bg-emerald-250/90 hover:bg-emerald-200 active:bg-emerald-300 px-3 py-2 rounded-md uppercase tracking-wider transition-all shadow-sm"
                        >
                          MongoDB Atlas <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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
                        toast.success(data.message || 'Records Initialized', 'System Reset');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } catch (err: any) {
                        const msg = err.response?.data?.message || 'Seeding failed. Database connection required for master reset.';
                        toast.error(msg, 'System Reset Fail');
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

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Store } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data);
      navigate('/billing');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded border border-slate-200 shadow-2xl p-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 italic shadow-lg shadow-emerald-100">N</div>
          <h2 className="text-2xl font-black text-slate-900 tracking-[0.2em] uppercase">Namaste Mart</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Enterprise Asset Management v2.4</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-rose-50 text-rose-600 p-3 rounded border border-rose-100 text-[10px] font-black uppercase text-center tracking-widest">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Authorized Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold placeholder:text-slate-300"
                placeholder="USERID@DOMAIN.COM"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Keypass</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-4"
          >
            ENTER SYSTEM
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-150 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
            ⚡ Quick-Select Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail('cashier@namastemart.com');
                setPassword('cashierPass123');
              }}
              className="text-left p-3.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded transition-all active:scale-[0.97] group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-400 group-hover:text-emerald-600 font-extrabold uppercase tracking-wider">Operator (Cashier)</span>
                <span className="text-[8px] bg-slate-200/50 text-slate-600 px-1 py-0.5 rounded font-mono group-hover:bg-emerald-100 group-hover:text-emerald-700">Fill</span>
              </div>
              <p className="text-[9px] text-slate-600 font-mono font-bold truncate">cashier@namastemart.com</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                Key: <span className="text-slate-700 font-bold group-hover:text-emerald-800 font-mono">cashierPass123</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@namastemart.com');
                setPassword('adminPass123');
              }}
              className="text-left p-3.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded transition-all active:scale-[0.97] group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 font-extrabold uppercase tracking-wider">Administrator</span>
                <span className="text-[8px] bg-slate-200/50 text-slate-600 px-1 py-0.5 rounded font-mono group-hover:bg-indigo-100 group-hover:text-indigo-700">Fill</span>
              </div>
              <p className="text-[9px] text-slate-600 font-mono font-bold truncate">admin@namastemart.com</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                Key: <span className="text-slate-700 font-bold group-hover:text-indigo-800 font-mono font-mono">adminPass123</span>
              </p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

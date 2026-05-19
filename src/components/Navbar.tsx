import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Store, Package, Settings, LogOut, Users, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, logout, dbStatus } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Billing', path: '/billing', icon: ShoppingCart, roles: ['Admin', 'Cashier'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    { label: 'Products', path: '/products', icon: Package, roles: ['Admin'] },
    { label: 'Inventory', path: '/inventory', icon: Package, roles: ['Admin'] },
    { label: 'Config', path: '/config', icon: Settings, roles: ['Admin'] },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-white">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black italic">N</div>
            <div>
              <h1 className="text-sm font-black leading-tight uppercase tracking-widest text-white">Namaste Mart <span className="text-[10px] text-emerald-400 font-normal ml-1">ERP v2.4</span></h1>
              <div className="flex items-center gap-2">
                 <p className="text-[9px] text-slate-400 font-medium">Enterprise Asset Mgmt</p>
                 <div className="flex items-center gap-1">
                    <div className={cn("w-1 h-1 rounded-full", dbStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : dbStatus === 'disconnected' ? 'bg-amber-500' : 'bg-slate-500')}></div>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">{dbStatus}</span>
                 </div>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.roles.includes(user.role)).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                  location.pathname === item.path 
                    ? "bg-slate-800 text-emerald-400 shadow-inner border border-slate-700" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block border-r border-slate-700 pr-4">
            <p className="text-[11px] font-bold text-white leading-none uppercase tracking-wide">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 font-mono italic">{user.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 rounded transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, LayoutDashboard, Store, Package, Settings, LogOut, Users, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, logout, dbStatus } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: products } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(res => res.data),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const lowStockProducts = products ? products.filter((p: any) => p.stockQuantity <= p.reorderLevel) : [];
  const alertCount = lowStockProducts.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                    {dbStatus === 'connected' && (
                      <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Database Connected</span>
                    )}
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
          {/* Notification Bell */}
          <div className="relative" id="navbar-notif-container" ref={dropdownRef}>
            <button
              id="navbar-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-1.5 bg-slate-800 border border-slate-700 rounded transition-all hover:bg-slate-700 flex items-center justify-center relative",
                alertCount > 0 ? "text-rose-400 border-rose-900/50" : "text-slate-400"
              )}
              title={`${alertCount} Low Stock Alert${alertCount !== 1 ? 's' : ''}`}
            >
              <Bell size={16} className={cn(alertCount > 0 && "animate-pulse")} />
              {alertCount > 0 && (
                <span 
                  id="navbar-notif-badge"
                  className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                >
                  {alertCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                id="navbar-notif-dropdown"
                className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50 text-[11px] animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-slate-300">Inventory Status</span>
                  {alertCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 text-[9px] font-black tracking-wide border border-rose-900/30">
                      {alertCount} ALERT{alertCount !== 1 ? 'S' : ''}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 text-[9px] font-black tracking-wide border border-emerald-900/30">
                      SECURE
                    </span>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                  {alertCount > 0 ? (
                    lowStockProducts.map((p: any) => (
                      <div 
                        key={p._id || p.barcode} 
                        className="px-4 py-2.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                        id={`notif-item-${p.barcode}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate text-xs">{p.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">Barcode: {p.barcode}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 text-[10px] font-mono font-black border border-rose-900/20 whitespace-nowrap">
                            {p.stockQuantity} / {p.reorderLevel} {p.unit || 'pcs'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div id="notif-empty-state" className="px-4 py-6 text-center text-slate-400 space-y-1">
                      <p className="text-lg">🌿</p>
                      <p className="font-bold uppercase tracking-wider text-[10px] text-slate-300">All Levels Stable</p>
                      <p className="text-[9px] text-slate-500">No products are currently below designated reorder levels.</p>
                    </div>
                  )}
                </div>

                {user.role === 'Admin' && alertCount > 0 && (
                  <div className="px-4 pt-2 pb-1 border-t border-slate-800">
                    <Link
                      id="notif-view-all-link"
                      to="/inventory"
                      onClick={() => setShowNotifications(false)}
                      className="block w-full text-center py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 hover:border-emerald-500 rounded text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      Update Inventory Stock
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

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

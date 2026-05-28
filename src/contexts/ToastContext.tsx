import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, title, duration };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (message: string, title?: string, duration?: number) => addToast(message, 'success', title || 'Success', duration),
    error: (message: string, title?: string, duration?: number) => addToast(message, 'error', title || 'Action Required', duration),
    warning: (message: string, title?: string, duration?: number) => addToast(message, 'warning', title || 'Warning', duration),
    info: (message: string, title?: string, duration?: number) => addToast(message, 'info', title || 'Information', duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Subcomponent for each Toast with Micro-animations
function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void; key?: React.Key }) {
  const { id, message, type, title } = item;

  // Rich theme mapping
  const styles = {
    success: {
      bg: 'bg-emerald-950/95 border-emerald-800 text-emerald-100',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      accentBar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-rose-950/95 border-rose-800 text-rose-100',
      iconBg: 'bg-rose-500/20 text-rose-400',
      icon: <AlertOctagon size={18} className="text-rose-400" />,
      accentBar: 'bg-rose-500',
    },
    warning: {
      bg: 'bg-amber-950/95 border-amber-800 text-amber-100',
      iconBg: 'bg-amber-500/20 text-amber-400',
      icon: <AlertTriangle size={18} className="text-amber-400" />,
      accentBar: 'bg-amber-505',
    },
    info: {
      bg: 'bg-slate-900/95 border-slate-700 text-slate-100',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      icon: <Info size={18} className="text-indigo-400" />,
      accentBar: 'bg-indigo-500',
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative pointer-events-auto overflow-hidden self-end min-w-[280px] w-full max-w-sm rounded-lg border p-4 shadow-xl backdrop-blur-md flex items-start gap-3.5 ${styles.bg}`}
    >
      {/* Decorative Brand Accent Left Strip */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accentBar}`} />

      {/* Leading Icon Frame */}
      <div className={`p-1.5 rounded-md shrink-0 flex items-center justify-center ${styles.iconBg}`}>
        {styles.icon}
      </div>

      {/* Copy / Message Layout */}
      <div className="flex-1 space-y-0.5 pr-2">
        {title && (
          <h4 className="text-[10px] font-black uppercase tracking-wider opacity-80 leading-none">
            {title}
          </h4>
        )}
        <p className="text-xs font-semibold leading-relaxed text-white/95">
          {message}
        </p>
      </div>

      {/* Dismiss Trigger */}
      <button
        onClick={() => onDismiss(id)}
        className="text-white/40 hover:text-white/90 p-1 rounded-md hover:bg-white/5 transition-colors shrink-0 select-none cursor-pointer"
        type="button"
        aria-label="Dismiss receipt alert"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

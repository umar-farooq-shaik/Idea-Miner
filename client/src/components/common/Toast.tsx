import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  description?: string;
}

interface ToastContextType {
  toast: (type: 'success' | 'error' | 'info', message: string, description?: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (msg: string, desc?: string) => addToast('success', msg, desc),
    error: (msg: string, desc?: string) => addToast('error', msg, desc),
    info: (msg: string, desc?: string) => addToast('info', msg, desc),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-editorial border transition-all duration-300 animate-slide-up ${
              t.type === 'success' ? 'bg-white border-olive-border text-charcoal' :
              t.type === 'error' ? 'bg-white border-red-300 text-charcoal' :
              'bg-white border-stone-300 text-charcoal'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-olive shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-copper shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-semibold">{t.message}</p>
              {t.description && <p className="text-xs text-charcoal-muted mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-stone-400 hover:text-charcoal p-1 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

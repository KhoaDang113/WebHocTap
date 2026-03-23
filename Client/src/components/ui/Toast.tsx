import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => string
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (type !== 'loading') {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }, [dismiss])

  const success = (message: string, duration?: number) => toast(message, 'success', duration)
  const error = (message: string, duration?: number) => toast(message, 'error', duration)
  const info = (message: string, duration?: number) => toast(message, 'info', duration)

  return (
    <ToastContext.Provider value={{ toast, success, error, info, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full sm:w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              flex items-center justify-between p-4 rounded-xl shadow-2xl border
              animate-in slide-in-from-right-full transition-all duration-300
              ${t.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : ''}
              ${t.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : ''}
              ${t.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
              ${t.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : ''}
              ${t.type === 'loading' ? 'bg-white border-slate-100 text-slate-800' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
              <p className="text-sm font-medium leading-tight">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

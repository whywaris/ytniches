'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastContextType {
  showToast: (message?: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('Saved')
  const [type, setType] = useState<ToastType>('success')

  const showToast = useCallback((msg?: string, toastType?: ToastType) => {
    setMessage(msg ?? 'Saved')
    setType(toastType ?? 'success')
    setVisible(true)
    setTimeout(() => setVisible(false), 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in pointer-events-none">
          <div className={cn(
            'flex items-center gap-2 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg',
            type === 'error' ? 'bg-[#E8402A]' : type === 'info' ? 'bg-[#2563EB]' : 'bg-[#1A1612]'
          )}>
            {type === 'error' && <XCircle className="w-4 h-4" />}
            {type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />}
            {type === 'info' && <Info className="w-4 h-4" />}
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

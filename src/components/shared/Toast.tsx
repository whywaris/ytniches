'use client'

import { useEffect } from 'react'
import { Check, X, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onDismiss: () => void
}

export function Toast({ message, type = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className={`
      fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50
      flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm whitespace-nowrap
      ${type === 'error' ? 'bg-[#E8402A] text-white' : 'bg-[#1A1612] text-white'}
    `}>
      {type === 'success' && <Check className="w-4 h-4 text-green-400 shrink-0" />}
      {type === 'error' && <X className="w-4 h-4 shrink-0" />}
      {type === 'info' && <Info className="w-4 h-4 text-[#E8402A] shrink-0" />}
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-50 hover:opacity-100 shrink-0">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

'use client'

import { useUser } from '@/hooks/useUser'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useUser()
  return <>{children}</>
}

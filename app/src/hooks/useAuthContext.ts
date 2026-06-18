import { createContext, useContext } from 'react'
import { type AuthState } from './useAuth'

export const AuthContext = createContext<AuthState | null>(null)

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}

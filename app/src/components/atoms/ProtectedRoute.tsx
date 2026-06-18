import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../hooks/useAuthContext'
import Icon from './Icon'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary-container animate-spin" size={40} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

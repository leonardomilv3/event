import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../hooks/useAuthContext'
import Icon from './Icon'
import { buildAuthPath } from '../../utils/redirect'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary-container animate-spin" size={40} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={buildAuthPath(location.pathname + location.search)} replace />
  }

  return <>{children}</>
}

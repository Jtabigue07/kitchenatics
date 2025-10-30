import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requireRole }) {
	const { isAuthenticated, user, loading } = useAuth()
	if (loading) return null
	if (!isAuthenticated) return <Navigate to="/login" replace />
	if (requireRole) {
		if (requireRole === 'admin' && user?.role !== 'admin') return <Navigate to="/login" replace />
		if (requireRole === 'user' && user?.role !== 'user') return <Navigate to="/login" replace />
	}
	if (user?.role === 'user' && user?.emailVerified === false) return <Navigate to="/verify-email" replace />
	return <Outlet />
}

import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/User/Register'
import Login from './components/User/Login'
import ForgotPassword from './components/User/ForgotPassword'
import ResetPassword from './components/User/ResetPassword'
import VerifyNotice from './components/User/VerifyNotice'
import VerifyEmail from './components/User/VerifyEmail'
import UserDashboard from './components/User/Dashboard'
import AdminDashboard from './components/Admin/Dashboard'

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/reset-password/:token" element={<ResetPassword />} />
					<Route path="/verify-email" element={<VerifyNotice />} />
					<Route path="/verify-email/:token" element={<VerifyEmail />} />

					<Route element={<ProtectedRoute requireRole="user" />}> 
						<Route path="/user" element={<UserDashboard />} />
					</Route>

					<Route element={<ProtectedRoute requireRole="admin" />}> 
						<Route path="/admin" element={<AdminDashboard />} />
					</Route>

					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}
export default App

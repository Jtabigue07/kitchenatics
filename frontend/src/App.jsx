import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/User/Register'
import Login from './components/User/Login'
import ForgotPassword from './components/User/ForgotPassword'
import ResetPassword from './components/User/ResetPassword'
import VerifyNotice from './components/User/VerifyNotice'
import VerifyEmail from './components/User/VerifyEmail'
import UserDashboard from './components/User/Dashboard'
import ProductsHome from './components/User/ProductsHome'
import Cart from './components/User/Cart'
import Profile from './components/User/Profile'
import AdminDashboard from './components/Admin/Dashboard'
import ProductManagement from './components/Admin/ProductManagement'
import OrderManagement from './components/Admin/OrderManagement'
import UserManagement from './components/Admin/UserManagement'

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<CartProvider>
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
							<Route path="/me" element={<Profile />} />
							<Route path="/products" element={<ProductsHome />} />
							<Route path="/home" element={<ProductsHome />} />
							<Route path="/cart" element={<Cart />} />
						</Route>

						<Route element={<ProtectedRoute requireRole="admin" />}>
							<Route path="/admin" element={<AdminDashboard />} />
							<Route path="/admin/products" element={<ProductManagement />} />
							<Route path="/admin/orders" element={<OrderManagement />} />
							<Route path="/admin/users" element={<UserManagement />} />
						</Route>

						<Route path="*" element={<Navigate to="/login" replace />} />
					</Routes>
				</CartProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}
export default App

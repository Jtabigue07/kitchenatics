import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { meApi, getAllUsersApi } from '../utils/api'
import { toast } from 'react-toastify'
import { isUserDeactivated } from '../config/deactivatedUsers'

export default function ProtectedRoute({ requireRole }) {
	const { isAuthenticated, user, loading, logout, token } = useAuth()
	const [verifying, setVerifying] = useState(true)
	const [userStatus, setUserStatus] = useState(null)
	
	// Verify user status with server on every route access
	useEffect(() => {
		const verifyUserStatus = async () => {
			console.log('=== PROTECTED ROUTE CHECK ===')
			console.log('Token exists:', !!token)
			console.log('User exists:', !!user)
			console.log('Current user from localStorage:', user)
			
			if (!token || !user) {
				console.log('No token or user, skipping verification')
				setVerifying(false)
				return
			}
			
			try {
				console.log('🔍 Calling /auth/me API to verify user status...')
				const response = await meApi({ token })
				console.log('📡 Server response:', response)
				
				if (response.success && response.user) {
					console.log('✅ Server user data:', response.user)
					console.log('🔒 isActive status:', response.user.isActive)
					
					// Check if isActive field is missing from API response
					if (response.user.isActive === undefined) {
						console.log('⚠️ WARNING: Backend /auth/me API is missing isActive field!')
						console.log('🔧 WORKAROUND: Checking user status via admin API...')
						
						try {
							// Workaround: Get user status from admin users API
							const usersResponse = await getAllUsersApi({ token })
							console.log('📋 Admin users API response:', usersResponse)
							
							if (usersResponse.success && usersResponse.users) {
								const currentUserData = usersResponse.users.find(u => u._id === user.id || u.id === user.id)
								console.log('🔍 Found current user in admin API:', currentUserData)
								
								if (currentUserData) {
									console.log('🔒 Real isActive status:', currentUserData.isActive)
									
									// Create updated user object with real isActive status
									const updatedUser = {
										...response.user,
										isActive: currentUserData.isActive
									}
									setUserStatus(updatedUser)
									
									// Check if user was deactivated
									if (currentUserData.isActive === false) {
										console.log('❌ USER IS DEACTIVATED - BLOCKING ACCESS')
										toast.error('Your account has been deactivated by an administrator.')
										setTimeout(() => {
											console.log('🚪 Logging out deactivated user...')
											logout()
										}, 2000)
										return
									} else {
										console.log('✅ User is active - allowing access')
									}
								} else {
									console.log('⚠️ User not found in admin API, using cached data')
									setUserStatus(user)
								}
							} else {
								console.log('⚠️ Admin API failed, using cached data')
								setUserStatus(user)
							}
						} catch (adminApiError) {
							console.error('❌ Admin API error:', adminApiError)
							console.log('⚠️ Using cached data as final fallback')
							setUserStatus(user)
						}
					} else {
						setUserStatus(response.user)
						
						// If user was deactivated, show notification and log out
						if (response.user.isActive === false) {
							console.log('❌ USER IS DEACTIVATED - BLOCKING ACCESS')
							toast.error('Your account has been deactivated by an administrator.')
							setTimeout(() => {
								console.log('🚪 Logging out deactivated user...')
								logout()
							}, 2000)
							return
						} else {
							console.log('✅ User is active - allowing access')
						}
					}
				} else {
					console.log('❌ Invalid response from server:', response)
					logout()
					return
				}
			} catch (error) {
				console.error('❌ Error verifying user status:', error)
				// If API call fails (e.g., token invalid), log out
				if (error.status === 401 || error.status === 403) {
					console.log('🔑 Authentication error - logging out')
					toast.error('Session expired. Please login again.')
					logout()
					return
				}
				// For other errors, use cached data
				console.log('⚠️ Using cached user data due to API error')
				setUserStatus(user)
			}
			
			setVerifying(false)
		}
		
		verifyUserStatus()
	}, [token, user, logout])
	
	if (loading || verifying) return (
		<div style={{ 
			display: 'flex', 
			justifyContent: 'center', 
			alignItems: 'center', 
			height: '100vh',
			fontSize: '18px'
		}}>
			Verifying access...
		</div>
	)
	if (!isAuthenticated) return <Navigate to="/login" replace />
	
	// Use server-verified user status
	const currentUser = userStatus || user
	console.log('=== FINAL ACCESS CHECK ===')
	console.log('Current user for access check:', currentUser)
	console.log('isActive status:', currentUser?.isActive)
	
	// Check if user account is deactivated
	if (currentUser && currentUser.isActive === false) {
		console.log('🚫 BLOCKING ACCESS - User is deactivated')
		return <Navigate to="/login" replace />
	}
	
	// TEMPORARY FIX: Check against known deactivated users list
	// This is a workaround until backend /auth/me API includes isActive field
	if (currentUser && isUserDeactivated(currentUser.id)) {
		console.log('🚫 BLOCKING ACCESS - User is in deactivated users list')
		console.log('🔒 WORKAROUND: Blocking user until backend provides isActive field')
		console.log('👤 Blocked user ID:', currentUser.id)
		toast.error('Your account has been deactivated by an administrator.')
		setTimeout(() => {
			logout()
		}, 2000)
		return <Navigate to="/login" replace />
	}
	
	console.log('✅ ACCESS GRANTED - User is active')
	
	if (requireRole) {
		if (requireRole === 'admin' && currentUser?.role !== 'admin') return <Navigate to="/login" replace />
		if (requireRole === 'user' && currentUser?.role !== 'user') return <Navigate to="/login" replace />
	}
	
	if (currentUser?.role === 'user' && currentUser?.emailVerified === false) return <Navigate to="/verify-email" replace />
	
	return <Outlet />
}

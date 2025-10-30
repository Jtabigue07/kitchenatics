import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function AuthProvider({ children }) {
	const [token, setToken] = useState(null)
	const [user, setUser] = useState(null) // { id, email, role, emailVerified }
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const savedToken = localStorage.getItem(TOKEN_KEY)
		const savedUser = localStorage.getItem(USER_KEY)
		if (savedToken) setToken(savedToken)
		if (savedUser) {
			try { setUser(JSON.parse(savedUser)) } catch {}
		}
		setLoading(false)
	}, [])

	const login = useCallback((jwtToken, userInfo) => {
		setToken(jwtToken)
		setUser(userInfo)
		localStorage.setItem(TOKEN_KEY, jwtToken)
		localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
	}, [])

	const logout = useCallback(() => {
		setToken(null)
		setUser(null)
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
	}, [])

	const value = useMemo(() => ({ token, user, loading, isAuthenticated: Boolean(token && user), login, logout }), [token, user, loading, login, logout])

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

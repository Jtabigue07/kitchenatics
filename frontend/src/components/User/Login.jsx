import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setSubmitting(true)
		try {
			const res = await loginApi({ email, password })
			const { token, user } = res
			if (user?.role === 'user' && user?.emailVerified === false) {
				setError('Please verify your email before logging in.')
				setSubmitting(false)
				return
			}
			login(token, user)
			if (user?.role === 'admin') navigate('/admin')
			else navigate('/products')
		} catch (err) {
			setError(err?.message || 'Login failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
			<h2>Sign in</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<label>Email</label>
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				{error ? <div style={{ color: 'red', marginBottom: 12 }}>{error}</div> : null}
				<button type="submit" disabled={submitting} style={{ width: '100%', padding: 10 }}>
					{submitting ? 'Signing in…' : 'Sign in'}
				</button>
			</form>
			<div style={{ marginTop: 12 }}>
				<Link to="/forgot-password">Forgot Password?</Link>
			</div>
			<div style={{ marginTop: 8 }}>
				Don’t have an account? <Link to="/register">Register</Link>
			</div>
		</div>
	)
}

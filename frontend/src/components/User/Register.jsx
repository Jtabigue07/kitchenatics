import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerApi } from '../../utils/api'

export default function Register() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [avatar, setAvatar] = useState(null)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [submitting, setSubmitting] = useState(false)

	function validate() {
		if (!name.trim()) return 'Name is required'
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email'
		if (password.length < 6) return 'Password must be at least 6 characters'
		if (avatar && avatar.size > 2 * 1024 * 1024) return 'Avatar must be ≤ 2MB'
		if (avatar && !/^image\//.test(avatar.type)) return 'Avatar must be an image'
		return ''
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setSuccess('')
		const v = validate()
		if (v) { setError(v); return }
		setSubmitting(true)
		try {
			await registerApi({ name, email, password, avatarFile: avatar })
			setSuccess('Registration successful. Please verify your email to log in.')
			setName(''); setEmail(''); setPassword(''); setAvatar(null)
		} catch (err) {
			setError(err?.message || 'Registration failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ maxWidth: 480, margin: '40px auto', padding: 16 }}>
			<h2>Create account</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<label>Name</label>
					<input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Email</label>
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Avatar (optional)</label>
					<input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
				</div>
				{error ? <div style={{ color: 'red', marginBottom: 12 }}>{error}</div> : null}
				{success ? <div style={{ color: 'green', marginBottom: 12 }}>{success}</div> : null}
				<button 
					type="submit" 
					disabled={submitting} 
					style={{ 
						width: '100%', 
						padding: 10,
						backgroundColor: '#4CAF50',
						color: 'white',
						border: 'none',
						borderRadius: 4,
						cursor: submitting ? 'wait' : 'pointer'
					}}
				>
					{submitting ? 'Creating…' : 'Create account'}
				</button>
			</form>
			
			<div style={{ 
				marginTop: 20, 
				textAlign: 'center',
				padding: '10px',
				borderTop: '1px solid #eee'
			}}>
				<p style={{ margin: '10px 0' }}>Already have an account?</p>
				<Link 
					to="/login"
					style={{
						display: 'inline-block',
						padding: '8px 20px',
						backgroundColor: '#2196F3',
						color: 'white',
						textDecoration: 'none',
						borderRadius: 4,
						border: 'none',
						cursor: 'pointer'
					}}
				>
					Login
				</Link>
			</div>
		</div>
	)
}

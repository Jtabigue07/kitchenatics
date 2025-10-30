import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { resetPasswordApi } from '../../utils/api'

export default function ResetPassword() {
	const { token } = useParams()
	const navigate = useNavigate()
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)

	function validate() {
		if (password.length < 6) return 'Password must be at least 6 characters'
		if (password !== confirm) return 'Passwords do not match'
		return ''
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setMessage('')
		const v = validate()
		if (v) { setError(v); return }
		setSubmitting(true)
		try {
			const res = await resetPasswordApi({ token, password })
			setMessage(res?.message || 'Password reset successful. You can now log in.')
			setTimeout(() => navigate('/login'), 1200)
		} catch (err) {
			setError(err?.message || 'Reset failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
			<h2>Reset Password</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<label>New Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Confirm Password</label>
					<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				{error ? <div style={{ color: 'red', marginBottom: 12 }}>{error}</div> : null}
				{message ? <div style={{ color: 'green', marginBottom: 12 }}>{message}</div> : null}
				<button type="submit" disabled={submitting} style={{ width: '100%', padding: 10 }}>
					{submitting ? 'Resetting…' : 'Reset Password'}
				</button>
			</form>
			<div style={{ marginTop: 12 }}>
				<Link to="/login">Back to login</Link>
			</div>
		</div>
	)
}

import { useState } from 'react'
import { forgotPasswordApi } from '../../utils/api'

export default function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setMessage('')
		setSubmitting(true)
		try {
			const res = await forgotPasswordApi({ email })
			setMessage(res?.message || 'If this email exists, a reset link was sent.')
		} catch (err) {
			setError(err?.message || 'Request failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
			<h2>Forgot Password</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<label>Email</label>
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
				</div>
				{error ? <div style={{ color: 'red', marginBottom: 12 }}>{error}</div> : null}
				{message ? <div style={{ color: 'green', marginBottom: 12 }}>{message}</div> : null}
				<button type="submit" disabled={submitting} style={{ width: '100%', padding: 10 }}>
					{submitting ? 'Sending…' : 'Send reset link'}
				</button>
			</form>
		</div>
	)
}

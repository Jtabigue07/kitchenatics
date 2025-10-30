import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmailApi } from '../../utils/api'

export default function VerifyEmail() {
	const { token } = useParams()
	const navigate = useNavigate()
	const [status, setStatus] = useState({ loading: true, message: '' })

	useEffect(() => {
		if (!token) {
			setStatus({ loading: false, message: 'Invalid verification link.' })
			return
		}

		async function verify() {
			try {
				const res = await verifyEmailApi({ token })
				setStatus({ loading: false, message: res?.message || 'Email verified successfully.' })
				// after a short delay, navigate to login
				setTimeout(() => navigate('/login'), 2500)
			} catch (err) {
				setStatus({ loading: false, message: err?.message || 'Verification failed.' })
			}
		}

		verify()
	}, [token, navigate])

	return (
		<div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
			<h2>Email verification</h2>
			{status.loading ? (
				<p>Verifying…</p>
			) : (
				<>
					<p>{status.message}</p>
					<p>Redirecting to <a href="/login">login</a>…</p>
				</>
			)}
		</div>
	)
}

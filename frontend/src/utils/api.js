const rawAPI = import.meta.env.VITE_API
// If VITE_API isn't set, default to the Vite proxy path for the backend.
// Also guard against accidental values like ':4000' which produce invalid fetch URLs.
const API = (typeof rawAPI === 'string' && rawAPI.trim() && rawAPI !== 'undefined')
	? rawAPI.replace(/\/$/, '')
	: '/api/v1'

async function request(path, { method = 'GET', headers = {}, body, token, isFormData } = {}) {
	// Build absolute or relative URL safely
	const url = path.startsWith('http') ? path : `${API}${path.startsWith('/') ? '' : '/'}${path}`
	const finalHeaders = { ...headers }
	if (!isFormData) finalHeaders['Content-Type'] = 'application/json'
	if (token) finalHeaders.Authorization = `Bearer ${token}`

	const res = await fetch(url, {
		method,
		headers: finalHeaders,
		body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
	})

	// Try to parse JSON when the response is JSON. If it's HTML (e.g. index.html on a 404),
	// return the text so the caller gets a helpful message instead of "Unexpected token '<'".
	const contentType = res.headers.get('content-type') || ''
	let data
	if (contentType.includes('application/json')) {
		data = await res.json()
	} else {
		data = await res.text()
	}

	if (!res.ok) {
		const message = (data && (data.error || data.message)) || `Request failed (${res.status})`
		const err = new Error(message)
		err.status = res.status
		err.data = data
		throw err
	}

	return data
}

export function registerApi({ name, email, password, avatarFile }) {
	const form = new FormData()
	form.append('name', name)
	form.append('email', email)
	form.append('password', password)
	if (avatarFile) form.append('avatar', avatarFile)
	return request('/auth/register', { method: 'POST', body: form, isFormData: true })
}

export function loginApi({ email, password }) {
	return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function forgotPasswordApi({ email }) {
	return request('/auth/forgot-password', { method: 'POST', body: { email } })
}

export function resetPasswordApi({ token, password }) {
	return request('/auth/reset-password', { method: 'POST', body: { token, password } })
}

export function meApi({ token }) {
	return request('/auth/me', { method: 'GET', token })
}

export function verifyEmailApi({ token }) {
	// backend expects GET /auth/verify-email/:token
	return request(`/auth/verify-email/${token}`, { method: 'GET' })
}

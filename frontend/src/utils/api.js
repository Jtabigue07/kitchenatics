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

	// Don't set Content-Type for FormData - browser will set it with boundary
	if (!isFormData) {
		finalHeaders['Content-Type'] = 'application/json'
	}

	if (token) {
		finalHeaders.Authorization = `Bearer ${token}`
	}

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

export function updateProfileApi({ token, name, password, avatarFile, phone, address, zipCode, gender, dateOfBirth }) {
	const form = new FormData()
	if (name) form.append('name', name)
	if (password) form.append('password', password)
	if (avatarFile) form.append('avatar', avatarFile)
	if (phone !== undefined) form.append('phone', phone)
	if (address !== undefined) form.append('address', address)
	if (zipCode !== undefined) form.append('zipCode', zipCode)
	if (gender) form.append('gender', gender)
	if (dateOfBirth) form.append('dateOfBirth', dateOfBirth)
	return request('/auth/me', { method: 'PUT', body: form, token, isFormData: true })
}

export function verifyEmailApi({ token }) {
	// backend expects GET /auth/verify-email/:token
	return request(`/auth/verify-email/${token}`, { method: 'GET' })
}

// Products API
export function getProductsApi({ keyword = '', category = '', brand = '', type = '', minPrice = '', maxPrice = '', page = 1 } = {}) {
	let queryParams = []
	if (keyword) queryParams.push(`keyword=${encodeURIComponent(keyword)}`)
	if (category) queryParams.push(`category=${encodeURIComponent(category)}`)
	if (brand) queryParams.push(`brand=${encodeURIComponent(brand)}`)
	if (type) queryParams.push(`type=${encodeURIComponent(type)}`)
	if (minPrice) queryParams.push(`minPrice=${minPrice}`)
	if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`)
	if (page) queryParams.push(`page=${page}`)

	const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
	return request(`/products${query}`, { method: 'GET' })
}

export function getProductApi(id) {
	return request(`/products/${id}`, { method: 'GET' })
}

export function createProductApi({ token, productData, images }) {
	const formData = new FormData()

	// Append all product data fields
	Object.keys(productData).forEach(key => {
		const value = productData[key]
		if (value !== null && value !== undefined && value !== '') {
			formData.append(key, value)
		}
	})

	// Append images if provided
	if (images && images.length > 0) {
		images.forEach(image => {
			if (image) {
				formData.append('images', image)
			}
		})
	}

	return request('/products', { method: 'POST', body: formData, token, isFormData: true })
}

export function updateProductApi({ token, id, productData, images }) {
	const formData = new FormData()
	Object.keys(productData).forEach(key => {
		if (productData[key] !== undefined && productData[key] !== null) {
			formData.append(key, productData[key])
		}
	})
	if (images && images.length > 0) {
		images.forEach(image => {
			formData.append('images', image)
		})
	}
	return request(`/products/${id}`, { method: 'PUT', body: formData, token, isFormData: true })
}

export function deleteProductApi({ token, id }) {
	return request(`/products/${id}`, { method: 'DELETE', token })
}

// Admin user management APIs
export function getAllUsersApi({ token }) {
	return request('/admin/users', { method: 'GET', token })
}

export function updateUserApi({ token, id, role, isActive }) {
	const body = {}
	if (typeof role !== 'undefined') body.role = role
	if (typeof isActive !== 'undefined') body.isActive = isActive
	return request(`/admin/user/${id}`, { method: 'PUT', token, body })
}

// Cart API functions
export function addToCartApi({ token, productId, quantity = 1 }) {
	return request('/cart', { method: 'POST', token, body: { productId, quantity } })
}

export function getCartApi({ token }) {
	return request('/cart', { method: 'GET', token })
}

export function updateCartItemApi({ token, itemId, quantity }) {
	return request(`/cart/${itemId}`, { method: 'PUT', token, body: { quantity } })
}

export function removeFromCartApi({ token, itemId }) {
	return request(`/cart/${itemId}`, { method: 'DELETE', token })
}

export function clearCartApi({ token }) {
	return request('/cart', { method: 'DELETE', token })
}

// Order API functions
export function createOrderApi({ token, paymentMethod, notes }) {
	return request('/checkout', { method: 'POST', token, body: { paymentMethod, notes } })
}

export function getUserOrdersApi({ token, page = 1, limit = 10 }) {
	let queryParams = []
	if (page) queryParams.push(`page=${page}`)
	if (limit) queryParams.push(`limit=${limit}`)
	const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
	return request(`/orders/my-orders${query}`, { method: 'GET', token })
}

export function getOrderDetailsApi({ token, orderId }) {
	return request(`/orders/${orderId}`, { method: 'GET', token })
}

export function updateOrderStatusApi({ token, orderId, status, notes }) {
	return request(`/orders/${orderId}/status`, { method: 'PUT', token, body: { status, notes } })
}

// Receipt API functions
export async function downloadReceiptApi({ token, orderId }) {
	const url = `/receipt/download/${orderId}`.startsWith('http') ? `/receipt/download/${orderId}` : `${API}/receipt/download/${orderId}`
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
		}
	})

	if (!response.ok) {
		let errorData
		try {
			errorData = await response.json()
		} catch (e) {
			errorData = { message: 'Failed to download receipt' }
		}
		throw new Error(errorData.message || 'Failed to download receipt')
	}

	return response.blob()
}

export function getReceiptStatusApi({ token, orderId }) {
	return request(`/receipt/status/${orderId}`, { method: 'GET', token })
}

export function getAllOrdersApi({ token, page = 1, limit = 10, status, search }) {
	let queryParams = []
	if (page) queryParams.push(`page=${page}`)
	if (limit) queryParams.push(`limit=${limit}`)
	if (status && status !== 'all') queryParams.push(`status=${status}`)
	if (search) queryParams.push(`search=${encodeURIComponent(search)}`)
	const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
	return request(`/orders/admin/all${query}`, { method: 'GET', token })
}

export function getAdminOrderDetailsApi({ token, orderId }) {
	return request(`/orders/admin/${orderId}`, { method: 'GET', token })
}

const USER_KEY = 'auth_user'
const TOKEN_KEY = 'auth_token'

export function getUser() {
	const userStr = localStorage.getItem(USER_KEY)
	if (!userStr) return null
	try {
		return JSON.parse(userStr)
	} catch {
		return null
	}
}

export function logout(navigate) {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem(USER_KEY)
	if (navigate) {
		navigate()
	}
}


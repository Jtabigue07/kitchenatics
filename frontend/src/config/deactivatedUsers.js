// TEMPORARY FIX: List of deactivated users
// This is a workaround until the backend /auth/me API includes isActive field
// Add user IDs here when admin deactivates them

export const DEACTIVATED_USERS = [
	// '690238872ea33b0d33125d44', // JAY - REACTIVATED by admin
	// Add more user IDs here as needed
	// 'another-user-id',
	// 'yet-another-user-id',
]

// Helper function to check if user is in deactivated list
export const isUserDeactivated = (userId) => {
	return DEACTIVATED_USERS.includes(userId)
}

// Function to add user to deactivated list (for admin use)
export const addDeactivatedUser = (userId) => {
	if (!DEACTIVATED_USERS.includes(userId)) {
		DEACTIVATED_USERS.push(userId)
		console.log(`Added ${userId} to deactivated users list`)
	}
}

// Function to remove user from deactivated list (when reactivated)
export const removeDeactivatedUser = (userId) => {
	const index = DEACTIVATED_USERS.indexOf(userId)
	if (index > -1) {
		DEACTIVATED_USERS.splice(index, 1)
		console.log(`Removed ${userId} from deactivated users list`)
	}
}

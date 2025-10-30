import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
	const { user, logout } = useAuth()
	return (
		<div style={{ padding: 16 }}>
			<h2>Admin Dashboard</h2>
			<p>Welcome, {user?.email}</p>
			<ul>
				<li>Product management</li>
				<li>User management</li>
				<li>Review moderation</li>
				<li>Analytics</li>
			</ul>
			<button onClick={logout}>Logout</button>
		</div>
	)
}

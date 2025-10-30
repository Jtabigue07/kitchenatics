import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
	const { user, logout } = useAuth()
	return (
		<div style={{ padding: 16 }}>
			<h2>User Dashboard</h2>
			<p>Welcome, {user?.email}</p>
			<ul>
				<li>Browse products</li>
				<li>Manage cart</li>
				<li>Edit profile</li>
			</ul>
			<button onClick={logout}>Logout</button>
		</div>
	)
}

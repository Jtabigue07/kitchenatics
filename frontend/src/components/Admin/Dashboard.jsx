import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'

export default function Dashboard() {
	const { user } = useAuth()
	
	return (
		<>
			<MetaData title="Admin Dashboard" />
			<Header />
			<div className="container-fluid" style={{ minHeight: '80vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
				<div className="row">
					<div className="col-12">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<div>
								<h2>Admin Dashboard</h2>
								<p className="mb-0">Welcome, {user?.email}</p>
							</div>
							<div>
								<Link to="/me" className="btn btn-outline-primary me-2">
									<i className="fa fa-user mr-2"></i>Profile
								</Link>
							</div>
						</div>
						
						<div className="row">
							{/* Order Management */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card h-100 border-primary">
									<div className="card-body text-center">
										<div className="mb-3">
											<i className="fa fa-shopping-bag fa-3x text-primary"></i>
										</div>
										<h5 className="card-title">Order Management</h5>
										<p className="card-text">View and manage customer orders, update order status, and track deliveries.</p>
										<Link to="/admin/orders" className="btn btn-primary">
											<i className="fa fa-cog mr-2"></i>Manage Orders
										</Link>
									</div>
								</div>
							</div>
							
							{/* Product Management */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card h-100 border-success">
									<div className="card-body text-center">
										<div className="mb-3">
											<i className="fa fa-box fa-3x text-success"></i>
										</div>
										<h5 className="card-title">Product Management</h5>
										<p className="card-text">Create, update, and delete products for your store. Manage inventory and pricing.</p>
										<Link to="/admin/products" className="btn btn-success">
											<i className="fa fa-cog mr-2"></i>Manage Products
										</Link>
									</div>
								</div>
							</div>
							
							{/* User Management */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card h-100 border-info">
									<div className="card-body text-center">
										<div className="mb-3">
											<i className="fa fa-users fa-3x text-info"></i>
										</div>
										<h5 className="card-title">User Management</h5>
										<p className="card-text">View and manage user accounts, assign roles, and monitor user activity.</p>
										<Link to="/admin/users" className="btn btn-info">
											<i className="fa fa-cog mr-2"></i>Manage Users
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	)
}

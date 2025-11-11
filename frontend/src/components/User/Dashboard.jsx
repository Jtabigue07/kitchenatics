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
			<MetaData title="User Dashboard" />
			<Header />
			<div className="container container-fluid" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
				<div className="row">
					<div className="col-12">
						<h2 className="mb-4" style={{ color: '#333', fontWeight: '600' }}>User Dashboard</h2>
						<div className="row">
							{/* Welcome Card */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card" style={{ height: '100%' }}>
									<div className="card-body">
										<h5 className="card-title">Welcome Back!</h5>
										<p className="card-text">
											<strong>Name:</strong> {user?.name || 'N/A'}<br />
											<strong>Email:</strong> {user?.email || 'N/A'}<br />
											<strong>Status:</strong> {user?.emailVerified ? 
												<span className="text-success">Verified</span> : 
												<span className="text-warning">Pending Verification</span>
											}
										</p>
									</div>
								</div>
							</div>

							{/* Quick Actions */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card" style={{ height: '100%' }}>
									<div className="card-body">
										<h5 className="card-title">Quick Actions</h5>
										<div className="d-flex flex-column">
											<Link to="/products" className="btn btn-outline-primary mb-2">
												<i className="fa fa-shopping-bag mr-2"></i>
												Browse Products
											</Link>
											<Link to="/cart" className="btn btn-outline-success mb-2">
												<i className="fa fa-shopping-cart mr-2"></i>
												View Cart
											</Link>
											<Link to="/orders/me" className="btn btn-outline-info mb-2">
												<i className="fa fa-list-alt mr-2"></i>
												My Orders
											</Link>
											<Link to="/me" className="btn btn-outline-secondary">
												<i className="fa fa-user mr-2"></i>
												Edit Profile
											</Link>
										</div>
									</div>
								</div>
							</div>

							{/* Account Information */}
							<div className="col-12 col-md-6 col-lg-4 mb-4">
								<div className="card" style={{ height: '100%' }}>
									<div className="card-body">
										<h5 className="card-title">Account Information</h5>
										<ul className="list-unstyled">
											<li className="mb-2">
												<i className="fa fa-envelope mr-2 text-primary"></i>
												<strong>Email:</strong> {user?.email || 'N/A'}
											</li>
											<li className="mb-2">
												<i className="fa fa-shield mr-2 text-success"></i>
												<strong>Role:</strong> {user?.role || 'User'}
											</li>
											<li className="mb-2">
												<i className="fa fa-check-circle mr-2 text-info"></i>
												<strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>

						{/* Dashboard Stats */}
						<div className="row mt-4">
							<div className="col-12">
								<div className="card">
									<div className="card-body">
										<h5 className="card-title mb-3">Dashboard Overview</h5>
										<div className="row text-center">
											<div className="col-6 col-md-3 mb-3">
												<div className="p-3 bg-light rounded">
													<h4 className="text-primary">0</h4>
													<p className="mb-0">Total Orders</p>
												</div>
											</div>
											<div className="col-6 col-md-3 mb-3">
												<div className="p-3 bg-light rounded">
													<h4 className="text-success">0</h4>
													<p className="mb-0">Items in Cart</p>
												</div>
											</div>
											<div className="col-6 col-md-3 mb-3">
												<div className="p-3 bg-light rounded">
													<h4 className="text-info">0</h4>
													<p className="mb-0">Pending Orders</p>
												</div>
											</div>
											<div className="col-6 col-md-3 mb-3">
												<div className="p-3 bg-light rounded">
													<h4 className="text-warning">0</h4>
													<p className="mb-0">Completed Orders</p>
												</div>
											</div>
										</div>
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

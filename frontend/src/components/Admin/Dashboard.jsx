import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MetaData from '../Layouts/MetaData'
import SideBar from './SideBar'

export default function Dashboard() {
	const { user } = useAuth()

	return (
		<>
			<MetaData title="Admin Dashboard" />
			<div className="d-flex">
				{/* Sidebar */}
				<div className="col-md-3 col-lg-2 p-0">
					<SideBar />
				</div>

				{/* Main Content */}
				<div className="col-md-9 col-lg-10 p-0">
					<div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#f8f9fa' }}>
						<div className="row">
							<div className="col-12">
								<div className="d-flex justify-content-between align-items-center mb-4">
									<div>
										<h2 className="text-dark mb-1">Admin Dashboard</h2>
										<p className="text-muted mb-0">Welcome back, {user?.name || user?.email}</p>
									</div>
									<div>
										<Link to="/me" className="btn btn-outline-primary">
											<i className="fa fa-user mr-2"></i>Profile
										</Link>
									</div>
								</div>

								{/* Stats Cards Row */}
								<div className="row mb-4">
									<div className="col-xl-3 col-md-6 mb-4">
										<div className="card border-left-primary shadow h-100 py-2">
											<div className="card-body">
												<div className="row no-gutters align-items-center">
													<div className="col mr-2">
														<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
															Total Orders
														</div>
														<div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
													</div>
													<div className="col-auto">
														<i className="fa fa-shopping-cart fa-2x text-primary"></i>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="col-xl-3 col-md-6 mb-4">
										<div className="card border-left-success shadow h-100 py-2">
											<div className="card-body">
												<div className="row no-gutters align-items-center">
													<div className="col mr-2">
														<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
															Total Products
														</div>
														<div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
													</div>
													<div className="col-auto">
														<i className="fa fa-box fa-2x text-success"></i>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="col-xl-3 col-md-6 mb-4">
										<div className="card border-left-info shadow h-100 py-2">
											<div className="card-body">
												<div className="row no-gutters align-items-center">
													<div className="col mr-2">
														<div className="text-xs font-weight-bold text-info text-uppercase mb-1">
															Total Users
														</div>
														<div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
													</div>
													<div className="col-auto">
														<i className="fa fa-users fa-2x text-info"></i>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="col-xl-3 col-md-6 mb-4">
										<div className="card border-left-warning shadow h-100 py-2">
											<div className="card-body">
												<div className="row no-gutters align-items-center">
													<div className="col mr-2">
														<div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
															Pending Orders
														</div>
														<div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
													</div>
													<div className="col-auto">
														<i className="fa fa-clock fa-2x text-warning"></i>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Management Cards */}
								<div className="row">
									{/* Order Management */}
									<div className="col-12 col-md-6 col-lg-4 mb-4">
										<div className="card shadow h-100">
											<div className="card-body text-center">
												<div className="mb-3">
													<i className="fa fa-shopping-bag fa-3x text-primary"></i>
												</div>
												<h5 className="card-title">Order Management</h5>
												<p className="card-text text-muted">View and manage customer orders, update order status, and track deliveries.</p>
												<Link to="/admin/orders" className="btn btn-primary">
													<i className="fa fa-cog mr-2"></i>Manage Orders
												</Link>
											</div>
										</div>
									</div>

									{/* Product Management */}
									<div className="col-12 col-md-6 col-lg-4 mb-4">
										<div className="card shadow h-100">
											<div className="card-body text-center">
												<div className="mb-3">
													<i className="fa fa-box fa-3x text-success"></i>
												</div>
												<h5 className="card-title">Product Management</h5>
												<p className="card-text text-muted">Create, update, and delete products for your store. Manage inventory and pricing.</p>
												<Link to="/admin/products" className="btn btn-success">
													<i className="fa fa-cog mr-2"></i>Manage Products
												</Link>
											</div>
										</div>
									</div>

									{/* User Management */}
									<div className="col-12 col-md-6 col-lg-4 mb-4">
										<div className="card shadow h-100">
											<div className="card-body text-center">
												<div className="mb-3">
													<i className="fa fa-users fa-3x text-info"></i>
												</div>
												<h5 className="card-title">User Management</h5>
												<p className="card-text text-muted">View and manage user accounts, assign roles, and monitor user activity.</p>
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
				</div>
			</div>
		</>
	)
}

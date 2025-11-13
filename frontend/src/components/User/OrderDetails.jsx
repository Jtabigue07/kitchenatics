import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'
import { toast } from 'react-toastify'
import { getOrderDetailsApi } from '../../utils/api'

export default function OrderDetails() {
	const { token } = useAuth()
	const { orderId } = useParams()
	const navigate = useNavigate()
	const [order, setOrder] = useState(null)
	const [orderLines, setOrderLines] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadOrderDetails()
	}, [orderId])

	const loadOrderDetails = async () => {
		try {
			setLoading(true)
			const response = await getOrderDetailsApi({ token, orderId })
			if (response.success) {
				setOrder(response.order)
				setOrderLines(response.orderLines)
			}
		} catch (error) {
			console.error('Failed to load order details:', error)
			toast.error(error.message || 'Failed to load order details')
			navigate('/orders') // Redirect back to orders if order not found
		} finally {
			setLoading(false)
		}
	}

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case 'pending': return 'badge-warning'
			case 'processing': return 'badge-info'
			case 'shipped': return 'badge-primary'
			case 'delivered': return 'badge-success'
			case 'cancelled': return 'badge-danger'
			default: return 'badge-secondary'
		}
	}

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	if (loading) {
		return (
			<>
				<MetaData title="Order Details" />
				<Header />
				<Loader />
				<Footer />
			</>
		)
	}

	if (!order) {
		return (
			<>
				<MetaData title="Order Not Found" />
				<Header />
				<div className="container my-5">
					<div className="text-center py-5">
						<i className="fa fa-exclamation-triangle fa-4x text-warning mb-3"></i>
						<h3 className="text-muted">Order Not Found</h3>
						<p className="text-muted mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
						<Link to="/orders" className="btn btn-primary">
							<i className="fa fa-arrow-left mr-2"></i>Back to My Orders
						</Link>
					</div>
				</div>
				<Footer />
			</>
		)
	}

	return (
		<>
			<MetaData title={`Order #${order.orderNumber} Details`} />
			<Header />

			<div className="container my-5">
				<div className="row">
					<div className="col-12">
						{/* Back Button */}
						<div className="mb-4">
							<Link to="/orders" className="btn btn-outline-secondary">
								<i className="fa fa-arrow-left mr-2"></i>Back to My Orders
							</Link>
						</div>

						{/* Order Header */}
						<div className="card mb-4">
							<div className="card-header bg-primary text-white">
								<div className="d-flex justify-content-between align-items-center">
									<div>
										<h4 className="mb-1">Order #{order.orderNumber}</h4>
										<small>Placed on {formatDate(order.createdAt)}</small>
									</div>
									<div className="text-right">
										<span className={`badge ${getStatusBadgeClass(order.status)} badge-lg`}>
											{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</span>
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="row">
									<div className="col-md-6">
										<h6>Customer Information</h6>
										<div className="mb-2">
											<strong>Name:</strong> {order.customerDetails?.name}
										</div>
										<div className="mb-2">
											<strong>Email:</strong> {order.customerDetails?.email}
										</div>
										<div className="mb-2">
											<strong>Phone:</strong> {order.customerDetails?.phone || 'Not provided'}
										</div>
										<div className="mb-2">
											<strong>Address:</strong> {order.customerDetails?.address || 'Not provided'}
										</div>
										{order.customerDetails?.zipCode && (
											<div className="mb-2">
												<strong>ZIP Code:</strong> {order.customerDetails.zipCode}
											</div>
										)}
									</div>
									<div className="col-md-6">
										<h6>Order Information</h6>
										<div className="mb-2">
											<strong>Payment Method:</strong> {order.paymentMethod?.replace('_', ' ').toUpperCase()}
										</div>
										<div className="mb-2">
											<strong>Order Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</div>
										{order.notes && (
											<div className="mb-2">
												<strong>Notes:</strong> {order.notes}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Order Items */}
						<div className="card mb-4">
							<div className="card-header">
								<h5 className="mb-0">Order Items</h5>
							</div>
							<div className="card-body">
								<div className="row">
									{orderLines.map((line, index) => (
										<div key={line._id || index} className="col-12 mb-3">
											<div className="d-flex align-items-center border-bottom pb-3">
												<div className="flex-shrink-0 mr-3">
													<img
														src={line.productDetails?.image || line.product?.images?.[0]?.url || '/images/default-product.jpg'}
														alt={line.productDetails?.name || line.product?.name}
														style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
														onError={(e) => {
															e.target.onerror = null
															e.target.src = '/images/default-product.jpg'
														}}
													/>
												</div>
												<div className="flex-grow-1">
													<h6 className="mb-1">{line.productDetails?.name || line.product?.name}</h6>
													<div className="text-muted small mb-2">
														{line.productDetails?.brand && <span>Brand: {line.productDetails.brand} | </span>}
														{line.productDetails?.category && <span>Category: {line.productDetails.category}</span>}
													</div>
													<div className="d-flex justify-content-between align-items-center">
														<div>
															<span className="font-weight-bold">₱{line.price?.toFixed(2)}</span>
															<span className="text-muted ml-2">× {line.quantity}</span>
														</div>
														<div className="font-weight-bold text-primary">
															₱{line.total?.toFixed(2)}
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Order Summary */}
						<div className="card">
							<div className="card-header">
								<h5 className="mb-0">Order Summary</h5>
							</div>
							<div className="card-body">
								<div className="row">
									<div className="col-md-8">
										{/* Empty for now - could add shipping info or other details */}
									</div>
									<div className="col-md-4">
										<div className="border p-3 rounded">
											<div className="d-flex justify-content-between mb-2">
												<span>Subtotal:</span>
												<span>₱{order.subtotal?.toFixed(2)}</span>
											</div>
											<div className="d-flex justify-content-between mb-2">
												<span>Tax (8%):</span>
												<span>₱{order.tax?.toFixed(2)}</span>
											</div>
											<hr className="my-2" />
											<div className="d-flex justify-content-between font-weight-bold h5 mb-0">
												<span>Total:</span>
												<span className="text-primary">₱{order.totalAmount?.toFixed(2)}</span>
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

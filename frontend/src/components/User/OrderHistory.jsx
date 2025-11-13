import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'
import { toast } from 'react-toastify'
import { getUserOrdersApi, downloadReceiptApi, getReceiptStatusApi } from '../../utils/api'

export default function OrderHistory() {
	const { token } = useAuth()
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		hasNext: false,
		hasPrev: false
	})

	useEffect(() => {
		loadOrders(1)
	}, [])

	const loadOrders = async (page = 1) => {
		try {
			setLoading(true)
			const response = await getUserOrdersApi({ token, page })
			if (response.success) {
				setOrders(response.orders)
				setPagination(response.pagination)
			}
		} catch (error) {
			console.error('Failed to load orders:', error)
			toast.error('Failed to load orders')
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
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const handleDownloadReceipt = async (orderId, orderNumber) => {
		try {
			const blob = await downloadReceiptApi({ token, orderId })
			
			// Create download link
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `Receipt-${orderNumber}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
			
			toast.success('Receipt downloaded successfully!')
		} catch (error) {
			console.error('Error downloading receipt:', error)
			toast.error(error.message || 'Failed to download receipt')
		}
	}

	const canDownloadReceipt = (status) => {
		return ['processing', 'shipped', 'delivered'].includes(status)
	}

	if (loading) {
		return (
			<>
				<MetaData title="Order History" />
				<Header />
				<Loader />
				<Footer />
			</>
		)
	}

	return (
		<>
			<MetaData title="Order History" />
			<Header />

			<div className="container my-5">
				<div className="row">
					<div className="col-12">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h1>My Orders</h1>
							<Link to="/products" className="btn btn-primary">
								<i className="fa fa-shopping-bag mr-2"></i>Continue Shopping
							</Link>
						</div>

						{orders.length === 0 ? (
							<div className="text-center py-5">
								<i className="fa fa-shopping-cart fa-4x text-muted mb-3"></i>
								<h3 className="text-muted">No orders yet</h3>
								<p className="text-muted mb-4">Your order history will appear here once you make your first purchase.</p>
								<Link to="/products" className="btn btn-primary btn-lg">
									<i className="fa fa-shopping-bag mr-2"></i>Start Shopping
								</Link>
							</div>
						) : (
							<>
								{/* Orders List */}
								<div className="row">
									{orders.map((order) => (
										<div key={order._id} className="col-12 mb-4">
											<div className="card">
												<div className="card-header">
													<div className="d-flex justify-content-between align-items-center">
														<div>
															<h5 className="mb-1">Order #{order.orderNumber}</h5>
															<small className="text-muted">
																{formatDate(order.createdAt)}
															</small>
														</div>
														<div className="text-right">
															<span className={`badge ${getStatusBadgeClass(order.status)} mb-2`}>
																{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
															</span>
															<div className="h6 mb-0">₱{order.totalAmount?.toFixed(2)}</div>
														</div>
													</div>
												</div>
												<div className="card-body">
													<div className="row">
														<div className="col-md-8">
															<h6>Items Ordered:</h6>
															{order.orderLines?.map((line, index) => (
																<div key={index} className="d-flex align-items-center mb-2">
																	<img
																		src={line.productDetails?.image || '/images/default-product.jpg'}
																		alt={line.productDetails?.name}
																		style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px', marginRight: '10px' }}
																		onError={(e) => {
																			e.target.onerror = null
																			e.target.src = '/images/default-product.jpg'
																		}}
																	/>
																	<div>
																		<div className="font-weight-bold">{line.productDetails?.name}</div>
																		<small className="text-muted">
																			{line.quantity} × ₱{line.price?.toFixed(2)} = ₱{line.total?.toFixed(2)}
																		</small>
																	</div>
																</div>
															))}
														</div>
														<div className="col-md-4">
															<div className="border-left pl-3">
																<h6>Order Summary:</h6>
																<div className="d-flex justify-content-between">
																	<span>Subtotal:</span>
																	<span>₱{order.subtotal?.toFixed(2)}</span>
																</div>
																<div className="d-flex justify-content-between">
																	<span>Tax (8%):</span>
																	<span>₱{order.tax?.toFixed(2)}</span>
																</div>
																<hr className="my-2" />
																<div className="d-flex justify-content-between font-weight-bold">
																	<span>Total:</span>
																	<span>₱{order.totalAmount?.toFixed(2)}</span>
																</div>
																<div className="mt-3">
																	<small className="text-muted">
																		Payment: {order.paymentMethod?.replace('_', ' ').toUpperCase()}
																	</small>
																</div>
																{canDownloadReceipt(order.status) && (
																	<div className="mt-3">
																		<button
																			className="btn btn-success btn-sm"
																			onClick={() => handleDownloadReceipt(order._id, order.orderNumber)}
																		>
																			<i className="fas fa-download me-1"></i>
																			Download Receipt
																		</button>
																	</div>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>

								{/* Pagination */}
								{pagination.totalPages > 1 && (
									<div className="d-flex justify-content-center mt-4">
										<nav>
											<ul className="pagination">
												{pagination.hasPrev && (
													<li className="page-item">
														<button
															className="page-link"
															onClick={() => loadOrders(pagination.currentPage - 1)}
														>
															Previous
														</button>
													</li>
												)}

												{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
													<li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
														<button
															className="page-link"
															onClick={() => loadOrders(page)}
														>
															{page}
														</button>
													</li>
												))}

												{pagination.hasNext && (
													<li className="page-item">
														<button
															className="page-link"
															onClick={() => loadOrders(pagination.currentPage + 1)}
														>
															Next
														</button>
													</li>
												)}
											</ul>
										</nav>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			<Footer />
		</>
	)
}

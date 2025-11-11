import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'
import { toast } from 'react-toastify'

export default function Cart() {
	const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartItemCount } = useCart()
	const [updatingItems, setUpdatingItems] = useState(new Set())

	const handleQuantityChange = async (itemId, newQuantity) => {
		if (newQuantity < 1) return

		setUpdatingItems(prev => new Set(prev).add(itemId))

		try {
			await updateCartItem(itemId, newQuantity)
			toast.success('Cart updated successfully')
		} catch (error) {
			toast.error(error.message || 'Failed to update cart')
		} finally {
			setUpdatingItems(prev => {
				const newSet = new Set(prev)
				newSet.delete(itemId)
				return newSet
			})
		}
	}

	const handleRemoveItem = async (itemId) => {
		try {
			await removeFromCart(itemId)
			toast.success('Item removed from cart')
		} catch (error) {
			toast.error(error.message || 'Failed to remove item')
		}
	}

	const handleClearCart = async () => {
		if (window.confirm('Are you sure you want to clear your cart?')) {
			try {
				await clearCart()
				toast.success('Cart cleared successfully')
			} catch (error) {
				toast.error(error.message || 'Failed to clear cart')
			}
		}
	}

	const calculateSubtotal = () => {
		return cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
	}

	const calculateTax = () => {
		return calculateSubtotal() * 0.08 // 8% tax
	}

	const calculateTotal = () => {
		return calculateSubtotal() + calculateTax()
	}

	if (loading) {
		return (
			<>
				<MetaData title="Shopping Cart" />
				<Header cartItems={cart?.items || []} />
				<Loader />
			</>
		)
	}

	return (
		<>
			<MetaData title="Shopping Cart" />
			<Header cartItems={cart?.items || []} />

			<div className="container my-5">
				<div className="row">
					<div className="col-12">
						<h1 className="mb-4">Shopping Cart</h1>

						{!cart?.items || cart.items.length === 0 ? (
							<div className="text-center py-5">
								<i className="fa fa-shopping-cart fa-4x text-muted mb-3"></i>
								<h3 className="text-muted">Your cart is empty</h3>
								<p className="text-muted mb-4">Add some products to get started!</p>
								<Link to="/products" className="btn btn-primary btn-lg">
									<i className="fa fa-shopping-bag mr-2"></i>Continue Shopping
								</Link>
							</div>
						) : (
							<>
								{/* Cart Items */}
								<div className="card mb-4">
									<div className="card-header">
										<div className="d-flex justify-content-between align-items-center">
											<h5 className="mb-0">Cart Items ({getCartItemCount()})</h5>
											<button
												className="btn btn-outline-danger btn-sm"
												onClick={handleClearCart}
											>
												<i className="fa fa-trash mr-1"></i>Clear Cart
											</button>
										</div>
									</div>
									<div className="card-body p-0">
										{cart.items.map((item) => (
											<div key={item._id} className="border-bottom p-3">
												<div className="row align-items-center">
													<div className="col-md-2">
														<img
															src={item.image || '/images/default-product.jpg'}
															alt={item.name}
															className="img-fluid rounded"
															style={{ maxHeight: '80px', objectFit: 'cover' }}
															onError={(e) => {
																e.target.onerror = null
																e.target.src = '/images/default-product.jpg'
															}}
														/>
													</div>
													<div className="col-md-4">
														<h6 className="mb-1">
															<Link to={`/products/${item.product}`} className="text-decoration-none">
																{item.name}
															</Link>
														</h6>
														<small className="text-muted">
															{item.brand && <span className="badge badge-secondary mr-1">{item.brand}</span>}
															{item.category && <span className="badge badge-info">{item.category}</span>}
														</small>
													</div>
													<div className="col-md-2">
														<div className="d-flex align-items-center">
															<button
																className="btn btn-outline-secondary btn-sm"
																onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
																disabled={updatingItems.has(item._id)}
															>
																-
															</button>
															<span className="mx-3 font-weight-bold">
																{updatingItems.has(item._id) ? (
																	<i className="fa fa-spinner fa-spin"></i>
																) : (
																	item.quantity
																)}
															</span>
															<button
																className="btn btn-outline-secondary btn-sm"
																onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
																disabled={updatingItems.has(item._id)}
															>
																+
															</button>
														</div>
													</div>
													<div className="col-md-2">
														<span className="h6 mb-0">₱{(item.price * item.quantity).toFixed(2)}</span>
														<small className="text-muted d-block">₱{item.price.toFixed(2)} each</small>
													</div>
													<div className="col-md-2">
														<button
															className="btn btn-outline-danger btn-sm"
															onClick={() => handleRemoveItem(item._id)}
														>
															<i className="fa fa-trash"></i>
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Summary */}
								<div className="row">
									<div className="col-md-8">
										<Link to="/products" className="btn btn-outline-primary">
											<i className="fa fa-arrow-left mr-2"></i>Continue Shopping
										</Link>
									</div>
									<div className="col-md-4">
										<div className="card">
											<div className="card-header">
												<h5 className="mb-0">Order Summary</h5>
											</div>
											<div className="card-body">
												<div className="d-flex justify-content-between mb-2">
													<span>Subtotal:</span>
													<span>₱{calculateSubtotal().toFixed(2)}</span>
												</div>
												<div className="d-flex justify-content-between mb-2">
													<span>Tax (8%):</span>
													<span>₱{calculateTax().toFixed(2)}</span>
												</div>
												<hr />
												<div className="d-flex justify-content-between mb-3">
													<strong>Total:</strong>
													<strong>₱{calculateTotal().toFixed(2)}</strong>
												</div>
												<button className="btn btn-success btn-block">
													<i className="fa fa-credit-card mr-2"></i>Proceed to Checkout
												</button>
											</div>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			<Footer />
		</>
	)
}

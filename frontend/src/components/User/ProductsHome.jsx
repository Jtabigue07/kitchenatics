import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProductsApi } from '../../utils/api'
import { useCart } from '../../context/CartContext'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'

export default function ProductsHome() {
	const [searchParams] = useSearchParams()
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState('')
	const { addToCart, loading: cartLoading } = useCart()
	const [addedItems, setAddedItems] = useState(new Set())

	// View mode toggle
	const [viewMode, setViewMode] = useState('pagination') // 'pagination' or 'infinite'

	// Pagination states (for pagination mode)
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalProducts: 0,
		limit: 12
	})

	// Infinite scroll states (for infinite scroll mode)
	const [hasMore, setHasMore] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalProducts, setTotalProducts] = useState(0)
	const observerRef = useRef(null)
	const loadingRef = useRef(null)

	// Filter states
	const [filters, setFilters] = useState({
		keyword: '',
		category: '',
		brand: '',
		type: '',
		minPrice: '',
		maxPrice: ''
	})

	// Available filter options (these would normally come from the API)
	const [filterOptions, setFilterOptions] = useState({
		categories: [],
		brands: [],
		types: []
	})

	// Fetch filter options on mount
	useEffect(() => {
		fetchFilterOptions()
	}, [])

	// Read keyword from URL params on mount
	useEffect(() => {
		const keyword = searchParams.get('keyword') || ''
		if (keyword) {
			setFilters(prev => ({ ...prev, keyword }))
		}
	}, [searchParams])

	// Reset products and pagination when filters change or view mode changes
	useEffect(() => {
		resetProductsAndPagination()
	}, [filters, viewMode])

	// Set up intersection observer for infinite scroll (only when in infinite mode)
	useEffect(() => {
		if (viewMode === 'infinite') {
			const observer = new IntersectionObserver(
				(entries) => {
					const target = entries[0]
					if (target.isIntersecting && hasMore && !loadingMore && !loading) {
						loadMoreProducts()
					}
				},
				{ threshold: 0.1, rootMargin: '100px' }
			)

			if (loadingRef.current) {
				observer.observe(loadingRef.current)
			}

			observerRef.current = observer

			return () => {
				if (observerRef.current) {
					observerRef.current.disconnect()
				}
			}
		}
	}, [hasMore, loadingMore, loading, viewMode])

	const resetProductsAndPagination = () => {
		setProducts([])
		setCurrentPage(1)
		setPagination(prev => ({ ...prev, currentPage: 1 }))
		setHasMore(true)
		setTotalProducts(0)
		fetchProducts(1, true)
	}

	const fetchProducts = async (page = 1, reset = false) => {
		if (reset) {
			setLoading(true)
		} else if (viewMode === 'infinite') {
			setLoadingMore(true)
		}
		setError('')

		try {
			const response = await getProductsApi({
				...filters,
				page,
				limit: 12
			})

			// Handle API response structure
			let productList = []
			if (response.success && response.products) {
				// Backend API response format
				productList = response.products
				setTotalProducts(response.totalProducts || 0)

				if (viewMode === 'pagination') {
					setPagination({
						currentPage: response.currentPage || page,
						totalPages: response.totalPages || 1,
						totalProducts: response.totalProducts || 0,
						limit: 12
					})
				} else {
					// Check if there are more pages for infinite scroll
					const totalPages = response.totalPages || 1
					setHasMore(page < totalPages)
				}
			} else if (Array.isArray(response)) {
				// Direct array response
				productList = response
			} else if (response.products) {
				// Alternative response format
				productList = response.products
			}

			if (reset) {
				setProducts(productList)
			} else {
				setProducts(prev => [...prev, ...productList])
			}
		} catch (err) {
			setError(err?.message || 'Failed to load products')
			if (reset) {
				setProducts([])
			}
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}

	const loadMoreProducts = useCallback(() => {
		if (hasMore && !loadingMore && !loading && viewMode === 'infinite') {
			const nextPage = currentPage + 1
			setCurrentPage(nextPage)
			fetchProducts(nextPage, false)
		}
	}, [currentPage, hasMore, loadingMore, loading, viewMode])

	const fetchFilterOptions = async () => {
		// In a real app, this would fetch from an API endpoint like /products/filters
		// For now, using static options
		setFilterOptions({
			categories: ['Cookware', 'Cutlery', 'Baking Tools', 'Storage', 'Appliances', 'Accessories'],
			brands: ['KitchenPro', 'CulinaryMaster', 'ChefChoice', 'HomeKitchen', 'PremiumCook'],
			types: ['Stainless Steel', 'Cast Iron', 'Non-Stick', 'Ceramic', 'Glass', 'Silicone']
		})
	}

	const handleFilterChange = (filterName, value) => {
		setFilters(prev => ({
			...prev,
			[filterName]: value
		}))
	}

	const clearFilters = () => {
		setFilters({
			keyword: '',
			category: '',
			brand: '',
			type: '',
			minPrice: '',
			maxPrice: ''
		})
	}

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			setPagination(prev => ({ ...prev, currentPage: newPage }))
			fetchProducts(newPage, true)
		}
	}

	const handleViewModeChange = (mode) => {
		setViewMode(mode)
	}

	const handleAddToCart = async (product) => {
		const success = await addToCart(product._id || product.id, 1)
		if (success) {
			// Mark item as added for visual feedback
			setAddedItems(prev => new Set([...prev, product._id || product.id]))
			// Reset after 2 seconds
			setTimeout(() => {
				setAddedItems(prev => {
					const newSet = new Set(prev)
					newSet.delete(product._id || product.id)
					return newSet
				})
			}, 2000)
		}
	}

	const renderPagination = () => {
		if (viewMode !== 'pagination') return null

		const { currentPage, totalPages } = pagination
		if (totalPages <= 1 && products.length === 0) return null

		const pages = []
		const maxVisiblePages = 5
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

		// Adjust start page if we're near the end
		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1)
		}

		// Add pages
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i)
		}

		return (
			<nav aria-label="Product pagination" className="mt-4">
				<ul className="pagination justify-content-center">
					{/* Previous button */}
					<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
						<button
							className="page-link"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
						>
							Previous
						</button>
					</li>

					{/* First page + ellipsis if needed */}
					{startPage > 1 && (
						<>
							<li className="page-item">
								<button className="page-link" onClick={() => handlePageChange(1)}>1</button>
							</li>
							{startPage > 2 && (
								<li className="page-item disabled">
									<span className="page-link">...</span>
								</li>
							)}
						</>
					)}

					{/* Page numbers */}
					{pages.map(page => (
						<li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
							<button className="page-link" onClick={() => handlePageChange(page)}>
								{page}
							</button>
						</li>
					))}

					{/* Last page + ellipsis if needed */}
					{endPage < totalPages && (
						<>
							{endPage < totalPages - 1 && (
								<li className="page-item disabled">
									<span className="page-link">...</span>
								</li>
							)}
							<li className="page-item">
								<button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
							</li>
						</>
					)}

					{/* Next button */}
					<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
						<button
							className="page-link"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</li>
				</ul>
			</nav>
		)
	}

	if (loading && products.length === 0) {
		return (
			<>
				<MetaData title="Products" />
				<Header />
				<Loader />
				<Footer />
			</>
		)
	}

	return (
		<>
			<MetaData title="Products" />
			<Header />
			<div className="container-fluid" style={{ minHeight: '80vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
				<div className="row">
					{/* Filters Sidebar */}
					<div className="col-12 col-md-3 mb-4">
						<div className="card" style={{ position: 'sticky', top: '20px' }}>
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="card-title mb-0">Filters</h5>
									<button
										className="btn btn-sm btn-outline-secondary"
										onClick={clearFilters}
									>
										Clear All
									</button>
								</div>

								{/* Category Filter */}
								<div className="mb-3">
									<label className="form-label"><strong>Category</strong></label>
									<select
										className="form-control"
										value={filters.category}
										onChange={(e) => handleFilterChange('category', e.target.value)}
									>
										<option value="">All Categories</option>
										{filterOptions.categories.map(cat => (
											<option key={cat} value={cat}>{cat}</option>
										))}
									</select>
								</div>

								{/* Brand Filter */}
								<div className="mb-3">
									<label className="form-label"><strong>Brand</strong></label>
									<select
										className="form-control"
										value={filters.brand}
										onChange={(e) => handleFilterChange('brand', e.target.value)}
									>
										<option value="">All Brands</option>
										{filterOptions.brands.map(brand => (
											<option key={brand} value={brand}>{brand}</option>
										))}
									</select>
								</div>

								{/* Type Filter */}
								<div className="mb-3">
									<label className="form-label"><strong>Type</strong></label>
									<select
										className="form-control"
										value={filters.type}
										onChange={(e) => handleFilterChange('type', e.target.value)}
									>
										<option value="">All Types</option>
										{filterOptions.types.map(type => (
											<option key={type} value={type}>{type}</option>
										))}
									</select>
								</div>

								{/* Price Range */}
								<div className="mb-3">
									<label className="form-label"><strong>Price Range</strong></label>
									<div className="row">
										<div className="col-6">
											<input
												type="number"
												className="form-control"
												placeholder="Min"
												value={filters.minPrice}
												onChange={(e) => handleFilterChange('minPrice', e.target.value)}
											/>
										</div>
										<div className="col-6">
											<input
												type="number"
												className="form-control"
												placeholder="Max"
												value={filters.maxPrice}
												onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Products Grid */}
					<div className="col-12 col-md-9">
						{error && (
							<div className="alert alert-warning" role="alert">
								{error}
							</div>
						)}

						<div className="d-flex justify-content-between align-items-center mb-3">
							<h4>Kitchen Essentials</h4>
							<span className="text-muted">
								{totalProducts > 0
									? `${totalProducts} products found${viewMode === 'pagination' ? ` (Page ${pagination.currentPage} of ${pagination.totalPages})` : ''}`
									: 'No products found'
								}
							</span>
						</div>

						{/* View Mode Toggle Buttons */}
						<div className="d-flex justify-content-center mb-3">
							<div className="btn-group btn-group-sm" role="group" aria-label="View mode toggle">
								<button
									type="button"
									className={`btn ${viewMode === 'pagination' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => handleViewModeChange('pagination')}
								>
									<i className="fa fa-list mr-1"></i>
									Pagination
								</button>
								<button
									type="button"
									className={`btn ${viewMode === 'infinite' ? 'btn-primary' : 'btn-outline-primary'}`}
									onClick={() => handleViewModeChange('infinite')}
								>
									<i className="fa fa-arrows-v mr-1"></i>
									Infinite Scroll
								</button>
							</div>
						</div>

						{products.length === 0 && !loading ? (
							<div className="text-center py-5">
								<i className="fa fa-search fa-3x text-muted mb-3"></i>
								<p className="text-muted">No products found. Try adjusting your filters.</p>
							</div>
						) : (
							<>
								<div className="row">
									{products.map(product => {
										const productId = product._id || product.id
										const isAdded = addedItems.has(productId)
										const isLoading = cartLoading

										return (
											<div key={productId} className="col-12 col-sm-6 col-lg-4 mb-4">
												<div className="card h-100 product-card">
													<Link
														to={`/product/${productId}`}
														style={{ textDecoration: 'none', color: 'inherit' }}
													>
														<div style={{
															height: '250px',
															overflow: 'hidden',
															backgroundColor: '#f8f9fa',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}>
															<img
																src={product.images && product.images[0]?.url ? product.images[0].url : 'https://via.placeholder.com/300x250?text=Product'}
																alt={product.name}
																className="card-img-top"
																style={{
																	width: '100%',
																	height: '100% ',
																	objectFit: 'cover',
																	transition: 'transform 0.3s'
																}}
															/>
														</div>
													</Link>
													<div className="card-body d-flex flex-column">
														<Link
															to={`/product/${productId}`}
															style={{ textDecoration: 'none', color: 'inherit' }}
														>
															<h6 className="card-title" style={{ color: '#333', minHeight: '40px', cursor: 'pointer' }}>
																{product.name}
															</h6>
														</Link>
														<p className="text-muted small mb-2" style={{ fontSize: '0.85rem' }}>
															{product.brand && <span className="badge badge-secondary mr-1">{product.brand}</span>}
															{product.category && <span className="badge badge-info">{product.category}</span>}
														</p>
														{product.description && (
															<p className="card-text small text-muted mb-2" style={{
																flex: 1,
																display: '-webkit-box',
																WebkitLineClamp: 2,
																WebkitBoxOrient: 'vertical',
																overflow: 'hidden'
															}}>
																{product.description}
															</p>
														)}
														<div className="mt-auto">
															<div className="d-flex justify-content-between align-items-center mb-2">
																<div>
																	<span className="h5 mb-0 text-primary" style={{ fontWeight: '600' }}>
																		₱{typeof product.price === 'number' ? product.price.toFixed(2) : product.price || '0.00'}
																	</span>
																	{product.originalPrice && product.originalPrice > product.price && (
																		<small className="text-muted ml-2" style={{ textDecoration: 'line-through' }}>
																			₱{typeof product.originalPrice === 'number' ? product.originalPrice.toFixed(2) : product.originalPrice}
																		</small>
																	)}
																</div>
																{product.rating && (
																	<div>
																		<i className="fa fa-star text-warning"></i>
																		<small className="ml-1">{product.rating}</small>
																	</div>
																)}
															</div>
															{/* Stock Information */}
															<div className="mb-2">
																<small className={`text-${(product.stock || 0) > 0 ? 'success' : 'danger'}`}>
																	<i className={`fa fa-${(product.stock || 0) > 0 ? 'check-circle' : 'times-circle'} mr-1`}></i>
																	{(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
																</small>
															</div>
															<button
																className={`btn btn-block ${isAdded ? 'btn-success' : 'btn-primary'}`}
																onClick={(e) => {
																	e.preventDefault()
																	e.stopPropagation()
																	handleAddToCart(product)
																}}
																disabled={isLoading || (product.stock || 0) <= 0}
															>
																<i className="fa fa-shopping-cart mr-2"></i>
																{isLoading ? 'Adding...' : isAdded ? 'Item Added' : (product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
															</button>
														</div>
													</div>
												</div>
											</div>
										)
									})}
								</div>

								{/* Pagination Controls */}
								{renderPagination()}

								{/* Infinite Scroll Loading Indicator */}
								{viewMode === 'infinite' && hasMore && (
									<div
										ref={loadingRef}
										className="text-center py-4"
										style={{ minHeight: '60px' }}
									>
										{loadingMore ? (
											<div>
												<div className="spinner-border spinner-border-sm text-primary" role="status">
													<span className="sr-only">Loading...</span>
												</div>
												<p className="text-muted mt-2">Loading more products...</p>
											</div>
										) : (
											<p className="text-muted">Scroll down to load more products</p>
										)}
									</div>
								)}

								{/* End of Results Message */}
								{viewMode === 'infinite' && !hasMore && products.length > 0 && (
									<div className="text-center py-4">
										<p className="text-muted">You've reached the end of the products list</p>
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

// No mock products — show only real API data or empty state

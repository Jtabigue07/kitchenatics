import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'
import SideBar from './SideBar'
import { toast } from 'react-toastify'
import { getAllOrdersApi, updateOrderStatusApi } from '../../utils/api'
import { DataGrid } from '@mui/x-data-grid'
import { 
	Button, Chip, Box, TextField, Select, MenuItem, 
	FormControl, InputLabel, IconButton, Menu 
} from '@mui/material'
import { MoreVert as MoreIcon, ArrowBack } from '@mui/icons-material'

export default function OrderManagement() {
	const { token } = useAuth()
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const [updatingOrder, setUpdatingOrder] = useState(null)
	const [filters, setFilters] = useState({
		status: 'all',
		search: '',
		page: 1,
		limit: 10
	})
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		hasNext: false,
		hasPrev: false
	})
	const [anchorEl, setAnchorEl] = useState(null)
	const [selectedOrderId, setSelectedOrderId] = useState(null)

	useEffect(() => {
		fetchOrders()
	}, [filters])

	const fetchOrders = async () => {
		try {
			setLoading(true)
			
			if (!token) {
				toast.error('Authentication required. Please login again.')
				return
			}
			
			const response = await getAllOrdersApi({
				token,
				page: filters.page,
				limit: filters.limit,
				status: filters.status,
				search: filters.search
			})
			
			console.log('Orders API response:', response)
			console.log('First order raw data:', response.orders?.[0])

			// Handle different response formats
			let orderList = []
			let paginationData = {
				currentPage: 1,
				totalPages: 1,
				totalOrders: 0,
				hasNext: false,
				hasPrev: false
			}
			
			if (response && response.success) {
				orderList = response.orders || []
				paginationData = response.pagination || paginationData
			} else if (response && response.orders) {
				orderList = response.orders
				paginationData = response.pagination || paginationData
			} else if (Array.isArray(response)) {
				orderList = response
			} else if (response && Array.isArray(response.data)) {
				orderList = response.data
			} else {
				console.warn('Unexpected orders response format:', response)
				orderList = []
			}
			
			setOrders(orderList)
			setPagination(paginationData)
			
			if (orderList.length === 0) {
				console.log('No orders found')
			}
		} catch (error) {
			console.error('Error fetching orders:', error)
			const errorMessage = error?.data?.message || error?.message || 'Failed to load orders'
			toast.error(errorMessage)
			setOrders([])
		} finally {
			setLoading(false)
		}
	}

	const handleStatusUpdate = async (orderId, newStatus) => {
		try {
			setUpdatingOrder(orderId)
			const response = await updateOrderStatusApi({
				token,
				orderId,
				status: newStatus
			})

			if (response.success) {
				toast.success('Order status updated successfully')
				setOrders(orders.map(order =>
					order._id === orderId ? { ...order, status: newStatus } : order
				))
			}
		} catch (error) {
			console.error('Error updating order status:', error)
			toast.error(error.message || 'Failed to update order status')
		} finally {
			setUpdatingOrder(null)
			setAnchorEl(null)
		}
	}

	const handleFilterChange = (key, value) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: key === 'page' ? value : 1
		}))
	}

	const handleMenuOpen = (event, orderId) => {
		setAnchorEl(event.currentTarget)
		setSelectedOrderId(orderId)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
		setSelectedOrderId(null)
	}

	const getStatusColor = (status) => {
		const colors = {
			pending: 'warning',
			processing: 'info',
			shipped: 'primary',
			delivered: 'success',
			cancelled: 'error'
		}
		return colors[status] || 'default'
	}

	const getStatusOptions = (currentStatus) => {
		const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
		return allStatuses.filter(status => status !== currentStatus)
	}

	// Transform orders for DataGrid
	const rows = orders.map((order, index) => {
		const transformedRow = {
			id: order._id || order.id || `temp-order-${index}`,
			orderNumber: order.orderNumber || `ORD-${index + 1}`,
			customerName: order.customerDetails?.name || order.customer?.name || 'N/A',
			customerEmail: order.customerDetails?.email || order.customer?.email || 'N/A',
			itemsCount: order.orderLines?.length || order.items?.length || 0,
			totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0,
			status: order.status || 'pending',
			createdAt: order.createdAt || new Date().toISOString()
		}
		return transformedRow
	})

	const columns = [
		{
			field: 'orderNumber',
			headerName: 'Order ID',
			width: 150,
			renderCell: (params) => (
				<strong style={{ color: '#1976d2' }}>{params.value}</strong>
			)
		},
		{
			field: 'customerName',
			headerName: 'Customer',
			flex: 1,
			minWidth: 150
		},
		{
			field: 'customerEmail',
			headerName: 'Email',
			flex: 1,
			minWidth: 180
		},
		{
			field: 'itemsCount',
			headerName: 'Items',
			width: 90,
			align: 'center',
			headerAlign: 'center'
		},
		{
			field: 'totalAmount',
			headerName: 'Total',
			width: 120,
			renderCell: (params) => {
				const amount = typeof params.value === 'number' ? params.value : parseFloat(params.value) || 0
				return `₱${amount.toFixed(2)}`
			}
		},
		{
			field: 'status',
			headerName: 'Status',
			width: 130,
			renderCell: (params) => (
				<Chip
					label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
					color={getStatusColor(params.value)}
					size="small"
				/>
			)
		},
		{
			field: 'createdAt',
			headerName: 'Date',
			width: 150,
			renderCell: (params) => {
				if (!params.value) return 'No Date'
				try {
					const date = new Date(params.value)
					if (isNaN(date.getTime())) return 'Invalid Date'
					return date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})
				} catch (error) {
					return 'Invalid Date'
				}
			}
		},
		{
			field: 'actions',
			headerName: 'Actions',
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<Box>
					<IconButton
						size="small"
						onClick={(e) => handleMenuOpen(e, params.row.id)}
						disabled={updatingOrder === params.row.id}
					>
						{updatingOrder === params.row.id ? (
							<span className="spinner-border spinner-border-sm" />
						) : (
							<MoreIcon />
						)}
					</IconButton>
				</Box>
			)
		}
	]

	return (
		<>
			<MetaData title="Order Management" />

			<div className="d-flex">
				{/* Sidebar */}
				<div className="col-md-3 col-lg-2 p-0">
					<SideBar />
				</div>

				{/* Main Content */}
				<div className="col-md-9 col-lg-10 p-0">
					<div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#f8f9fa' }}>
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h2>Order Management</h2>
							<Button
								component={Link}
								to="/admin"
								variant="outlined"
								startIcon={<ArrowBack />}
							>
								Back to Dashboard
							</Button>
						</div>

						{/* Filters */}
						<Box sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								<FormControl sx={{ minWidth: 200 }}>
									<InputLabel>Status Filter</InputLabel>
									<Select
										value={filters.status}
										onChange={(e) => handleFilterChange('status', e.target.value)}
										label="Status Filter"
									>
										<MenuItem value="all">All Orders</MenuItem>
										<MenuItem value="pending">Pending</MenuItem>
										<MenuItem value="processing">Processing</MenuItem>
										<MenuItem value="shipped">Shipped</MenuItem>
										<MenuItem value="delivered">Delivered</MenuItem>
										<MenuItem value="cancelled">Cancelled</MenuItem>
									</Select>
								</FormControl>

								<TextField
									label="Search"
									placeholder="Search by order number, customer..."
									value={filters.search}
									onChange={(e) => handleFilterChange('search', e.target.value)}
									sx={{ flexGrow: 1, minWidth: 300 }}
								/>

								<FormControl sx={{ minWidth: 100 }}>
									<InputLabel>Per Page</InputLabel>
									<Select
										value={filters.limit}
										onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
										label="Per Page"
									>
										<MenuItem value={10}>10</MenuItem>
										<MenuItem value={25}>25</MenuItem>
										<MenuItem value={50}>50</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Box>

						{loading ? (
							<Loader />
						) : (
							<Box sx={{ height: 600, width: '100%', backgroundColor: 'white', borderRadius: 2 }}>
								<DataGrid
									rows={rows}
									columns={columns}
									initialState={{
										pagination: {
											paginationModel: { page: 0, pageSize: filters.limit }
										}
									}}
									pageSizeOptions={[10, 25, 50]}
									disableRowSelectionOnClick
									loading={loading}
									getRowId={(row) => row.id}
									localeText={{
										noRowsLabel: 'No orders found. Orders will appear here when customers place them.'
									}}
									sx={{
										'& .MuiDataGrid-cell:focus': {
											outline: 'none'
										},
										'& .MuiDataGrid-row:hover': {
											backgroundColor: 'rgba(0, 0, 0, 0.04)'
										},
										'& .MuiDataGrid-overlay': {
											backgroundColor: 'transparent'
										}
									}}
								/>
							</Box>
						)}

						{/* Status Update Menu */}
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							{selectedOrderId && getStatusOptions(
								orders.find(o => o._id === selectedOrderId)?.status
							).map(status => (
								<MenuItem
									key={status}
									onClick={() => handleStatusUpdate(selectedOrderId, status)}
								>
									Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
								</MenuItem>
							))}
						</Menu>
					</div>
				</div>
			</div>
		</>
	)
}

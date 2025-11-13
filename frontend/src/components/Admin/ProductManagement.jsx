import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import MetaData from '../Layouts/MetaData'
import Loader from '../Layouts/Loader'
import SideBar from './SideBar'
import { DataGrid } from '@mui/x-data-grid'
import { 
	Button, Dialog, DialogTitle, DialogContent, DialogActions, 
	TextField, Select, MenuItem, FormControl, InputLabel, 
	Chip, Avatar, Box, IconButton, Grid 
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'

export default function ProductManagement() {
	const { token } = useAuth()
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingProduct, setEditingProduct] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		originalPrice: '',
		category: '',
		brand: '',
		type: '',
		stock: ''
	})
	const [images, setImages] = useState([])
	const [previewImages, setPreviewImages] = useState([])

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		setLoading(true)
		try {
			if (!token) {
				toast.error('Authentication required. Please login again.')
				return
			}
			
			const response = await getProductsApi({})
			console.log('Products API response:', response)
			console.log('First product raw data:', response.products?.[0])
			
			// Handle different response formats
			let productList = []
			if (response && response.success && response.products) {
				// Backend API response format
				productList = response.products
			} else if (response && response.products) {
				// Alternative response format
				productList = response.products
			} else if (Array.isArray(response)) {
				// Direct array response
				productList = response
			} else if (response && Array.isArray(response.data)) {
				// Another possible format
				productList = response.data
			} else {
				console.warn('Unexpected response format:', response)
				productList = []
			}
			
			setProducts(productList)
			if (productList.length === 0) {
				console.log('No products found')
			}
		} catch (error) {
			console.error('Error fetching products:', error)
			const errorMessage = error?.data?.message || error?.message || 'Failed to load products'
			toast.error(errorMessage)
			setProducts([])
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files)
		setImages(files)
		
		const previews = files.map(file => URL.createObjectURL(file))
		setPreviewImages(previews)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!formData.name || !formData.description || !formData.price || 
			!formData.category || !formData.brand || !formData.type || !formData.stock) {
			toast.error('Please fill in all required fields')
			return
		}

		if (!token) {
			toast.error('Authentication required. Please login again.')
			return
		}

		try {
			if (editingProduct) {
				await updateProductApi({
					token,
					id: editingProduct._id || editingProduct.id,
					productData: formData,
					images: images.length > 0 ? images : undefined
				})
				toast.success('Product updated successfully')
			} else {
				await createProductApi({
					token,
					productData: formData,
					images
				})
				toast.success('Product created successfully')
			}
			
			setShowModal(false)
			resetForm()
			fetchProducts()
		} catch (error) {
			console.error('Product save error:', error)
			const errorMessage = error?.data?.message || error?.message || 'Failed to save product'
			toast.error(errorMessage)
		}
	}

	const handleEdit = (product) => {
		setEditingProduct(product)
		setFormData({
			name: product.name || '',
			description: product.description || '',
			price: product.price || '',
			originalPrice: product.originalPrice || '',
			category: product.category || '',
			brand: product.brand || '',
			type: product.type || '',
			stock: product.stock || ''
		})
		setPreviewImages(product.images?.map(img => img.url) || [])
		setImages([])
		setShowModal(true)
	}

	const handleDelete = async (productId) => {
		if (!window.confirm('Are you sure you want to delete this product?')) {
			return
		}

		try {
			await deleteProductApi({ token, id: productId })
			toast.success('Product deleted successfully')
			fetchProducts()
		} catch (error) {
			toast.error(error?.message || 'Failed to delete product')
		}
	}

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			price: '',
			originalPrice: '',
			category: '',
			brand: '',
			type: '',
			stock: ''
		})
		setImages([])
		setPreviewImages([])
		setEditingProduct(null)
	}

	const openModal = () => {
		resetForm()
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		resetForm()
	}

	// Transform products for DataGrid
	const rows = products.map((product, index) => ({
		id: product._id || product.id || `temp-${index}`,
		name: product.name || 'Unnamed Product',
		category: product.category || 'Uncategorized',
		brand: product.brand || 'Unknown Brand',
		type: product.type || 'Unknown Type',
		price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
		originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice) || 0,
		stock: typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0,
		description: product.description || '',
		imageUrl: product.images && product.images[0]?.url ? product.images[0].url : null,
		images: product.images || []
	}))

	const columns = [
		{
			field: 'imageUrl',
			headerName: 'Image',
			width: 80,
			sortable: false,
			renderCell: (params) => (
				<Avatar
					src={params.value || 'https://via.placeholder.com/50'}
					alt={params.row.name}
					variant="rounded"
					sx={{ width: 50, height: 50 }}
				/>
			)
		},
		{
			field: 'name',
			headerName: 'Product Name',
			flex: 1,
			minWidth: 200
		},
		{
			field: 'category',
			headerName: 'Category',
			width: 130,
			renderCell: (params) => (
				<Chip label={params.value} color="primary" size="small" />
			)
		},
		{
			field: 'brand',
			headerName: 'Brand',
			width: 130
		},
		{
			field: 'price',
			headerName: 'Price',
			width: 100,
			renderCell: (params) => {
				const price = typeof params.value === 'number' ? params.value : parseFloat(params.value) || 0
				return `₱${price.toFixed(2)}`
			}
		},
		{
			field: 'stock',
			headerName: 'Stock',
			width: 90,
			renderCell: (params) => (
				<Chip
					label={params.value}
					color={params.value > 10 ? 'success' : params.value > 0 ? 'warning' : 'error'}
					size="small"
				/>
			)
		},
		{
			field: 'actions',
			headerName: 'Actions',
			width: 120,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 1 }}>
					<IconButton
						size="small"
						color="primary"
						onClick={() => handleEdit(products.find(p => (p._id || p.id) === params.row.id))}
					>
						<EditIcon fontSize="small" />
					</IconButton>
					<IconButton
						size="small"
						color="error"
						onClick={() => handleDelete(params.row.id)}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				</Box>
			)
		}
	]

	if (loading) {
		return (
			<>
				<MetaData title="Product Management" />
				<Loader />
			</>
		)
	}

	return (
		<>
			<MetaData title="Product Management" />

			<div className="d-flex">
				{/* Sidebar */}
				<div className="col-md-3 col-lg-2 p-0">
					<SideBar />
				</div>

				{/* Main Content */}
				<div className="col-md-9 col-lg-10 p-0">
					<div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#f8f9fa' }}>
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h2>Product Management</h2>
							<Button
								variant="contained"
								color="primary"
								startIcon={<AddIcon />}
								onClick={openModal}
							>
								Add New Product
							</Button>
						</div>

						{/* Products DataGrid */}
						<Box sx={{ height: 600, width: '100%', backgroundColor: 'white', borderRadius: 2 }}>
							<DataGrid
								rows={rows}
								columns={columns}
								initialState={{
									pagination: {
										paginationModel: { page: 0, pageSize: 10 }
									}
								}}
								pageSizeOptions={[5, 10, 25, 50]}
								disableRowSelectionOnClick
								loading={loading}
								getRowId={(row) => row.id}
								localeText={{
									noRowsLabel: 'No products found. Create your first product!'
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
					</div>
				</div>
			</div>

			{/* Product Modal with MUI Dialog */}
			<Dialog
				open={showModal}
				onClose={closeModal}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					{editingProduct ? 'Edit Product' : 'Add New Product'}
				</DialogTitle>
				<form onSubmit={handleSubmit}>
					<DialogContent>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Product Name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									required
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="dense" required>
									<InputLabel>Category</InputLabel>
									<Select
										name="category"
										value={formData.category}
										onChange={handleInputChange}
										label="Category"
									>
										<MenuItem value="Cookware">Cookware</MenuItem>
										<MenuItem value="Cutlery">Cutlery</MenuItem>
										<MenuItem value="Baking Tools">Baking Tools</MenuItem>
										<MenuItem value="Storage">Storage</MenuItem>
										<MenuItem value="Appliances">Appliances</MenuItem>
										<MenuItem value="Accessories">Accessories</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Brand"
									name="brand"
									value={formData.brand}
									onChange={handleInputChange}
									required
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="dense" required>
									<InputLabel>Type</InputLabel>
									<Select
										name="type"
										value={formData.type}
										onChange={handleInputChange}
										label="Type"
									>
										<MenuItem value="Stainless Steel">Stainless Steel</MenuItem>
										<MenuItem value="Cast Iron">Cast Iron</MenuItem>
										<MenuItem value="Non-Stick">Non-Stick</MenuItem>
										<MenuItem value="Ceramic">Ceramic</MenuItem>
										<MenuItem value="Glass">Glass</MenuItem>
										<MenuItem value="Silicone">Silicone</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Price"
									name="price"
									type="number"
									inputProps={{ step: '0.01' }}
									value={formData.price}
									onChange={handleInputChange}
									required
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Original Price (Optional)"
									name="originalPrice"
									type="number"
									inputProps={{ step: '0.01' }}
									value={formData.originalPrice}
									onChange={handleInputChange}
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Stock"
									name="stock"
									type="number"
									value={formData.stock}
									onChange={handleInputChange}
									required
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="Description"
									name="description"
									multiline
									rows={4}
									value={formData.description}
									onChange={handleInputChange}
									required
									margin="dense"
								/>
							</Grid>
							<Grid item xs={12}>
								<Button
									variant="outlined"
									component="label"
									fullWidth
								>
									Upload Images
									<input
										type="file"
										hidden
										multiple
										accept="image/*"
										onChange={handleImageChange}
									/>
								</Button>
								{previewImages.length > 0 && (
									<Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
										{previewImages.map((preview, index) => (
											<Avatar
												key={index}
												src={preview}
												alt={`Preview ${index + 1}`}
												variant="rounded"
												sx={{ width: 100, height: 100 }}
											/>
										))}
									</Box>
								)}
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						<Button onClick={closeModal} color="inherit">
							Cancel
						</Button>
						<Button type="submit" variant="contained" color="primary">
							{editingProduct ? 'Update Product' : 'Create Product'}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	)
}

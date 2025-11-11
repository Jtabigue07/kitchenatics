import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'

export default function OrderManagement() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch orders from API
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            // Simulated orders data - replace with actual API call
            const mockOrders = [
                {
                    _id: '1',
                    orderId: 'ORD-001',
                    customer: 'John Doe',
                    email: 'john@example.com',
                    total: 150.00,
                    status: 'pending',
                    createdAt: '2024-01-15T10:30:00Z',
                    items: 3
                },
                {
                    _id: '2',
                    orderId: 'ORD-002',
                    customer: 'Jane Smith',
                    email: 'jane@example.com',
                    total: 89.50,
                    status: 'processing',
                    createdAt: '2024-01-15T14:20:00Z',
                    items: 2
                },
                {
                    _id: '3',
                    orderId: 'ORD-003',
                    customer: 'Bob Johnson',
                    email: 'bob@example.com',
                    total: 245.75,
                    status: 'completed',
                    createdAt: '2024-01-14T09:15:00Z',
                    items: 5
                }
            ]
            
            setOrders(mockOrders)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching orders:', error)
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Update order status - replace with actual API call
            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ))
        } catch (error) {
            console.error('Error updating order status:', error)
        }
    }

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'warning',
            processing: 'info',
            completed: 'success',
            cancelled: 'danger'
        }
        return `badge bg-${statusColors[status] || 'secondary'}`
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

    return (
        <>
            <MetaData title="Order Management" />
            <Header />
            <div className="container-fluid" style={{ minHeight: '80vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2>Order Management</h2>
                            <Link to="/admin" className="btn btn-outline-secondary">
                                <i className="fa fa-arrow-left mr-2"></i>Back to Dashboard
                            </Link>
                        </div>

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Email</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id}>
                                                <td><strong>{order.orderId}</strong></td>
                                                <td>{order.customer}</td>
                                                <td>{order.email}</td>
                                                <td>{order.items}</td>
                                                <td>${order.total.toFixed(2)}</td>
                                                <td>
                                                    <span className={getStatusBadge(order.status)}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary dropdown-toggle" 
                                                            type="button" 
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            Actions
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li>
                                                                <button 
                                                                    className="dropdown-item" 
                                                                    onClick={() => updateOrderStatus(order._id, 'processing')}
                                                                    disabled={order.status === 'processing'}
                                                                >
                                                                    Mark as Processing
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button 
                                                                    className="dropdown-item" 
                                                                    onClick={() => updateOrderStatus(order._id, 'completed')}
                                                                    disabled={order.status === 'completed'}
                                                                >
                                                                    Mark as Completed
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button 
                                                                    className="dropdown-item text-danger" 
                                                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                                                    disabled={order.status === 'cancelled'}
                                                                >
                                                                    Cancel Order
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {orders.length === 0 && (
                                    <div className="text-center py-5">
                                        <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">No orders found</h5>
                                        <p className="text-muted">Orders will appear here when customers place them.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
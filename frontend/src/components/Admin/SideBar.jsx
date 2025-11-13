import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname === path ? 'active' : ''
    }

    return (
        <div className="sidebar-wrapper bg-dark text-white" style={{ minHeight: '100vh', position: 'sticky', top: 0 }}>
            <nav id="sidebar" className="p-3">
                <div className="sidebar-header mb-4">
                    <h4 className="text-center text-white">Admin Panel</h4>
                </div>
                <ul className="list-unstyled components">
                    <li className={`mb-2 ${isActive('/admin')}`}>
                        <Link to="/admin" className="d-flex align-items-center text-white text-decoration-none p-2 rounded">
                            <i className="fa fa-tachometer mr-3"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li className={`mb-2 ${isActive('/admin/products')}`}>
                        <Link to="/admin/products" className="d-flex align-items-center text-white text-decoration-none p-2 rounded">
                            <i className="fa fa-product-hunt mr-3"></i>
                            <span>Products</span>
                        </Link>
                    </li>

                    <li className={`mb-2 ${isActive('/admin/orders')}`}>
                        <Link to="/admin/orders" className="d-flex align-items-center text-white text-decoration-none p-2 rounded">
                            <i className="fa fa-shopping-basket mr-3"></i>
                            <span>Orders</span>
                        </Link>
                    </li>

                    <li className={`mb-2 ${isActive('/admin/users')}`}>
                        <Link to="/admin/users" className="d-flex align-items-center text-white text-decoration-none p-2 rounded">
                            <i className="fa fa-users mr-3"></i>
                            <span>Users</span>
                        </Link>
                    </li>

                    <li className={`mb-2 ${isActive('/admin/reviews')}`}>
                        <Link to="/admin/reviews" className="d-flex align-items-center text-white text-decoration-none p-2 rounded">
                            <i className="fa fa-star mr-3"></i>
                            <span>Reviews</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Sidebar

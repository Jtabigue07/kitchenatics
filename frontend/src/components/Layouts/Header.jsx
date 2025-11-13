import React, { useState, useEffect } from 'react'

import '../../App.css'

import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Search from './Search'
import { getUser, logout } from '../../utils/helpers'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
    const [user, setUser] = useState({})
    const navigate = useNavigate()
    const { getCartItemCount } = useCart()
    const auth = useAuth()

    const logoutHandler = () => {
        logout(navigate('/'));

        toast.success('log out', {
            position: 'bottom-right'
        });
    }

    useEffect(() => {
        setUser(getUser())
    }, [auth.user]);

    return (
        <>
            <nav
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '0.5rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    marginBottom: 0,
                    minHeight: '52px'
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: '120px'
                    }}
                >
                    {user && user.role === 'admin' ? (
                        <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/images/logo.jpg"
                                alt="Kitchenatics Logo"
                                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.jpg' }}
                            />
                        </Link>
                    ) : (
                        <Link to="/products" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/images/logo.jpg"
                                alt="Kitchenatics Logo"
                                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.jpg' }}
                            />
                        </Link>
                    )}
                </div>

                {/* Search Bar (User only) */}
                {user && user.role !== 'admin' && (
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <Search />
                    </div>
                )}

                {/* Right side: User menu & Cart */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        marginLeft: 'auto'
                    }}
                >
                    {user ? (
                        <>
                            {/* User Dropdown */}
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle"
                                    type="button"
                                    id="dropDownMenuButton"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '25px',
                                        padding: '6px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    <img
                                        src={user.avatar && user.avatar.url ? user.avatar.url : '/images/logo.jpg'}
                                        alt={user && user.name ? user.name : 'User'}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            objectFit: 'cover'
                                        }}
                                        loading="lazy"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.jpg' }}
                                    />
                                    <span>{user && user.name ? user.name : 'User'}</span>
                                </button>

                                <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                                    {user && user.role === 'admin' && (
                                        <Link className="dropdown-item" to="/admin">
                                            <i className="fa fa-tachometer mr-2"></i>Dashboard
                                        </Link>
                                    )}
                                    {user && user.role !== 'admin' && (
                                        <Link className="dropdown-item" to="/user/orders">
                                            <i className="fa fa-list-alt mr-2"></i>Orders
                                        </Link>
                                    )}
                                    <Link className="dropdown-item" to="/me">
                                        <i className="fa fa-user mr-2"></i>Profile
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <Link
                                        className="dropdown-item text-danger"
                                        to="/"
                                        onClick={logoutHandler}
                                    >
                                        <i className="fa fa-sign-out mr-2"></i>Logout
                                    </Link>
                                </div>
                            </div>

                            {/* Cart Link (User only) */}
                            {user && user.role !== 'admin' && (
                                <Link
                                    to="/cart"
                                    style={{
                                        textDecoration: 'none',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '14px',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.color = '#f0f0f0' }}
                                    onMouseLeave={(e) => { e.target.style.color = 'white' }}
                                >
                                    <i className="fa fa-shopping-cart"></i>
                                    <span>Cart</span>
                                    {getCartItemCount() > 0 && (
                                        <span
                                            style={{
                                                background: '#ff6b6b',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '2px 6px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                marginLeft: '4px'
                                            }}
                                        >
                                            {getCartItemCount()}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                textDecoration: 'none',
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '25px',
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f8f9fa'
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'white'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                            }}
                        >
                            <i className="fa fa-sign-in"></i>
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </nav>
        </>
    )
}

export default Header

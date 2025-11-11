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
            <nav className="navbar row">
                <div className="col-12 col-md-3">
                    <div className="navbar-brand">
                        <Link to="/products" style={{ textDecoration: 'none' }}>
                            <img
                                src="/images/logo.jpg"
                                alt="Kitchenatics Logo"
                                className="site-logo"
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.jpg' }}
                                style={{ objectFit: 'contain' }}
                            />
                        </Link>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <Search />
                </div>
                <div className="col-12 col-md-3 mt-4 mt-md-0 text-center d-flex align-items-center justify-content-end">
                    {user ? (
                        <div className="d-flex align-items-center">
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle text-white"
                                    type="button"
                                    id="dropDownMenuButton"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '25px',
                                        padding: '8px 15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <figure className="avatar avatar-nav mb-0">
                                        <img
                                            src={user.avatar && user.avatar.url ? user.avatar.url : '/images/logo.jpg'}
                                            alt={user && user.name ? user.name : 'User'}
                                            className="rounded-circle user-avatar"
                                            loading="lazy"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.jpg' }}
                                        />
                                    </figure>
                                    <span>{user && user.name ? user.name : 'User'}</span>
                                </button>

                                <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                                    {user && user.role === 'admin' && (
                                        <Link className="dropdown-item" to="/admin">Dashboard</Link>
                                    )}
                                    <Link className="dropdown-item" to="/orders/me">
                                        <i className="fa fa-list-alt mr-2"></i>Orders
                                    </Link>
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
                            <Link to="/cart" style={{ textDecoration: 'none', marginLeft: '15px' }}>
                                <i className="fa fa-shopping-cart mr-1"></i>
                                <span id="cart">Cart</span>
                                {getCartItemCount() > 0 && (
                                    <span className="ml-1" id="cart_count">{getCartItemCount()}</span>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="btn" id="login_btn">
                            <i className="fa fa-sign-in mr-2"></i>Login
                        </Link>
                    )}
                </div>
            </nav>
        </>
    )
}

export default Header

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { addToCartApi, getCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from '../utils/api'
import { toast } from 'react-toastify'

const CartContext = createContext(null)

export function CartProvider({ children }) {
	const { token, isAuthenticated } = useAuth()
	const [cart, setCart] = useState({ items: [], totalPrice: 0 })
	const [loading, setLoading] = useState(false)

	// Load cart when user logs in
	useEffect(() => {
		if (isAuthenticated && token) {
			loadCart()
		} else {
			setCart({ items: [], totalPrice: 0 })
		}
	}, [isAuthenticated, token])

	const loadCart = useCallback(async () => {
		if (!token) return

		try {
			setLoading(true)
			const response = await getCartApi({ token })
			if (response.success) {
				setCart(response.cart || { items: [], totalPrice: 0 })
			}
		} catch (error) {
			console.error('Failed to load cart:', error)
			setCart({ items: [], totalPrice: 0 })
		} finally {
			setLoading(false)
		}
	}, [token])

	const addToCart = useCallback(async (productId, quantity = 1) => {
		if (!token) {
			toast.error('Please login to add items to cart')
			return false
		}

		try {
			setLoading(true)
			const response = await addToCartApi({ token, productId, quantity })
			if (response.success) {
				setCart(response.cart)
				toast.success('Item added to cart!')
				return true
			}
		} catch (error) {
			console.error('Failed to add to cart:', error)
			toast.error(error.message || 'Failed to add item to cart')
			return false
		} finally {
			setLoading(false)
		}
	}, [token])

	const updateCartItem = useCallback(async (itemId, quantity) => {
		if (!token) return

		try {
			setLoading(true)
			const response = await updateCartItemApi({ token, itemId, quantity })
			if (response.success) {
				setCart(response.cart)
			}
		} catch (error) {
			console.error('Failed to update cart item:', error)
			toast.error('Failed to update item quantity')
		} finally {
			setLoading(false)
		}
	}, [token])

	const removeFromCart = useCallback(async (itemId) => {
		if (!token) return

		try {
			setLoading(true)
			const response = await removeFromCartApi({ token, itemId })
			if (response.success) {
				setCart(response.cart)
				toast.success('Item removed from cart')
			}
		} catch (error) {
			console.error('Failed to remove from cart:', error)
			toast.error('Failed to remove item from cart')
		} finally {
			setLoading(false)
		}
	}, [token])

	const clearCart = useCallback(async () => {
		if (!token) return

		try {
			setLoading(true)
			await clearCartApi({ token })
			setCart({ items: [], totalPrice: 0 })
			toast.success('Cart cleared')
		} catch (error) {
			console.error('Failed to clear cart:', error)
			toast.error('Failed to clear cart')
		} finally {
			setLoading(false)
		}
	}, [token])

	const getCartItemCount = useCallback(() => {
		return cart.items.reduce((total, item) => total + item.quantity, 0)
	}, [cart.items])

	const value = useMemo(() => ({
		cart,
		loading,
		addToCart,
		updateCartItem,
		removeFromCart,
		clearCart,
		loadCart,
		refreshCart: loadCart,
		getCartItemCount
	}), [cart, loading, addToCart, updateCartItem, removeFromCart, clearCart, loadCart, getCartItemCount])

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	)
}

export function useCart() {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
}

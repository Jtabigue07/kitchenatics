# Cart Implementation Plan

## Backend Implementation
- [x] Create Cart model (backend/models/Cart.js)
- [x] Create cartController.js with addToCart, getCart, updateCart, removeFromCart functions
- [x] Create cart routes (backend/routes/cart.js) with POST /cart, GET /cart, PUT /cart/:itemId, DELETE /cart/:itemId
- [x] Update backend/app.js to include cart routes

## Frontend Implementation
- [x] Add cart API functions to frontend/utils/api.js (addToCartApi, getCartApi, updateCartApi, removeFromCartApi)
- [x] Create CartContext (frontend/src/context/CartContext.jsx) for state management
- [x] Update AuthProvider in App.jsx to include CartProvider
- [x] Update ProductsHome.jsx to use cart context and handle add to cart with visual feedback
- [x] Update Header.jsx to use cart context for cart count display
- [ ] Add cart page route and component (optional for full cart view)

## Testing
- [ ] Test add to cart functionality
- [ ] Test cart counter updates
- [ ] Test button state changes

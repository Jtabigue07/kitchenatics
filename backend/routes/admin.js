const express = require('express')
const router = express.Router()
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth')
const { getAllUsers, updateUser } = require('../controllers/userController')

// Admin routes
router.get('/users', isAuthenticated, authorizeRoles('admin'), getAllUsers)
router.put('/user/:id', isAuthenticated, authorizeRoles('admin'), updateUser)

module.exports = router

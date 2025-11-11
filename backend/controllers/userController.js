const User = require('../models/User')

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    console.log('admin.getAllUsers returning', users.map(u => ({ id: u._id.toString(), isActive: u.isActive })))
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Update user role and active status (admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body

    console.log('admin.updateUser called for id=', req.params.id, 'body=', req.body)

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (typeof role !== 'undefined') {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' })
      }
      user.role = role
    }

    if (typeof isActive !== 'undefined') {
      // Handle boolean and string values correctly. "false" should be false, not truthy.
      if (typeof isActive === 'string') {
        user.isActive = isActive.toLowerCase() === 'true'
      } else {
        user.isActive = Boolean(isActive)
      }
      console.log(' -> setting isActive =', user.isActive)
    }

    await user.save()
  console.log('admin.updateUser saved user', { id: user._id.toString(), isActive: user.isActive, role: user.role })

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

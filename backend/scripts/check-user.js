require('dotenv').config({ path: './config/.env' })
const mongoose = require('mongoose')
const User = require('../models/User')

async function run(userId) {
  if (!userId) {
    console.error('Usage: node check-user.js <userId>')
    process.exit(1)
  }

  await mongoose.connect(process.env.DB_URI)
  const user = await User.findById(userId).lean()
  if (!user) {
    console.error('User not found:', userId)
    process.exit(1)
  }

  console.log('User:', {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified
  })

  await mongoose.disconnect()
}

run(process.argv[2]).catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})

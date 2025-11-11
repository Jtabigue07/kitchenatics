require('dotenv').config({ path: './config/.env' })
const mongoose = require('mongoose')
const User = require('../models/User')

async function run(userId, active) {
  if (!userId || typeof active === 'undefined') {
    console.error('Usage: node set-user-active.js <userId> <true|false>')
    process.exit(1)
  }

  await mongoose.connect(process.env.DB_URI)
  const user = await User.findById(userId)
  if (!user) {
    console.error('User not found:', userId)
    process.exit(1)
  }

  user.isActive = (String(active).toLowerCase() === 'true')
  await user.save()
  console.log('Updated user:', { id: user._id.toString(), isActive: user.isActive })

  await mongoose.disconnect()
}

run(process.argv[2], process.argv[3]).catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})

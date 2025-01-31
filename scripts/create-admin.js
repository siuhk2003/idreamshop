const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Use default values if env vars are not set
    const username = process.env.INITIAL_ADMIN_USERNAME || 'admin'
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'admin123'

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      console.log('Admin account already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    console.log('Admin account created successfully')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('Please change these credentials after first login')
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 
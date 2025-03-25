require("dotenv").config()
const mongoose = require("mongoose")
const User = require("../models/User")
const connectDB = require("../config/db")

// Connect to database
connectDB()

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" })

    if (adminExists) {
      console.log("Admin user already exists")
      process.exit(0)
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123456",
      role: "admin",
      institution: "System Administrator",
    })

    console.log("Admin user created successfully:")
    console.log(`Name: ${admin.name}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Password: admin123456`)
    console.log("Please change the password after first login")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdminUser()


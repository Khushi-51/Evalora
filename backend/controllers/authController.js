const User = require("../models/User")
const generateToken = require("../utils/generateToken")
const emailService = require("../utils/emailService")
const crypto = require("crypto")

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password, role, institution } = req.body

    // Check if username is provided
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please add a username",
      })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // For security reasons, only allow student and examiner roles during registration
    // Admins should be created by existing admins
    let userRole = "student"
    if (role === "examiner") {
      userRole = "examiner"
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password,
      role: userRole,
      institution: institution || "",
    })

    // Generate JWT token
    const token = generateToken(user)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = generateToken(user)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updateprofile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, institution, profilePicture } = req.body

    // Only allow updating specific fields
    const updateFields = {}
    if (name) updateFields.name = name
    if (institution) updateFields.institution = institution
    if (profilePicture) updateFields.profilePicture = profilePicture

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Check current password
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Generate new token
    const token = generateToken(user)

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  let user // Declare user here
  try {
    const { email } = req.body

    // Find user by email
    user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")

    // Hash token and save to database
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`

    // Create email message
    const html = `
      <h1>Password Reset</h1>
      <p>You have requested to reset your password.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `

    // Send email
    await emailService.sendEmail({
      to: user.email,
      subject: "Password Reset",
      html,
    })

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    })
  } catch (error) {
    console.error(error)

    // Clean up reset token if email fails
    if (user) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    // Generate new token
    const token = generateToken(user)

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/auth/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      institution,
    })

    res.status(201).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Update user (admin only)
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, institution } = req.body

    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (role) updateFields.role = role
    if (institution) updateFields.institution = institution

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}


//  @desc    Delete user (admin only)
//  @route   DELETE /api/auth/users/:id
//  @access  Private/Admin

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}
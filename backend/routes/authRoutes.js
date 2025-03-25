const express = require("express")
const router = express.Router()
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController")
const { protect, authorize } = require("../middleware/authMiddleware")

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:resettoken", resetPassword)

// Protected routes (all roles)
router.get("/me", protect, getMe)
router.put("/updateprofile", protect, updateProfile)
router.put("/updatepassword", protect, updatePassword)

// Admin only routes
router.get("/users", protect, authorize("admin"), getUsers)
router.post("/users", protect, authorize("admin"), createUser)
router.put("/users/:id", protect, authorize("admin"), updateUser)
router.delete("/users/:id", protect, authorize("admin"), deleteUser)

module.exports = router


const jwt = require("jsonwebtoken")
const keys = require("../config/keys")

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id and role
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    keys.JWT_SECRET,
    {
      expiresIn: keys.JWT_EXPIRE,
    },
  )
}

module.exports = generateToken


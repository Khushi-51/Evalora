// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for developers
  console.error(err)

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`
    error = new Error(message)
    error.statusCode = 404
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = new Error(message)
    error.statusCode = 400
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new Error(message)
    error.statusCode = 400
  }

  // JSON Web Token error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again."
    error = new Error(message)
    error.statusCode = 401
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again."
    error = new Error(message)
    error.statusCode = 401
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  })
}

module.exports = errorHandler


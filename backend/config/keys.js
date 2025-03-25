// Centralized place for all environment variables and configuration
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "secret123456789",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  // Email service configuration
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  // GPT API configuration (for AI grading)
  GPT_API_KEY: process.env.GPT_API_KEY,
  // App configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  SERVER_URL: process.env.SERVER_URL || "http://localhost:5000",
}


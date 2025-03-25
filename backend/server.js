require("dotenv").config()
const express = require("express")
const cors = require("cors")
const http = require("http")
const socketIO = require("socket.io")
const connectDB = require("./config/db")

// Initialize Express app
const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
})

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Socket.io connection
require("./websocket/socket")(io)

// Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/exams", require("./routes/examRoutes"))
app.use("/api/questions", require("./routes/questionRoutes"))
app.use("/api/submissions", require("./routes/submissionRoutes"))
app.use("/api/certificates", require("./routes/certificateRoutes"))

// Root route
app.get("/", (req, res) => {
  res.send("Online Exam & Certification Platform API is running...")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})


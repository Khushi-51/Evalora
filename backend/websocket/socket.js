/**
 * WebSocket configuration for real-time features:
 * - Exam countdown timer synchronization
 * - Proctoring alerts
 * - Live exam monitoring
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`)

    // Join exam room
    socket.on("join-exam", (examId) => {
      socket.join(`exam:${examId}`)
      console.log(`Client ${socket.id} joined exam: ${examId}`)
    })

    // Student started exam
    socket.on("exam-started", ({ examId, userId, timeRemaining }) => {
      // Notify examiners that a student started the exam
      io.to(`examiner:${examId}`).emit("student-started-exam", {
        examId,
        userId,
        timeRemaining,
        timestamp: new Date(),
      })
    })

    // Proctoring alerts
    socket.on("proctoring-alert", ({ examId, userId, alertType, details }) => {
      // Broadcast proctoring alerts to examiners
      io.to(`examiner:${examId}`).emit("proctoring-alert", {
        examId,
        userId,
        alertType,
        details,
        timestamp: new Date(),
      })
    })

    // Examiner joined monitoring
    socket.on("join-monitoring", (examId) => {
      socket.join(`examiner:${examId}`)
      console.log(`Examiner ${socket.id} joined monitoring for exam: ${examId}`)
    })

    // Time sync event (keeps all clients synchronized)
    socket.on("sync-time", ({ examId, userId, timeRemaining }) => {
      // Broadcast remaining time to specific user sessions
      io.to(`exam:${examId}`).emit("time-update", {
        examId,
        userId,
        timeRemaining,
      })
    })

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })
}


import { io } from "socket.io-client"

let socket

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect()
  }

  // Initialize socket connection with auth token
  socket = io(process.env.REACT_APP_SOCKET_URL || "", {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  })

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id)
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected")
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  return socket
}

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token")
    if (token) {
      return initSocket(token)
    }
    return null
  }
  return socket
}

export const joinExam = (examId) => {
  const socket = getSocket()
  if (socket) {
    socket.emit("join-exam", examId)
  }
}

export const startExam = (examId, userId, timeRemaining) => {
  const socket = getSocket()
  if (socket) {
    socket.emit("exam-started", { examId, userId, timeRemaining })
  }
}

export const syncTime = (examId, userId, timeRemaining) => {
  const socket = getSocket()
  if (socket) {
    socket.emit("sync-time", { examId, userId, timeRemaining })
  }
}

export const sendProctoringAlert = (examId, userId, alertType, details) => {
  const socket = getSocket()
  if (socket) {
    socket.emit("proctoring-alert", { examId, userId, alertType, details })
  }
}

export const joinMonitoring = (examId) => {
  const socket = getSocket()
  if (socket) {
    socket.emit("join-monitoring", examId)
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default {
  initSocket,
  getSocket,
  joinExam,
  startExam,
  syncTime,
  sendProctoringAlert,
  joinMonitoring,
  disconnectSocket,
}


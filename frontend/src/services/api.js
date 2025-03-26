import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "https://evalora-1.onrender.com/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("https://evalora-1.onrender.com/auth/register", userData),
  login: (credentials) => api.post("https://evalora-1.onrender.com/auth/login", credentials),
  getProfile: () => api.get("https://evalora-1.onrender.com/auth/me"),
  updateProfile: (userData) => api.put("https://evalora-1.onrender.com/auth/updateprofile", userData),
  updatePassword: (passwordData) => api.put("https://evalora-1.onrender.com/auth/updatepassword", passwordData),
  forgotPassword: (email) => api.post("https://evalora-1.onrender.com/auth/forgotpassword", { email }),
  resetPassword: (token, password) => api.put(`https://evalora-1.onrender.com/auth/resetpassword/${token}`, { password }),
  // Admin only
  getUsers: () => api.get("https://evalora-1.onrender.com/auth/users"),
  createUser: (userData) => api.post("https://evalora-1.onrender.com/auth/users", userData),
  updateUser: (id, userData) => api.put(`https://evalora-1.onrender.com/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`https://evalora-1.onrender.com/auth/users/${id}`),
}

// Exams API
export const examsAPI = {
  getExams: () => api.get("https://evalora-1.onrender.com/exams"),
  getExam: (id) => api.get(`https://evalora-1.onrender.com/exams/${id}`),
  createExam: (examData) => api.post("https://evalora-1.onrender.com/exams", examData),
  updateExam: (id, examData) => api.put(`https://evalora-1.onrender.com/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`https://evalora-1.onrender.com/exams/${id}`),
  publishExam: (id) => api.put(`https://evalora-1.onrender.com/exams/${id}/publish`),
  archiveExam: (id) => api.put(`https://evalora-1.onrender.com/exams/${id}/archive`),
  getAvailableExams: () => api.get("https://evalora-1.onrender.com/exams/available"),
  getUpcomingExams: () => api.get("https://evalora-1.onrender.com/exams/upcoming"),
  getPastExams: () => api.get("https://evalora-1.onrender.com/exams/past"),
}

// Questions API
export const questionsAPI = {
  getQuestions: () => api.get("https://evalora-1.onrender.com/questions"),
  getQuestion: (id) => api.get(`https://evalora-1.onrender.com/questions/${id}`),
  createQuestion: (questionData) => api.post("https://evalora-1.onrender.com/questions", questionData),
  updateQuestion: (id, questionData) => api.put(`https://evalora-1.onrender.com/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`https://evalora-1.onrender.com/questions/${id}`),
  getExamQuestions: (examId) => api.get(`https://evalora-1.onrender.com/questions/exam/${examId}`),
}

// Submissions API
export const submissionsAPI = {
  getSubmissions: () => api.get("https://evalora-1.onrender.com/submissions"),
  getSubmission: (id) => api.get(`https://evalora-1.onrender.com/submissions/${id}`),
  createSubmission: (submissionData) => api.post("https://evalora-1.onrender.com/submissions", submissionData),
  updateSubmission: (id, submissionData) => api.put(`https://evalora-1.onrender.com/submissions/${id}`, submissionData),
  submitExam: (id) => api.put(`https://evalora-1.onrender.com/submissions/${id}/submit`),
  gradeSubmission: (id, gradingData) => api.put(`https://evalora-1.onrender.com/submissions/${id}/grade`, gradingData),
  getUserSubmissions: () => api.get("https://evalora-1.onrender.com/submissions/user"),
  getExamSubmissions: (examId) => api.get(`https://evalora-1.onrender.com/submissions/exam/${examId}`),
  saveAnswer: (submissionId, answerData) => api.post(`https://evalora-1.onrender.com/submissions/${submissionId}/answer`, answerData),
}

// Certificates API
export const certificatesAPI = {
  getCertificates: () => api.get("https://evalora-1.onrender.com/certificates"),
  getCertificate: (id) => api.get(`https://evalora-1.onrender.com/certificates/${id}`),
  generateCertificate: (data) => api.post("https://evalora-1.onrender.com/certificates", data),
  verifyCertificate: (certificateNumber) => api.get(`https://evalora-1.onrender.com/certificates/verify/${certificateNumber}`),
  getUserCertificates: () => api.get("https://evalora-1.onrender.com/certificates/user"),
  downloadCertificate: (id) => api.get(`https://evalora-1.onrender.com/certificates/${id}/download`, { responseType: "blob" }),
}

export default api


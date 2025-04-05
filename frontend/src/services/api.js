import axios from "axios"

const BASE_URL = "https://evalora-1.onrender.com"

// Create axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // Fix: Use template literal
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
  }
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
      window.location.href = `${BASE_URL}/login`
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/updateprofile", userData),
  updatePassword: (passwordData) => api.put("/auth/updatepassword", passwordData),
  forgotPassword: (email) => api.post("/auth/forgotpassword", { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  // Admin only
  getUsers: () => api.get("/auth/users"),
  createUser: (userData) => api.post("/auth/users", userData),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
}

// Exams API
export const examsAPI = {
  getExams: () => api.get("/exams"),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post("/exams", examData),
  updateExam: (id, examData) => api.put(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  publishExam: (id) => api.put(`/exams/${id}/publish`),
  archiveExam: (id) => api.put(`/exams/${id}/archive`),
  getAvailableExams: () => api.get("/exams/available"),
  getUpcomingExams: () => api.get("/exams/upcoming"),
  getPastExams: () => api.get("/exams/past"),
}

// Questions API
export const questionsAPI = {
  getQuestions: () => api.get("/questions"),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (questionData) => api.post("/questions", questionData),
  updateQuestion: (id, questionData) => api.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getExamQuestions: (examId) => api.get(`/questions/exam/${examId}`),
}

// Submissions API
export const submissionsAPI = {
  getSubmissions: () => api.get("/submissions"),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  createSubmission: (submissionData) => api.post("/submissions", submissionData),
  updateSubmission: (id, submissionData) => api.put(`/submissions/${id}`, submissionData),
  submitExam: (id) => api.put(`/submissions/${id}/submit`),
  gradeSubmission: (id, gradingData) => api.put(`/submissions/${id}/grade`, gradingData),
  getUserSubmissions: () => api.get("/submissions/user"),
  getExamSubmissions: (examId) => api.get(`/submissions/exam/${examId}`),
  saveAnswer: (submissionId, answerData) => api.post(`/submissions/${submissionId}/answer`, answerData),
}

// Certificates API
export const certificatesAPI = {
  getCertificates: () => api.get("/certificates"),
  getCertificate: (id) => api.get(`/certificates/${id}`),
  generateCertificate: (data) => api.post("/certificates", data),
  verifyCertificate: (certificateNumber) => api.get(`/certificates/verify/${certificateNumber}`),
  getUserCertificates: () => api.get("/certificates/user"),
  downloadCertificate: (id) => api.get(`/certificates/${id}/download`, { responseType: "blob" }),
}

export default api
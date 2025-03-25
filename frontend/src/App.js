import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./styles/main.css"

// Context Providers
import { AuthProvider } from "./context/AuthContext"

// Layout Components
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import PrivateRoute from "./components/routing/PrivateRoute"
import AdminRoute from "./components/routing/AdminRoute"
import ExaminerRoute from "./components/routing/ExaminerRoute"

// Auth Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import RoleBasedRedirect from "./pages/auth/RoleBasedRedirect"

// Student Pages
import Dashboard from "./pages/student/Dashboard"
import AvailableExams from "./pages/student/AvailableExams"
import ExamDetails from "./pages/student/ExamDetails"
import TakeExam from "./pages/student/TakeExam"
import ExamResults from "./pages/student/ExamResults"
import Certificates from "./pages/student/Certificates"
import CertificateView from "./pages/student/CertificateView"
import Profile from "./pages/student/Profile"

// Examiner Pages
import ExaminerDashboard from "./pages/examiner/Dashboard"
import ExamManagement from "./pages/examiner/ExamManagement"
import CreateExam from "./pages/examiner/CreateExam"
import EditExam from "./pages/examiner/EditExam"
import QuestionBank from "./pages/examiner/QuestionBank"
import CreateQuestion from "./pages/examiner/CreateQuestion"
import EditQuestion from "./pages/examiner/EditQuestion"
import SubmissionReview from "./pages/examiner/SubmissionReview"
import GradeSubmission from "./pages/examiner/GradeSubmission"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import UserManagement from "./pages/admin/UserManagement"
import CreateUser from "./pages/admin/CreateUser"
import EditUser from "./pages/admin/EditUser"
import SystemSettings from "./pages/admin/SystemSettings"

// Error Pages
import NotFound from "./pages/errors/NotFound"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <PrivateRoute>
                    <AvailableExams />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams/:id"
                element={
                  <PrivateRoute>
                    <ExamDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams/:id/take"
                element={
                  <PrivateRoute>
                    <TakeExam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <PrivateRoute>
                    <ExamResults />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <PrivateRoute>
                    <Certificates />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates/:id"
                element={
                  <PrivateRoute>
                    <CertificateView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Examiner Routes */}
              <Route
                path="/examiner"
                element={
                  <ExaminerRoute>
                    <ExaminerDashboard />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/exams"
                element={
                  <ExaminerRoute>
                    <ExamManagement />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/exams/create"
                element={
                  <ExaminerRoute>
                    <CreateExam />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/exams/:id/edit"
                element={
                  <ExaminerRoute>
                    <EditExam />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/questions"
                element={
                  <ExaminerRoute>
                    <QuestionBank />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/questions/create"
                element={
                  <ExaminerRoute>
                    <CreateQuestion />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/questions/:id/edit"
                element={
                  <ExaminerRoute>
                    <EditQuestion />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/submissions"
                element={
                  <ExaminerRoute>
                    <SubmissionReview />
                  </ExaminerRoute>
                }
              />
              <Route
                path="/examiner/submissions/:id/grade"
                element={
                  <ExaminerRoute>
                    <GradeSubmission />
                  </ExaminerRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/create"
                element={
                  <AdminRoute>
                    <CreateUser />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/:id/edit"
                element={
                  <AdminRoute>
                    <EditUser />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <SystemSettings />
                  </AdminRoute>
                }
              />

              {/* Error Routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App


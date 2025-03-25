"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const { login, isAuthenticated, loading, user, isAdmin, isExaminer } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (isAdmin) {
        navigate("/admin")
      } else if (isExaminer) {
        navigate("/examiner")
      } else {
        navigate("/dashboard")
      }
    }
  }, [isAuthenticated, navigate, user, isAdmin, isExaminer])

  const { email, password } = formData

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await login({ email, password })
      toast.success("Login successful")
      // Redirection is handled in the useEffect
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="auth-title">Login to Your Account</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
            />
            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
            />
            {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="mt-3 text-center">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default Login


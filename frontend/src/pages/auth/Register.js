"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "", // Add username field
    password: "",
    confirmPassword: "",
    role: "student", // Default role
  })
  const [formErrors, setFormErrors] = useState({})
  const { register, isAuthenticated, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const { name, email, username, password, confirmPassword, role } = formData

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!name) errors.name = "Name is required"
    if (!email) errors.email = "Email is required"
    if (!username) errors.username = "Username is required" // Validate username
    if (!password) errors.password = "Password is required"
    if (password.length < 6) errors.password = "Password must be at least 6 characters"
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await register({ name, email, username, password, role }) // Include username
      toast.success("Registration successful")
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed")
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
            />
            {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
          </div>
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Enter your username"
            />
            {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${formErrors.confirmPassword ? "is-invalid" : ""}`}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
            />
            {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              className={`form-control ${formErrors.role ? "is-invalid" : ""}`}
              id="role"
              name="role"
              value={role}
              onChange={onChange}
            >
              <option value="student">Student</option>
              <option value="examiner">Examiner</option>
              <option value="admin">Admin</option>
            </select>
            {formErrors.role && <div className="invalid-feedback">{formErrors.role}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
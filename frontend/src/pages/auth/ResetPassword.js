"use client"

import { useState, useContext } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [resetSuccess, setResetSuccess] = useState(false)
  const { resetPassword, loading } = useContext(AuthContext)
  const { token } = useParams()
  const navigate = useNavigate()

  const { password, confirmPassword } = formData

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
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
      await resetPassword(token, password)
      setResetSuccess(true)
      toast.success("Password reset successful")
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed")
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="auth-title">Reset Password</h2>

        {resetSuccess ? (
          <div className="text-center">
            <div className="alert alert-success">Your password has been reset successfully!</div>
            <p>You will be redirected to the login page in a few seconds.</p>
            <div className="mt-3">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center mb-4">Enter your new password below.</p>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Enter new password"
                />
                {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  className={`form-control ${formErrors.confirmPassword ? "is-invalid" : ""}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  placeholder="Confirm new password"
                />
                {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <div className="mt-3 text-center">
              <Link to="/login">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPassword


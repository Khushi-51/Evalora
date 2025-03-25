"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [formError, setFormError] = useState("")
  const { forgotPassword, loading } = useContext(AuthContext)

  const onChange = (e) => {
    setEmail(e.target.value)
    setFormError("")
  }

  const validateForm = () => {
    if (!email) {
      setFormError("Email is required")
      return false
    }
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await forgotPassword(email)
      setEmailSent(true)
      toast.success("Password reset email sent")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email")
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="auth-title">Forgot Password</h2>

        {emailSent ? (
          <div className="text-center">
            <div className="alert alert-success">Password reset instructions have been sent to your email.</div>
            <p>Please check your inbox and follow the instructions to reset your password.</p>
            <div className="mt-3">
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center mb-4">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${formError ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="Enter your email"
                />
                {formError && <div className="invalid-feedback">{formError}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword


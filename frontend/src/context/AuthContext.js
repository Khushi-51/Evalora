"use client"

import { createContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"
import { useNavigate } from "react-router-dom"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile()
          setUser(res.data.data)
        } catch (err) {
          console.error("Failed to load user:", err)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  // Register user
  const register = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.register(userData)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      setToken(res.data.token)
      setUser(res.data.user)
      setLoading(false)

      // Redirect based on role
      if (res.data.user.role === "admin") {
        navigate("/admin")
      } else if (res.data.user.role === "examiner") {
        navigate("/examiner")
      } else {
        navigate("/dashboard")
      }

      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.login(credentials)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      setToken(res.data.token)
      setUser(res.data.user)
      setLoading(false)

      // Redirect based on role
      if (res.data.user.role === "admin") {
        navigate("/admin")
      } else if (res.data.user.role === "examiner") {
        navigate("/examiner")
      } else {
        navigate("/dashboard")
      }

      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    navigate("/login")
  }

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.updateProfile(userData)
      setUser(res.data.data)
      localStorage.setItem("user", JSON.stringify(res.data.data))
      setLoading(false)
      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Failed to update profile")
      throw err
    }
  }

  // Update password
  const updatePassword = async (passwordData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.updatePassword(passwordData)
      // If token is returned, update it
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
        setToken(res.data.token)
      }
      setLoading(false)
      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Failed to update password")
      throw err
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.forgotPassword(email)
      setLoading(false)
      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Failed to process forgot password request")
      throw err
    }
  }

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.resetPassword(token, password)
      setLoading(false)
      return res.data
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Failed to reset password")
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        isExaminer: user?.role === "examiner",
        isStudent: user?.role === "student",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext


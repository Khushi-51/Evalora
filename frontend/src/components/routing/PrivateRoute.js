"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import Loader from "../common/Loader"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext)

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Redirect admin and examiner to their respective dashboards
  if (user && user.role === "admin") {
    return <Navigate to="/admin" />
  }

  if (user && user.role === "examiner") {
    return <Navigate to="/examiner" />
  }

  return children
}

export default PrivateRoute


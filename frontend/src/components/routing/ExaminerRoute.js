"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import Loader from "../common/Loader"

const ExaminerRoute = ({ children }) => {
  const { isAuthenticated, isExaminer, isAdmin, loading } = useContext(AuthContext)

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Allow both examiners and admins to access examiner routes
  return isExaminer || isAdmin ? children : <Navigate to="/dashboard" />
}

export default ExaminerRoute


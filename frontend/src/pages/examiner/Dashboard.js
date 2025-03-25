"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI, submissionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"

const ExaminerDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    pendingGrading: 0,
    totalSubmissions: 0,
  })
  const [recentExams, setRecentExams] = useState([])
  const [pendingSubmissions, setPendingSubmissions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch exams created by the examiner
      const examsResponse = await examsAPI.getExams()
      const exams = examsResponse.data.data || []

      // Fetch submissions that need grading
      const submissionsResponse = await submissionsAPI.getSubmissions()
      const submissions = submissionsResponse.data.data || []

      // Calculate stats
      const activeExams = exams.filter((exam) => exam.status === "published").length
      const pendingGrading = submissions.filter(
        (sub) => sub.submissionStatus === "submitted_for_review" || sub.submissionStatus === "under_review",
      ).length

      setStats({
        totalExams: exams.length,
        activeExams,
        pendingGrading,
        totalSubmissions: submissions.length,
      })

      // Get recent exams
      const sortedExams = [...exams].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      setRecentExams(sortedExams)

      // Get pending submissions
      const pendingSubs = submissions.filter((sub) => sub.submissionStatus === "submitted_for_review").slice(0, 5)
      setPendingSubmissions(pendingSubs)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Examiner Dashboard</h1>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Total Exams</h5>
              <h2 className="display-4">{stats.totalExams}</h2>
              <Link to="/examiner/exams" className="btn btn-sm btn-outline-primary mt-2">
                View All
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Active Exams</h5>
              <h2 className="display-4">{stats.activeExams}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Pending Grading</h5>
              <h2 className="display-4">{stats.pendingGrading}</h2>
              <Link to="/examiner/submissions" className="btn btn-sm btn-outline-primary mt-2">
                Grade Now
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Total Submissions</h5>
              <h2 className="display-4">{stats.totalSubmissions}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Quick Actions</h5>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/examiner/exams/create" className="btn btn-primary">
              Create New Exam
            </Link>
            <Link to="/examiner/questions/create" className="btn btn-secondary">
              Add New Question
            </Link>
            <Link to="/examiner/submissions" className="btn btn-info">
              Review Submissions
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Exams */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title">Recent Exams</h5>
                <Link to="/examiner/exams" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>

              {recentExams.length > 0 ? (
                <div className="list-group">
                  {recentExams.map((exam) => (
                    <Link
                      key={exam._id}
                      to={`/examiner/exams/${exam._id}/edit`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{exam.title}</h6>
                        <span
                          className={`badge ${
                            exam.status === "published"
                              ? "bg-success"
                              : exam.status === "draft"
                                ? "bg-secondary"
                                : "bg-danger"
                          }`}
                        >
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </div>
                      <p className="mb-1">{exam.description.substring(0, 100)}...</p>
                      <small>Created on {formatDate(exam.createdAt)}</small>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center">No exams created yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title">Pending Submissions</h5>
                <Link to="/examiner/submissions" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>

              {pendingSubmissions.length > 0 ? (
                <div className="list-group">
                  {pendingSubmissions.map((submission) => (
                    <Link
                      key={submission._id}
                      to={`/examiner/submissions/${submission._id}/grade`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{submission.exam.title}</h6>
                        <small>{formatDate(submission.endTime || submission.startTime)}</small>
                      </div>
                      <p className="mb-1">Student: {submission.student.name}</p>
                      <small>Status: {submission.submissionStatus.replace(/_/g, " ").toUpperCase()}</small>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center">No pending submissions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExaminerDashboard


"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { submissionsAPI, examsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"

const SubmissionReview = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("all")
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState("all")

  useEffect(() => {
    fetchExams()
    fetchSubmissions()
  }, [filter, selectedExam, currentPage])

  const fetchExams = async () => {
    try {
      const response = await examsAPI.getExams()
      setExams(response.data.data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast.error("Failed to load exams")
    }
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await submissionsAPI.getSubmissions()
      let filteredSubmissions = response.data.data || []

      // Apply status filter
      if (filter !== "all") {
        filteredSubmissions = filteredSubmissions.filter((sub) => sub.submissionStatus === filter)
      }

      // Apply exam filter
      if (selectedExam !== "all") {
        filteredSubmissions = filteredSubmissions.filter((sub) => sub.exam._id === selectedExam)
      }

      setSubmissions(filteredSubmissions)
      setTotalPages(Math.ceil(filteredSubmissions.length / 10))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast.error("Failed to load submissions")
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "in_progress":
        return "bg-warning"
      case "completed":
        return "bg-success"
      case "timed_out":
        return "bg-danger"
      case "submitted_for_review":
        return "bg-info"
      case "graded":
        return "bg-primary"
      case "under_review":
        return "bg-secondary"
      default:
        return "bg-secondary"
    }
  }

  // Get current submissions for pagination
  const indexOfLastSubmission = currentPage * 10
  const indexOfFirstSubmission = indexOfLastSubmission - 10
  const currentSubmissions = submissions.slice(indexOfFirstSubmission, indexOfLastSubmission)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Submission Review</h1>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="statusFilter" className="form-label">
                Filter by Status
              </label>
              <select id="statusFilter" className="form-select" value={filter} onChange={handleFilterChange}>
                <option value="all">All Submissions</option>
                <option value="submitted_for_review">Pending Review</option>
                <option value="under_review">Under Review</option>
                <option value="graded">Graded</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="timed_out">Timed Out</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="examFilter" className="form-label">
                Filter by Exam
              </label>
              <select id="examFilter" className="form-select" value={selectedExam} onChange={handleExamChange}>
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No submissions found</h3>
          <p>There are no submissions matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>{submission.student.name}</td>
                    <td>{submission.exam.title}</td>
                    <td>{formatDate(submission.endTime || submission.startTime)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(submission.submissionStatus)}`}>
                        {submission.submissionStatus.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {submission.isCompleted ? (
                        <span>
                          {submission.totalScore} / {submission.exam.totalMarks} (
                          {Math.round((submission.totalScore / submission.exam.totalMarks) * 100)}%)
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {submission.submissionStatus === "submitted_for_review" ? (
                        <Link to={`/examiner/submissions/${submission._id}/grade`} className="btn btn-primary btn-sm">
                          Grade
                        </Link>
                      ) : (
                        <Link to={`/examiner/submissions/${submission._id}/grade`} className="btn btn-info btn-sm">
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}

export default SubmissionReview


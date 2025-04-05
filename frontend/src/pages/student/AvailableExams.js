"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import "../../styles/globals.css";

const AvailableExams = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("available") // available, upcoming, past

  useEffect(() => {
    fetchExams()
  }, [filter])

  const fetchExams = async () => {
    setLoading(true)
    try {
      let response

      switch (filter) {
        case "upcoming":
          response = await examsAPI.getUpcomingExams()
          break
        case "past":
          response = await examsAPI.getPastExams()
          break
        case "available":
        default:
          response = await examsAPI.getAvailableExams()
          break
      }

      setExams(response.data.data || [])
      setTotalPages(Math.ceil((response.data.count || 0) / 10))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast.error("Failed to load exams")
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // In a real implementation, you would pass the page to the API call
    // For now, we'll just simulate pagination on the client side
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours > 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ""}`
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Exams</h1>
        <div>
          <select className="form-control" value={filter} onChange={handleFilterChange}>
            <option value="available">Available Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No exams found</h3>
          <p>There are no {filter} exams at the moment.</p>
        </div>
      ) : (
        <div className="exam-list">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-header">
                <h3 className="exam-title">{exam.title}</h3>
                <span className="exam-category">{exam.category}</span>
              </div>
              <div className="exam-info">
                <div className="exam-info-item">
                  <i className="exam-info-icon">📅</i>
                  <span>Start: {formatDate(exam.startDate)}</span>
                </div>
                <div className="exam-info-item">
                  <i className="exam-info-icon">⏱️</i>
                  <span>Duration: {formatDuration(exam.duration)}</span>
                </div>
                <div className="exam-info-item">
                  <i className="exam-info-icon">📝</i>
                  <span>Questions: {exam.questions.length}</span>
                </div>
                <div className="exam-info-item">
                  <i className="exam-info-icon">🎯</i>
                  <span>Passing Score: {exam.passingScore}%</span>
                </div>
              </div>
              <p className="exam-description">{exam.description}</p>
              <div className="exam-footer">
                <span className={`exam-status status-${exam.status}`}>
                  {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
                <Link to={`/exams/${exam._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}

export default AvailableExams


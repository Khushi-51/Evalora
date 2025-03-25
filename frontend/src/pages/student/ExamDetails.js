"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI, submissionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Modal from "../../components/common/Modal"

const ExamDetails = () => {
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [previousAttempts, setPreviousAttempts] = useState([])
  const [canTakeExam, setCanTakeExam] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchExamDetails()
  }, [id])

  const fetchExamDetails = async () => {
    setLoading(true)
    try {
      // Fetch exam details
      const examResponse = await examsAPI.getExam(id)
      setExam(examResponse.data.data)

      // Fetch previous attempts
      const submissionsResponse = await submissionsAPI.getExamSubmissions(id)
      const userSubmissions = submissionsResponse.data.data || []
      setPreviousAttempts(userSubmissions)

      // Check if user can take the exam
      const completedAttempts = userSubmissions.filter((sub) => sub.isCompleted).length
      const maxAttempts = examResponse.data.data.allowReattempt ? examResponse.data.data.reattemptCount + 1 : 1

      setCanTakeExam(completedAttempts < maxAttempts)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching exam details:", error)
      toast.error("Failed to load exam details")
      setLoading(false)
    }
  }

  const handleStartExam = async () => {
    try {
      // Create a new submission
      const response = await submissionsAPI.createSubmission({ exam: id })
      const submissionId = response.data.data._id

      // Navigate to the exam taking page
      navigate(`/exams/${id}/take`, { state: { submissionId } })
    } catch (error) {
      console.error("Error starting exam:", error)
      toast.error("Failed to start exam")
    }
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

  if (!exam) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Exam not found</div>
      </div>
    )
  }

  const now = new Date()
  const startDate = new Date(exam.startDate)
  const endDate = new Date(exam.endDate)
  const isExamActive = now >= startDate && now <= endDate

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h1 className="card-title">{exam.title}</h1>
              <span className="badge bg-primary">{exam.category}</span>
            </div>
            {isExamActive && canTakeExam ? (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Start Exam
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>
                {!isExamActive ? "Exam not active" : "Maximum attempts reached"}
              </button>
            )}
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Exam Details</h5>
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Start Date
                  <span>{formatDate(exam.startDate)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  End Date
                  <span>{formatDate(exam.endDate)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Duration
                  <span>{formatDuration(exam.duration)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Total Questions
                  <span>{exam.questions.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Total Marks
                  <span>{exam.totalMarks}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Passing Score
                  <span>{exam.passingScore}%</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Allowed Attempts
                  <span>{exam.allowReattempt ? exam.reattemptCount + 1 : 1}</span>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5>Description</h5>
              <p>{exam.description}</p>

              <h5 className="mt-4">Instructions</h5>
              <div className="card bg-light">
                <div className="card-body">
                  <p className="card-text">{exam.instructions}</p>
                </div>
              </div>
            </div>
          </div>

          {previousAttempts.length > 0 && (
            <div>
              <h5>Previous Attempts</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Attempt</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousAttempts.map((attempt, index) => (
                      <tr key={attempt._id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(attempt.endTime || attempt.startTime)}</td>
                        <td>{attempt.isCompleted ? `${attempt.totalScore}/${exam.totalMarks}` : "N/A"}</td>
                        <td>
                          {attempt.isCompleted ? (
                            <span className={`badge ${attempt.isPassed ? "bg-success" : "bg-danger"}`}>
                              {attempt.isPassed ? "Passed" : "Failed"}
                            </span>
                          ) : (
                            <span className="badge bg-warning">Incomplete</span>
                          )}
                        </td>
                        <td>
                          {attempt.isCompleted ? (
                            <button className="btn btn-sm btn-info" onClick={() => navigate(`/results/${attempt._id}`)}>
                              View Results
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => navigate(`/exams/${id}/take`, { state: { submissionId: attempt._id } })}
                            >
                              Continue
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Start Exam"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleStartExam}>
              Start Now
            </button>
          </>
        }
      >
        <div>
          <p>Are you ready to start the exam?</p>
          <ul>
            <li>The exam will last for {formatDuration(exam.duration)}.</li>
            <li>You will not be able to pause the timer once started.</li>
            <li>Make sure you have a stable internet connection.</li>
            {exam && exam.isProctored && (
              <li className="text-danger">This exam is proctored. Your webcam and screen may be monitored.</li>
            )}
          </ul>
        </div>
      </Modal>
    </div>
  )
}

export default ExamDetails
"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { submissionsAPI, certificatesAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import "../../styles/globals.css";

const ExamResults = () => {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    fetchResults()
  }, [id])

  const fetchResults = async () => {
    setLoading(true)
    try {
      // Fetch submission details
      const submissionResponse = await submissionsAPI.getSubmission(id)
      setSubmission(submissionResponse.data.data)

      // Check if certificate exists
      if (submissionResponse.data.data.certificateId) {
        try {
          const certificateResponse = await certificatesAPI.getCertificate(submissionResponse.data.data.certificateId)
          setCertificate(certificateResponse.data.data)
        } catch (certError) {
          console.error("Error fetching certificate:", certError)
          // Don't show error toast for certificate fetch failure
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching results:", error)
      toast.error("Failed to load exam results")
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    setGenerating(true)
    try {
      const response = await certificatesAPI.generateCertificate({ submissionId: id })
      setCertificate(response.data.data)
      toast.success("Certificate generated successfully")
      setGenerating(false)
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast.error(error.response?.data?.message || "Failed to generate certificate")
      setGenerating(false)
    }
  }

  const calculatePercentage = (score, total) => {
    return ((score / total) * 100).toFixed(2)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A"
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours > 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ""}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <Loader />
  }

  if (!submission) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Results not found</div>
        <Link to="/dashboard" className="btn btn-primary mt-3">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const { exam, totalScore, isPassed, timeSpent, startTime, endTime, answers } = submission
  const percentage = calculatePercentage(totalScore, exam.totalMarks)

  return (
    <div className="results-container">
      <div className="results-header">
        <h1 className="results-title">Exam Results</h1>
        <p className="results-subtitle">{exam.title}</p>
      </div>

      <div className="results-summary">
        <div className="results-score">
          <div className="score-value">{percentage}%</div>
          <div className="score-label">Your Score</div>
        </div>

        <div className="results-details">
          <div className="detail-item">
            <div className="detail-value">{totalScore}</div>
            <div className="detail-label">Points Scored</div>
          </div>
          <div className="detail-item">
            <div className="detail-value">{exam.totalMarks}</div>
            <div className="detail-label">Total Points</div>
          </div>
          <div className="detail-item">
            <div className="detail-value">{formatDuration(timeSpent)}</div>
            <div className="detail-label">Time Spent</div>
          </div>
          <div className="detail-item">
            <div className="detail-value">{formatDate(endTime)}</div>
            <div className="detail-label">Completed On</div>
          </div>
        </div>

        <div className="results-status">
          {isPassed ? (
            <div className="status-passed">Congratulations! You Passed</div>
          ) : (
            <div className="status-failed">Sorry! You Did Not Pass</div>
          )}
        </div>

        {isPassed && !certificate && (
          <button
            className="btn btn-primary certificate-button"
            onClick={handleGenerateCertificate}
            disabled={generating}
          >
            {generating ? "Generating Certificate..." : "Generate Certificate"}
          </button>
        )}

        {certificate && (
          <div className="text-center mt-4">
            <Link to={`/certificates/${certificate._id}`} className="btn btn-success">
              View Certificate
            </Link>
          </div>
        )}
      </div>

      {/* Question Review */}
      <div className="card mt-4">
        <div className="card-body">
          <h3 className="card-title">Question Review</h3>

          {answers && answers.length > 0 ? (
            answers.map((answer, index) => (
              <div key={answer.question._id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">Question {index + 1}</h5>
                    <span className={`badge ${answer.isCorrect ? "bg-success" : "bg-danger"}`}>
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p>{answer.question.text}</p>

                  {/* Show options for MCQ */}
                  {(answer.question.type === "mcq-single" || answer.question.type === "mcq-multiple") && (
                    <ul className="list-group mb-3">
                      {answer.question.options.map((option, i) => (
                        <li
                          key={i}
                          className={`list-group-item ${
                            option.isCorrect
                              ? "list-group-item-success"
                              : (answer.selectedOptions.includes(option.text) && !option.isCorrect)
                                ? "list-group-item-danger"
                                : ""
                          }`}
                        >
                          {option.text}
                          {option.isCorrect && <span className="float-end">✓</span>}
                          {answer.selectedOptions.includes(option.text) && !option.isCorrect && (
                            <span className="float-end">✗</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Show text answer */}
                  {(answer.question.type === "short-answer" || answer.question.type === "essay") && (
                    <div className="mb-3">
                      <h6>Your Answer:</h6>
                      <div className="p-3 bg-light">{answer.textAnswer || "No answer provided"}</div>

                      {answer.question.type === "short-answer" && answer.question.correctAnswer && (
                        <div className="mt-2">
                          <h6>Correct Answer:</h6>
                          <div className="p-3 bg-light">{answer.question.correctAnswer}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show code answer */}
                  {answer.question.type === "coding" && (
                    <div className="mb-3">
                      <h6>Your Code:</h6>
                      <pre className="p-3 bg-light">{answer.codeAnswer || "No code provided"}</pre>
                    </div>
                  )}

                  {/* Show feedback if available */}
                  {answer.feedback && (
                    <div className="mt-3">
                      <h6>Feedback:</h6>
                      <div className="p-3 bg-light">{answer.feedback}</div>
                    </div>
                  )}

                  {/* Show explanation if available */}
                  {answer.question.explanation && (
                    <div className="mt-3">
                      <h6>Explanation:</h6>
                      <div className="p-3 bg-light">{answer.question.explanation}</div>
                    </div>
                  )}

                  <div className="mt-2">
                    <strong>
                      Score: {answer.score} / {answer.question.marks}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No answers available for review</p>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4 mb-5">
        <Link to="/exams" className="btn btn-secondary">
          Back to Exams
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ExamResults


"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { submissionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Modal from "../../components/common/Modal"

const GradeSubmission = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [gradingData, setGradingData] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const fetchSubmission = async () => {
    setLoading(true)
    try {
      const response = await submissionsAPI.getSubmission(id)
      const submissionData = response.data.data

      setSubmission(submissionData)

      // Initialize grading data for subjective questions
      const initialGradingData = submissionData.answers
        .filter((answer) => {
          const questionType = answer.question.type
          return (
            questionType === "essay" ||
            questionType === "coding" ||
            (questionType === "short-answer" && !answer.isCorrect)
          )
        })
        .map((answer) => ({
          questionId: answer.question._id,
          score: answer.score || 0,
          feedback: answer.feedback || "",
          maxScore: answer.question.marks,
          questionText: answer.question.text,
          questionType: answer.question.type,
          studentAnswer: answer.textAnswer || answer.codeAnswer || "",
        }))

      setGradingData(initialGradingData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching submission:", error)
      toast.error("Failed to load submission")
      navigate("/examiner/submissions")
    }
  }

  const handleScoreChange = (index, value) => {
    const updatedGradingData = [...gradingData]
    const maxScore = updatedGradingData[index].maxScore

    // Ensure score is within valid range
    let score = Number.parseInt(value)
    if (isNaN(score)) score = 0
    if (score < 0) score = 0
    if (score > maxScore) score = maxScore

    updatedGradingData[index].score = score
    setGradingData(updatedGradingData)
  }

  const handleFeedbackChange = (index, value) => {
    const updatedGradingData = [...gradingData]
    updatedGradingData[index].feedback = value
    setGradingData(updatedGradingData)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      // Format data for API
      const answers = gradingData.map((item) => ({
        questionId: item.questionId,
        score: item.score,
        feedback: item.feedback,
      }))

      // Submit grading
      await submissionsAPI.gradeSubmission(id, { answers })

      toast.success("Submission graded successfully")
      navigate("/examiner/submissions")
    } catch (error) {
      console.error("Error grading submission:", error)
      toast.error("Failed to grade submission")
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!submission) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Submission not found</div>
      </div>
    )
  }

  const isReadOnly = submission.submissionStatus === "graded"

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isReadOnly ? "View Submission" : "Grade Submission"}</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/examiner/submissions")}>
          Back to Submissions
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Submission Details</h5>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Exam:</strong> {submission.exam.title}
              </p>
              <p>
                <strong>Student:</strong> {submission.student.name}
              </p>
              <p>
                <strong>Submission Date:</strong>{" "}
                {new Date(submission.endTime || submission.startTime).toLocaleString()}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Status:</strong>{" "}
                <span className="badge bg-primary">{submission.submissionStatus.replace(/_/g, " ").toUpperCase()}</span>
              </p>
              <p>
                <strong>Score:</strong> {submission.totalScore} / {submission.exam.totalMarks} (
                {Math.round((submission.totalScore / submission.exam.totalMarks) * 100)}%)
              </p>
              <p>
                <strong>Result:</strong>{" "}
                <span className={`badge ${submission.isPassed ? "bg-success" : "bg-danger"}`}>
                  {submission.isPassed ? "PASSED" : "FAILED"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {gradingData.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No questions to grade</h3>
          <p>This submission doesn't have any subjective questions that require manual grading.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-3">Questions to Grade</h2>
          {gradingData.map((item, index) => (
            <div key={item.questionId} className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Question {index + 1}</h5>
                <p>{item.questionText}</p>

                <div className="mb-3">
                  <h6>Student's Answer:</h6>
                  {item.questionType === "coding" ? (
                    <pre className="bg-light p-3 rounded">{item.studentAnswer || "No answer provided"}</pre>
                  ) : (
                    <div className="p-3 bg-light rounded">{item.studentAnswer || "No answer provided"}</div>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor={`score-${index}`} className="form-label">
                      Score (0-{item.maxScore})
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id={`score-${index}`}
                      value={item.score}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      min="0"
                      max={item.maxScore}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor={`feedback-${index}`} className="form-label">
                    Feedback
                  </label>
                  <textarea
                    className="form-control"
                    id={`feedback-${index}`}
                    rows="3"
                    value={item.feedback}
                    onChange={(e) => handleFeedbackChange(index, e.target.value)}
                    placeholder="Provide feedback on this answer"
                    disabled={isReadOnly}
                  ></textarea>
                </div>
              </div>
            </div>
          ))}

          {!isReadOnly && (
            <div className="d-flex justify-content-end mb-5">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/examiner/submissions")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowConfirmModal(true)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Submit Grading"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Submission"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Confirm
            </button>
          </>
        }
      >
        <p>Are you sure you want to submit this grading?</p>
        <p>This action will finalize the student's score and cannot be undone.</p>
      </Modal>
    </div>
  )
}

export default GradeSubmission


"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI, questionsAPI, submissionsAPI } from "../../services/api"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"
import Modal from "../../components/common/Modal"
import "../../styles/globals.css";
import { joinExam, startExam, syncTime, sendProctoringAlert } from "../../services/socket"

const TakeExam = () => {
  const { id: examId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submission, setSubmission] = useState(null)
  const timerRef = useRef(null)
  const webcamRef = useRef(null)

  // Get submission ID from location state or create a new one
  const submissionId = location.state?.submissionId

  useEffect(() => {
    if (!submissionId) {
      // If no submission ID is provided, redirect to exam details
      navigate(`/exams/${examId}`)
      return
    }

    fetchExamData()

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [examId, submissionId])

  const fetchExamData = async () => {
    setLoading(true)
    try {
      // Fetch exam details
      const examResponse = await examsAPI.getExam(examId)
      setExam(examResponse.data.data)

      // Fetch submission
      const submissionResponse = await submissionsAPI.getSubmission(submissionId)
      const submissionData = submissionResponse.data.data
      setSubmission(submissionData)

      // If submission is already completed, redirect to results
      if (submissionData.isCompleted) {
        navigate(`/results/${submissionId}`)
        return
      }

      // Fetch questions
      const questionsResponse = await questionsAPI.getExamQuestions(examId)
      let examQuestions = questionsResponse.data.data

      // Randomize questions if needed
      if (examResponse.data.data.randomizeQuestions) {
        examQuestions = shuffleArray(examQuestions)
      }

      setQuestions(examQuestions)

      // Initialize answers from existing submission
      const initialAnswers = {}
      if (submissionData.answers && submissionData.answers.length > 0) {
        submissionData.answers.forEach((answer) => {
          initialAnswers[answer.question] = {
            selectedOptions: answer.selectedOptions || [],
            textAnswer: answer.textAnswer || "",
            codeAnswer: answer.codeAnswer || "",
          }
        })
      }
      setAnswers(initialAnswers)

      // Calculate time remaining
      const startTime = new Date(submissionData.startTime)
      const durationMs = examResponse.data.data.duration * 60 * 1000
      const endTime = new Date(startTime.getTime() + durationMs)
      const now = new Date()
      const remainingMs = Math.max(0, endTime - now)
      setTimeRemaining(Math.floor(remainingMs / 1000))

      // Start timer
      startTimer()

      // Join exam room via socket
      joinExam(examId)

      // Notify that student started exam
      startExam(examId, user.id, timeRemaining)

      // Initialize proctoring if needed
      if (examResponse.data.data.isProctored) {
        initializeProctoring()
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching exam data:", error)
      toast.error("Failed to load exam")
      navigate(`/exams/${examId}`)
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current)
          handleTimeUp()
          return 0
        }

        // Sync time every minute
        if (prevTime % 60 === 0) {
          syncTime(examId, user.id, prevTime)
        }

        return prevTime - 1
      })
    }, 1000)
  }

  const handleTimeUp = async () => {
    toast.warning("Time is up! Your exam is being submitted.")
    await handleSubmitExam()
  }

  const initializeProctoring = async () => {
    if (!exam.isProctored) return

    try {
      // Request webcam access if needed
      if (exam.proctoringSettings.detectFaces || exam.proctoringSettings.recordWebcam) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream
        }

        // Set up face detection (simplified for this example)
        if (exam.proctoringSettings.detectFaces) {
          // In a real implementation, you would use a face detection library
          // For now, we'll just simulate detection with random alerts
          setInterval(() => {
            const shouldAlert = Math.random() < 0.05 // 5% chance of alert
            if (shouldAlert) {
              sendProctoringAlert(examId, user.id, "face_missing", "Face not detected in frame")
              toast.warning("Proctoring Alert: Face not detected")
            }
          }, 30000)
        }
      }

      // Set up tab switching detection
      if (exam.proctoringSettings.preventTabSwitching) {
        document.addEventListener("visibilitychange", handleVisibilityChange)
      }
    } catch (error) {
      console.error("Error initializing proctoring:", error)
      toast.error("Failed to initialize proctoring. Please ensure camera access is allowed.")
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      sendProctoringAlert(examId, user.id, "tab_switch", "User switched tabs")
      toast.warning("Proctoring Alert: Tab switching detected")
    }
  }

  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleOptionChange = (questionId, optionText, isMultiple) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[questionId] || { selectedOptions: [], textAnswer: "", codeAnswer: "" }

      let newSelectedOptions
      if (isMultiple) {
        // For multiple choice, toggle the option
        if (currentAnswer.selectedOptions.includes(optionText)) {
          newSelectedOptions = currentAnswer.selectedOptions.filter((opt) => opt !== optionText)
        } else {
          newSelectedOptions = [...currentAnswer.selectedOptions, optionText]
        }
      } else {
        // For single choice, replace the selection
        newSelectedOptions = [optionText]
      }

      const updatedAnswer = {
        ...currentAnswer,
        selectedOptions: newSelectedOptions,
      }

      // Save answer to server
      saveAnswer(questionId, updatedAnswer)

      return {
        ...prevAnswers,
        [questionId]: updatedAnswer,
      }
    })
  }

  const handleTextAnswerChange = (questionId, text) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[questionId] || { selectedOptions: [], textAnswer: "", codeAnswer: "" }

      const updatedAnswer = {
        ...currentAnswer,
        textAnswer: text,
      }

      // Debounce saving text answers to reduce API calls
      if (window.textAnswerTimeout) {
        clearTimeout(window.textAnswerTimeout)
      }

      window.textAnswerTimeout = setTimeout(() => {
        saveAnswer(questionId, updatedAnswer)
      }, 1000)

      return {
        ...prevAnswers,
        [questionId]: updatedAnswer,
      }
    })
  }

  const handleCodeAnswerChange = (questionId, code) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[questionId] || { selectedOptions: [], textAnswer: "", codeAnswer: "" }

      const updatedAnswer = {
        ...currentAnswer,
        codeAnswer: code,
      }

      // Debounce saving code answers to reduce API calls
      if (window.codeAnswerTimeout) {
        clearTimeout(window.codeAnswerTimeout)
      }

      window.codeAnswerTimeout = setTimeout(() => {
        saveAnswer(questionId, updatedAnswer)
      }, 1000)

      return {
        ...prevAnswers,
        [questionId]: updatedAnswer,
      }
    })
  }

  const saveAnswer = async (questionId, answerData) => {
    try {
      await submissionsAPI.saveAnswer(submissionId, {
        question: questionId,
        selectedOptions: answerData.selectedOptions,
        textAnswer: answerData.textAnswer,
        codeAnswer: answerData.codeAnswer,
      })
    } catch (error) {
      console.error("Error saving answer:", error)
      // Don't show toast for every save to avoid spamming the user
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleJumpToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const handleSubmitExam = async () => {
    setSubmitting(true)
    try {
      // Submit the exam
      await submissionsAPI.submitExam(submissionId)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Clean up proctoring
      if (exam.isProctored) {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        if (webcamRef.current && webcamRef.current.srcObject) {
          webcamRef.current.srcObject.getTracks().forEach((track) => track.stop())
        }
      }

      // Navigate to results page
      navigate(`/results/${submissionId}`)
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast.error("Failed to submit exam. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!exam || !questions.length) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Failed to load exam questions</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const currentAnswer = answers[currentQuestion._id] || { selectedOptions: [], textAnswer: "", codeAnswer: "" }
  const isMultipleChoice = currentQuestion.type === "mcq-multiple"
  const isTimeAlmostUp = timeRemaining < 300 // Less than 5 minutes

  return (
    <div className="exam-container">
      {/* Timer */}
      <div className={`exam-timer ${isTimeAlmostUp ? "timer-warning" : ""}`}>
        <div>
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="timer-value">Time Remaining: {formatTime(timeRemaining)}</div>
      </div>

      {/* Proctoring warning if enabled */}
      {exam.isProctored && (
        <div className="proctoring-container">
          <span>⚠️ This exam is being proctored. Please keep your face visible and do not switch tabs.</span>
        </div>
      )}

      {/* Question Navigation */}
      <div className="question-navigation">
        {questions.map((q, index) => (
          <button
            key={q._id}
            className={`question-nav-button ${index === currentQuestionIndex ? "active" : ""} ${answers[q._id] ? "answered" : ""}`}
            onClick={() => handleJumpToQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      <div className="question-container">
        <div className="question-number">Question {currentQuestionIndex + 1}</div>
        <div className="question-text">{currentQuestion.text}</div>

        {/* Question Image if available */}
        {currentQuestion.image && (
          <img src={currentQuestion.image || "/placeholder.svg"} alt="Question" className="question-image" />
        )}

        {/* Code Snippet if available */}
        {currentQuestion.code && (
          <div className="code-snippet">
            <pre>
              <code>{currentQuestion.code}</code>
            </pre>
          </div>
        )}

        {/* Question Options for MCQ */}
        {(currentQuestion.type === "mcq-single" || currentQuestion.type === "mcq-multiple") && (
          <ul className="options-list">
            {currentQuestion.options.map((option, index) => (
              <li key={index} className="option-item">
                <label className="option-label">
                  <input
                    type={isMultipleChoice ? "checkbox" : "radio"}
                    name={`question-${currentQuestion._id}`}
                    value={option.text}
                    checked={currentAnswer.selectedOptions.includes(option.text)}
                    onChange={() => handleOptionChange(currentQuestion._id, option.text, isMultipleChoice)}
                    className="option-input"
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {/* Text Answer for short-answer or essay */}
        {(currentQuestion.type === "short-answer" || currentQuestion.type === "essay") && (
          <div className="text-answer-container">
            <label htmlFor="text-answer" className="text-answer-label">
              Your Answer:
            </label>
            <textarea
              id="text-answer"
              className="text-answer"
              value={currentAnswer.textAnswer}
              onChange={(e) => handleTextAnswerChange(currentQuestion._id, e.target.value)}
              placeholder="Type your answer here..."
              rows={currentQuestion.type === "essay" ? 10 : 4}
            ></textarea>
          </div>
        )}

        {/* Code Answer for coding questions */}
        {currentQuestion.type === "coding" && (
          <div className="code-answer-container">
            <label htmlFor="code-answer" className="text-answer-label">
              Your Code ({currentQuestion.codeLanguage || "text"}):
            </label>
            <textarea
              id="code-answer"
              className="code-editor"
              value={currentAnswer.codeAnswer}
              onChange={(e) => handleCodeAnswerChange(currentQuestion._id, e.target.value)}
              placeholder={`Write your ${currentQuestion.codeLanguage || "code"} here...`}
              rows={12}
            ></textarea>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button className="btn btn-secondary" onClick={handlePrevQuestion} disabled={isFirstQuestion}>
            Previous
          </button>

          {isLastQuestion ? (
            <button className="btn btn-primary" onClick={() => setShowSubmitModal(true)}>
              Submit Exam
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNextQuestion}>
              Next
            </button>
          )}
        </div>
      </div>

      {/* Webcam feed for proctoring */}
      {exam.isProctored && (exam.proctoringSettings.detectFaces || exam.proctoringSettings.recordWebcam) && (
        <div className="webcam-container">
          <video ref={webcamRef} autoPlay muted className="webcam-video"></video>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmitExam} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </>
        }
      >
        <div>
          <p>Are you sure you want to submit your exam?</p>
          <p>
            You have answered {Object.keys(answers).length} out of {questions.length} questions.
            {Object.keys(answers).length < questions.length && (
              <span className="text-danger"> Some questions are still unanswered.</span>
            )}
          </p>
          <p>Once submitted, you cannot change your answers.</p>
        </div>
      </Modal>
    </div>
  )
}

export default TakeExam


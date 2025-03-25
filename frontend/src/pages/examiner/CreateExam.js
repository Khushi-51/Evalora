"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI, questionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    passingScore: 70,
    totalMarks: 100,
    startDate: "",
    endDate: "",
    instructions: "",
    randomizeQuestions: true,
    showResultsInstantly: false,
    allowReattempt: false,
    reattemptCount: 0,
    category: "Technical",
    certificateTemplate: "default",
    isProctored: false,
    proctoringSettings: {
      detectFaces: true,
      detectObjects: true,
      recordScreen: false,
      recordWebcam: false,
      preventTabSwitching: true,
    },
    status: "draft",
  })

  const [availableQuestions, setAvailableQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setQuestionsLoading(true)
    try {
      const response = await questionsAPI.getQuestions()
      setAvailableQuestions(response.data.data || [])
      setQuestionsLoading(false)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast.error("Failed to load questions")
      setQuestionsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" })
    }
  }

  const handleProctoringSettingChange = (e) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      proctoringSettings: {
        ...formData.proctoringSettings,
        [name]: checked,
      },
    })
  }

  const handleQuestionSelect = (questionId) => {
    const question = availableQuestions.find((q) => q._id === questionId)
    if (!question) return

    // Add to selected questions
    setSelectedQuestions([...selectedQuestions, question])

    // Remove from available questions
    setAvailableQuestions(availableQuestions.filter((q) => q._id !== questionId))
  }

  const handleQuestionRemove = (questionId) => {
    const question = selectedQuestions.find((q) => q._id === questionId)
    if (!question) return

    // Remove from selected questions
    setSelectedQuestions(selectedQuestions.filter((q) => q._id !== questionId))

    // Add back to available questions
    setAvailableQuestions([...availableQuestions, question])
  }

  const calculateTotalMarks = () => {
    return selectedQuestions.reduce((total, question) => total + question.marks, 0)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title) errors.title = "Title is required"
    if (!formData.description) errors.description = "Description is required"
    if (!formData.duration || formData.duration <= 0) errors.duration = "Duration must be greater than 0"
    if (!formData.passingScore || formData.passingScore < 0 || formData.passingScore > 100) {
      errors.passingScore = "Passing score must be between 0 and 100"
    }
    if (!formData.startDate) errors.startDate = "Start date is required"
    if (!formData.endDate) errors.endDate = "End date is required"
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = "End date must be after start date"
    }
    if (!formData.instructions) errors.instructions = "Instructions are required"
    if (selectedQuestions.length === 0) errors.questions = "At least one question is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)
    try {
      // Prepare data for submission
      const examData = {
        ...formData,
        questions: selectedQuestions.map((q) => q._id),
        totalMarks: calculateTotalMarks(),
      }

      // Create exam
      const response = await examsAPI.createExam(examData)

      toast.success("Exam created successfully")
      navigate(`/examiner/exams/${response.data.data._id}/edit`)
    } catch (error) {
      console.error("Error creating exam:", error)
      toast.error("Failed to create exam")
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Create New Exam</h1>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Basic Information</h5>

                <div className="form-group mb-3">
                  <label htmlFor="title">Exam Title</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.title ? "is-invalid" : ""}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter exam title"
                  />
                  {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className={`form-control ${formErrors.description ? "is-invalid" : ""}`}
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter exam description"
                  ></textarea>
                  {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="category">Category</label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Academic">Academic</option>
                        <option value="Professional">Professional</option>
                        <option value="Certification">Certification</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="duration">Duration (minutes)</label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.duration ? "is-invalid" : ""}`}
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                      />
                      {formErrors.duration && <div className="invalid-feedback">{formErrors.duration}</div>}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="startDate">Start Date</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.startDate ? "is-invalid" : ""}`}
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                      {formErrors.startDate && <div className="invalid-feedback">{formErrors.startDate}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.endDate ? "is-invalid" : ""}`}
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                      {formErrors.endDate && <div className="invalid-feedback">{formErrors.endDate}</div>}
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="instructions">Instructions</label>
                  <textarea
                    className={`form-control ${formErrors.instructions ? "is-invalid" : ""}`}
                    id="instructions"
                    name="instructions"
                    rows="4"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Enter exam instructions"
                  ></textarea>
                  {formErrors.instructions && <div className="invalid-feedback">{formErrors.instructions}</div>}
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Exam Settings</h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="passingScore">Passing Score (%)</label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.passingScore ? "is-invalid" : ""}`}
                        id="passingScore"
                        name="passingScore"
                        value={formData.passingScore}
                        onChange={handleChange}
                        min="0"
                        max="100"
                      />
                      {formErrors.passingScore && <div className="invalid-feedback">{formErrors.passingScore}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="certificateTemplate">Certificate Template</label>
                      <select
                        className="form-select"
                        id="certificateTemplate"
                        name="certificateTemplate"
                        value={formData.certificateTemplate}
                        onChange={handleChange}
                      >
                        <option value="default">Default</option>
                        <option value="gold">Gold</option>
                        <option value="blue">Blue</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="randomizeQuestions"
                    name="randomizeQuestions"
                    checked={formData.randomizeQuestions}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="randomizeQuestions">
                    Randomize Questions
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showResultsInstantly"
                    name="showResultsInstantly"
                    checked={formData.showResultsInstantly}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="showResultsInstantly">
                    Show Results Instantly
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="allowReattempt"
                    name="allowReattempt"
                    checked={formData.allowReattempt}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="allowReattempt">
                    Allow Reattempt
                  </label>
                </div>

                {formData.allowReattempt && (
                  <div className="form-group mb-3">
                    <label htmlFor="reattemptCount">Number of Reattempts Allowed</label>
                    <input
                      type="number"
                      className="form-control"
                      id="reattemptCount"
                      name="reattemptCount"
                      value={formData.reattemptCount}
                      onChange={handleChange}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Proctoring Settings</h5>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isProctored"
                    name="isProctored"
                    checked={formData.isProctored}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isProctored">
                    Enable Proctoring
                  </label>
                </div>

                {formData.isProctored && (
                  <div className="ms-4">
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="detectFaces"
                        name="detectFaces"
                        checked={formData.proctoringSettings.detectFaces}
                        onChange={handleProctoringSettingChange}
                      />
                      <label className="form-check-label" htmlFor="detectFaces">
                        Detect Faces
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="detectObjects"
                        name="detectObjects"
                        checked={formData.proctoringSettings.detectObjects}
                        onChange={handleProctoringSettingChange}
                      />
                      <label className="form-check-label" htmlFor="detectObjects">
                        Detect Objects
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="recordScreen"
                        name="recordScreen"
                        checked={formData.proctoringSettings.recordScreen}
                        onChange={handleProctoringSettingChange}
                      />
                      <label className="form-check-label" htmlFor="recordScreen">
                        Record Screen
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="recordWebcam"
                        name="recordWebcam"
                        checked={formData.proctoringSettings.recordWebcam}
                        onChange={handleProctoringSettingChange}
                      />
                      <label className="form-check-label" htmlFor="recordWebcam">
                        Record Webcam
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="preventTabSwitching"
                        name="preventTabSwitching"
                        checked={formData.proctoringSettings.preventTabSwitching}
                        onChange={handleProctoringSettingChange}
                      />
                      <label className="form-check-label" htmlFor="preventTabSwitching">
                        Prevent Tab Switching
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Questions</h5>

                {formErrors.questions && <div className="alert alert-danger">{formErrors.questions}</div>}

                <div className="mb-3">
                  <h6>Selected Questions ({selectedQuestions.length})</h6>
                  <p>Total Marks: {calculateTotalMarks()}</p>

                  {selectedQuestions.length === 0 ? (
                    <p className="text-muted">No questions selected</p>
                  ) : (
                    <ul className="list-group">
                      {selectedQuestions.map((question, index) => (
                        <li
                          key={question._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span className="badge bg-primary me-2">{index + 1}</span>
                            {question.text.substring(0, 30)}...
                            <span className="badge bg-secondary ms-2">{question.marks} marks</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleQuestionRemove(question._id)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h6>Available Questions</h6>

                  {questionsLoading ? (
                    <Loader />
                  ) : availableQuestions.length === 0 ? (
                    <p className="text-muted">No available questions</p>
                  ) : (
                    <ul className="list-group">
                      {availableQuestions.map((question) => (
                        <li
                          key={question._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <small>{question.text.substring(0, 30)}...</small>
                            <span className="badge bg-secondary ms-2">{question.marks} marks</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleQuestionSelect(question._id)}
                          >
                            Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Actions</h5>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Exam"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate("/examiner/exams")}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateExam


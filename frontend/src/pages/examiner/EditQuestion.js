"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { questionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"

const EditQuestion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    text: "",
    type: "mcq-single",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
    explanation: "",
    tags: "",
    category: "",
    image: "",
    code: "",
    codeLanguage: "",
    gradingCriteria: "",
    keywordExpectations: "",
    plagiarismThreshold: 80,
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchQuestionData()
  }, [id])

  const fetchQuestionData = async () => {
    setLoading(true)
    try {
      const response = await questionsAPI.getQuestion(id)
      const questionData = response.data.data

      // Format tags and keywords for form
      const tagsString = questionData.tags ? questionData.tags.join(", ") : ""
      const keywordsString = questionData.keywordExpectations ? questionData.keywordExpectations.join(", ") : ""

      // Ensure options array has at least 2 items for MCQ
      let options = questionData.options || []
      if (["mcq-single", "mcq-multiple"].includes(questionData.type) && options.length < 2) {
        options = [...options, { text: "", isCorrect: false }, { text: "", isCorrect: false }]
      }

      // For true-false, ensure we have exactly two options
      if (questionData.type === "true-false") {
        if (!options.length) {
          options = [
            { text: "True", isCorrect: false },
            { text: "False", isCorrect: false },
          ]
        }
      }

      setFormData({
        ...questionData,
        options,
        tags: tagsString,
        keywordExpectations: keywordsString,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching question:", error)
      toast.error("Failed to load question data")
      navigate("/examiner/questions")
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

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }

    // For single choice, ensure only one option is correct
    if (field === "isCorrect" && value === true && formData.type === "mcq-single") {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          updatedOptions[i].isCorrect = false
        }
      })
    }

    setFormData({ ...formData, options: updatedOptions })
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", isCorrect: false }],
    })
  }

  const removeOption = (index) => {
    const updatedOptions = [...formData.options]
    updatedOptions.splice(index, 1)
    setFormData({ ...formData, options: updatedOptions })
  }

  const handleTagsChange = (e) => {
    setFormData({ ...formData, tags: e.target.value })
  }

  const handleKeywordExpectationsChange = (e) => {
    setFormData({ ...formData, keywordExpectations: e.target.value })
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.text) errors.text = "Question text is required"
    if (!formData.marks || formData.marks <= 0) errors.marks = "Marks must be greater than 0"

    // Validate options for MCQ and true-false
    if (["mcq-single", "mcq-multiple", "true-false"].includes(formData.type)) {
      // Check if at least 2 options are provided
      const filledOptions = formData.options.filter((option) => option.text.trim() !== "")
      if (filledOptions.length < 2) {
        errors.options = "At least 2 options are required"
      }

      // Check if at least one option is marked as correct
      const hasCorrectOption = formData.options.some((option) => option.isCorrect)
      if (!hasCorrectOption) {
        errors.correctOption = "At least one option must be marked as correct"
      }
    }

    // Validate correct answer for short-answer
    if (formData.type === "short-answer" && !formData.correctAnswer) {
      errors.correctAnswer = "Correct answer is required for short-answer questions"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setSaving(true)
    try {
      // Prepare data for submission
      const questionData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        keywordExpectations: formData.keywordExpectations
          ? formData.keywordExpectations.split(",").map((keyword) => keyword.trim())
          : [],
      }

      // Update question
      await questionsAPI.updateQuestion(id, questionData)

      toast.success("Question updated successfully")
      navigate("/examiner/questions")
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit Question</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/examiner/questions")}>
          Back to Question Bank
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Question Information</h5>

            <div className="form-group mb-3">
              <label htmlFor="text">Question Text</label>
              <textarea
                className={`form-control ${formErrors.text ? "is-invalid" : ""}`}
                id="text"
                name="text"
                rows="3"
                value={formData.text}
                onChange={handleChange}
                placeholder="Enter the question text"
              ></textarea>
              {formErrors.text && <div className="invalid-feedback">{formErrors.text}</div>}
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="type">Question Type</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled // Type cannot be changed after creation
                  >
                    <option value="mcq-single">Multiple Choice (Single)</option>
                    <option value="mcq-multiple">Multiple Choice (Multiple)</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="coding">Coding</option>
                  </select>
                  <small className="form-text text-muted">Question type cannot be changed after creation.</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    className="form-select"
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="marks">Marks</label>
                  <input
                    type="number"
                    className={`form-control ${formErrors.marks ? "is-invalid" : ""}`}
                    id="marks"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    min="1"
                  />
                  {formErrors.marks && <div className="invalid-feedback">{formErrors.marks}</div>}
                </div>
              </div>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="E.g., Mathematics, Programming, Science"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder="E.g., algebra, calculus, functions"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="image">Image URL (optional)</label>
              <input
                type="text"
                className="form-control"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="URL to an image for this question"
              />
            </div>
          </div>
        </div>

        {/* Options for MCQ and True/False */}
        {["mcq-single", "mcq-multiple", "true-false"].includes(formData.type) && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Options</h5>
              {formErrors.options && <div className="alert alert-danger">{formErrors.options}</div>}
              {formErrors.correctOption && <div className="alert alert-danger">{formErrors.correctOption}</div>}

              {formData.type === "true-false" ? (
                // True/False options
                <div>
                  <div className="form-check mb-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="optionTrue"
                      checked={formData.options[0].isCorrect}
                      onChange={() => {
                        const updatedOptions = [
                          { text: "True", isCorrect: true },
                          { text: "False", isCorrect: false },
                        ]
                        setFormData({ ...formData, options: updatedOptions })
                      }}
                    />
                    <label className="form-check-label" htmlFor="optionTrue">
                      True is the correct answer
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="optionFalse"
                      checked={formData.options[1].isCorrect}
                      onChange={() => {
                        const updatedOptions = [
                          { text: "True", isCorrect: false },
                          { text: "False", isCorrect: true },
                        ]
                        setFormData({ ...formData, options: updatedOptions })
                      }}
                    />
                    <label className="form-check-label" htmlFor="optionFalse">
                      False is the correct answer
                    </label>
                  </div>
                </div>
              ) : (
                // MCQ options
                <div>
                  {formData.options.map((option, index) => (
                    <div key={index} className="row mb-3 align-items-center">
                      <div className="col-md-8">
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input
                            type={formData.type === "mcq-single" ? "radio" : "checkbox"}
                            className="form-check-input"
                            id={`option${index}`}
                            checked={option.isCorrect}
                            onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                            name={formData.type === "mcq-single" ? "correctOption" : ""}
                          />
                          <label className="form-check-label" htmlFor={`option${index}`}>
                            Correct
                          </label>
                        </div>
                      </div>
                      <div className="col-md-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeOption(index)}
                          disabled={formData.options.length <= 2}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addOption}>
                    Add Option
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Correct Answer for Short Answer */}
        {formData.type === "short-answer" && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Correct Answer</h5>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${formErrors.correctAnswer ? "is-invalid" : ""}`}
                  id="correctAnswer"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  placeholder="Enter the correct answer"
                />
                {formErrors.correctAnswer && <div className="invalid-feedback">{formErrors.correctAnswer}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Code for Coding Questions */}
        {formData.type === "coding" && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Code Information</h5>
              <div className="form-group mb-3">
                <label htmlFor="codeLanguage">Programming Language</label>
                <input
                  type="text"
                  className="form-control"
                  id="codeLanguage"
                  name="codeLanguage"
                  value={formData.codeLanguage}
                  onChange={handleChange}
                  placeholder="E.g., javascript, python, java"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="code">Code Snippet (optional)</label>
                <textarea
                  className="form-control"
                  id="code"
                  name="code"
                  rows="5"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Enter a code snippet for this question"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Grading Information for Subjective Questions */}
        {["essay", "short-answer", "coding"].includes(formData.type) && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Grading Information</h5>
              <div className="form-group mb-3">
                <label htmlFor="gradingCriteria">Grading Criteria</label>
                <textarea
                  className="form-control"
                  id="gradingCriteria"
                  name="gradingCriteria"
                  rows="3"
                  value={formData.gradingCriteria}
                  onChange={handleChange}
                  placeholder="Enter criteria for grading this question"
                ></textarea>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="keywordExpectations">Expected Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  id="keywordExpectations"
                  name="keywordExpectations"
                  value={formData.keywordExpectations}
                  onChange={handleKeywordExpectationsChange}
                  placeholder="E.g., algorithm, complexity, efficiency"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="plagiarismThreshold">Plagiarism Threshold (%)</label>
                <input
                  type="number"
                  className="form-control"
                  id="plagiarismThreshold"
                  name="plagiarismThreshold"
                  value={formData.plagiarismThreshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Explanation (Optional)</h5>
            <div className="form-group">
              <textarea
                className="form-control"
                id="explanation"
                name="explanation"
                rows="3"
                value={formData.explanation}
                onChange={handleChange}
                placeholder="Enter an explanation for the correct answer"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/examiner/questions")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditQuestion


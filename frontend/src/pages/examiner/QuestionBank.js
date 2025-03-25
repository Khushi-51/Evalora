"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { questionsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Modal from "../../components/common/Modal"
import Pagination from "../../components/common/Pagination"

const QuestionBank = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [filter, currentPage])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await questionsAPI.getQuestions()
      let filteredQuestions = response.data.data || []

      // Apply filter
      if (filter !== "all") {
        filteredQuestions = filteredQuestions.filter((question) => question.type === filter)
      }

      // Apply search if present
      if (searchTerm) {
        filteredQuestions = filteredQuestions.filter(
          (question) =>
            question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (question.tags && question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (question.category && question.category.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      setQuestions(filteredQuestions)
      setTotalPages(Math.ceil(filteredQuestions.length / 10))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast.error("Failed to load questions")
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchQuestions()
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const confirmDelete = (question) => {
    setQuestionToDelete(question)
    setShowDeleteModal(true)
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return

    try {
      await questionsAPI.deleteQuestion(questionToDelete._id)
      toast.success("Question deleted successfully")
      setShowDeleteModal(false)
      fetchQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
      toast.error(error.response?.data?.message || "Failed to delete question")
    }
  }

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question)
    setShowViewModal(true)
  }

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case "mcq-single":
        return "Multiple Choice (Single)"
      case "mcq-multiple":
        return "Multiple Choice (Multiple)"
      case "true-false":
        return "True/False"
      case "short-answer":
        return "Short Answer"
      case "essay":
        return "Essay"
      case "coding":
        return "Coding"
      default:
        return type
    }
  }

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-success"
      case "medium":
        return "bg-warning"
      case "hard":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  // Get current questions for pagination
  const indexOfLastQuestion = currentPage * 10
  const indexOfFirstQuestion = indexOfLastQuestion - 10
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Question Bank</h1>
        <Link to="/examiner/questions/create" className="btn btn-primary">
          Create New Question
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <form onSubmit={handleSearch} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="btn btn-outline-primary">
                  Search
                </button>
              </form>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end">
              <select className="form-select" style={{ width: "auto" }} value={filter} onChange={handleFilterChange}>
                <option value="all">All Questions</option>
                <option value="mcq-single">Multiple Choice (Single)</option>
                <option value="mcq-multiple">Multiple Choice (Multiple)</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
                <option value="essay">Essay</option>
                <option value="coding">Coding</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No questions found</h3>
          <p>Create your first question to get started.</p>
          <Link to="/examiner/questions/create" className="btn btn-primary mt-3">
            Create New Question
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Marks</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQuestions.map((question) => (
                  <tr key={question._id}>
                    <td>{question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}</td>
                    <td>{getQuestionTypeLabel(question.type)}</td>
                    <td>
                      <span className={`badge ${getDifficultyBadgeClass(question.difficulty)}`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                    </td>
                    <td>{question.marks}</td>
                    <td>{question.category || "N/A"}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-info" onClick={() => handleViewQuestion(question)}>
                          View
                        </button>
                        <Link to={`/examiner/questions/${question._id}/edit`} className="btn btn-sm btn-primary">
                          Edit
                        </Link>
                        <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(question)}>
                          Delete
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteQuestion}>
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this question?</p>
        <p className="text-danger">This action cannot be undone.</p>
        {questionToDelete && (
          <div className="alert alert-warning">
            <strong>Question:</strong> {questionToDelete.text}
          </div>
        )}
      </Modal>

      {/* View Question Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Question Details"
        footer={
          <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
            Close
          </button>
        }
      >
        {selectedQuestion && (
          <div>
            <h5>Question Text</h5>
            <p>{selectedQuestion.text}</p>

            {selectedQuestion.image && (
              <div className="mb-3">
                <h5>Image</h5>
                <img
                  src={selectedQuestion.image || "/placeholder.svg"}
                  alt="Question"
                  className="img-fluid"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            )}

            {selectedQuestion.code && (
              <div className="mb-3">
                <h5>Code Snippet</h5>
                <pre className="bg-light p-3 rounded">{selectedQuestion.code}</pre>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-4">
                <h5>Type</h5>
                <p>{getQuestionTypeLabel(selectedQuestion.type)}</p>
              </div>
              <div className="col-md-4">
                <h5>Difficulty</h5>
                <p>
                  <span className={`badge ${getDifficultyBadgeClass(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1)}
                  </span>
                </p>
              </div>
              <div className="col-md-4">
                <h5>Marks</h5>
                <p>{selectedQuestion.marks}</p>
              </div>
            </div>

            {(selectedQuestion.type === "mcq-single" ||
              selectedQuestion.type === "mcq-multiple" ||
              selectedQuestion.type === "true-false") && (
              <div className="mb-3">
                <h5>Options</h5>
                <ul className="list-group">
                  {selectedQuestion.options.map((option, index) => (
                    <li key={index} className={`list-group-item ${option.isCorrect ? "list-group-item-success" : ""}`}>
                      {option.text} {option.isCorrect && <span className="float-end">✓ Correct</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedQuestion.type === "short-answer" && (
              <div className="mb-3">
                <h5>Correct Answer</h5>
                <p>{selectedQuestion.correctAnswer || "Not specified"}</p>
              </div>
            )}

            {selectedQuestion.explanation && (
              <div className="mb-3">
                <h5>Explanation</h5>
                <p>{selectedQuestion.explanation}</p>
              </div>
            )}

            {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
              <div className="mb-3">
                <h5>Tags</h5>
                <div>
                  {selectedQuestion.tags.map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default QuestionBank


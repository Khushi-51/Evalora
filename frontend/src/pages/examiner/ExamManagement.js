"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { examsAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import Modal from "../../components/common/Modal"
import Pagination from "../../components/common/Pagination"

const ExamManagement = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [examToDelete, setExamToDelete] = useState(null)

  useEffect(() => {
    fetchExams()
  }, [filter, currentPage])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const response = await examsAPI.getExams()
      let filteredExams = response.data.data || []

      // Apply filter
      if (filter !== "all") {
        filteredExams = filteredExams.filter((exam) => exam.status === filter)
      }

      // Apply search if present
      if (searchTerm) {
        filteredExams = filteredExams.filter(
          (exam) =>
            exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.category.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setExams(filteredExams)
      setTotalPages(Math.ceil(filteredExams.length / 10))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast.error("Failed to load exams")
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExams()
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const confirmDelete = (exam) => {
    setExamToDelete(exam)
    setShowDeleteModal(true)
  }

  const handleDeleteExam = async () => {
    if (!examToDelete) return

    try {
      await examsAPI.deleteExam(examToDelete._id)
      toast.success("Exam deleted successfully")
      setShowDeleteModal(false)
      fetchExams()
    } catch (error) {
      console.error("Error deleting exam:", error)
      toast.error("Failed to delete exam")
    }
  }

  const handlePublishExam = async (id) => {
    try {
      await examsAPI.publishExam(id)
      toast.success("Exam published successfully")
      fetchExams()
    } catch (error) {
      console.error("Error publishing exam:", error)
      toast.error("Failed to publish exam")
    }
  }

  const handleArchiveExam = async (id) => {
    try {
      await examsAPI.archiveExam(id)
      toast.success("Exam archived successfully")
      fetchExams()
    } catch (error) {
      console.error("Error archiving exam:", error)
      toast.error("Failed to archive exam")
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get current exams for pagination
  const indexOfLastExam = currentPage * 10
  const indexOfFirstExam = indexOfLastExam - 10
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Exam Management</h1>
        <Link to="/examiner/exams/create" className="btn btn-primary">
          Create New Exam
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
                  placeholder="Search exams..."
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
                <option value="all">All Exams</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No exams found</h3>
          <p>Create your first exam to get started.</p>
          <Link to="/examiner/exams/create" className="btn btn-primary mt-3">
            Create New Exam
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.title}</td>
                    <td>{exam.category}</td>
                    <td>{formatDate(exam.startDate)}</td>
                    <td>{formatDate(exam.endDate)}</td>
                    <td>
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
                    </td>
                    <td>{exam.questions.length}</td>
                    <td>
                      <div className="btn-group">
                        <Link to={`/examiner/exams/${exam._id}/edit`} className="btn btn-sm btn-primary">
                          Edit
                        </Link>
                        {exam.status === "draft" && (
                          <button className="btn btn-sm btn-success" onClick={() => handlePublishExam(exam._id)}>
                            Publish
                          </button>
                        )}
                        {exam.status === "published" && (
                          <button className="btn btn-sm btn-warning" onClick={() => handleArchiveExam(exam._id)}>
                            Archive
                          </button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(exam)}>
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
            <button className="btn btn-danger" onClick={handleDeleteExam}>
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete the exam "{examToDelete?.title}"?</p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

export default ExamManagement


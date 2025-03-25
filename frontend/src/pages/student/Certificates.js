"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { certificatesAPI } from "../../services/api"
import Loader from "../../components/common/Loader"

const Certificates = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const response = await certificatesAPI.getUserCertificates()
      setCertificates(response.data.data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to load certificates")
      setLoading(false)
    }
  }

  const handleDownload = async (id) => {
    setDownloadLoading(true)
    try {
      const response = await certificatesAPI.downloadCertificate(id)

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `Certificate-${id}.pdf`
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      setDownloadLoading(false)
      toast.success("Certificate downloaded successfully")
    } catch (error) {
      console.error("Error downloading certificate:", error)
      toast.error("Failed to download certificate")
      setDownloadLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="card p-4 text-center">
          <h3>No certificates found</h3>
          <p>Complete exams with passing scores to earn certificates.</p>
          <Link to="/exams" className="btn btn-primary mt-3">
            Browse Available Exams
          </Link>
        </div>
      ) : (
        <div className="row">
          {certificates.map((certificate) => (
            <div key={certificate._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{certificate.exam.title}</h5>
                  <div className="mb-3">
                    <span className="badge bg-success">Score: {certificate.score}%</span>
                  </div>
                  <p className="card-text">
                    <strong>Certificate Number:</strong> {certificate.certificateNumber}
                  </p>
                  <p className="card-text">
                    <strong>Issue Date:</strong> {formatDate(certificate.issueDate)}
                  </p>
                  {certificate.expiryDate && (
                    <p className="card-text">
                      <strong>Expiry Date:</strong> {formatDate(certificate.expiryDate)}
                    </p>
                  )}
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link to={`/certificates/${certificate._id}`} className="btn btn-primary">
                    View
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDownload(certificate._id)}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? "Downloading..." : "Download"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Certificates


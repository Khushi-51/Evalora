"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { certificatesAPI } from "../../services/api"
import Loader from "../../components/common/Loader"
import "../../styles/globals.css";

const CertificateView = () => {
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const { id } = useParams()

  useEffect(() => {
    fetchCertificate()
  }, [id])

  const fetchCertificate = async () => {
    setLoading(true)
    try {
      const response = await certificatesAPI.getCertificate(id)
      setCertificate(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching certificate:", error)
      toast.error("Failed to load certificate")
      setLoading(false)
    }
  }

  const handleDownload = async () => {
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

  if (!certificate) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Certificate not found</div>
        <Link to="/certificates" className="btn btn-primary mt-3">
          Back to Certificates
        </Link>
      </div>
    )
  }

  return (
    <div className="certificate-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Certificate</h1>
        <div>
          <button className="btn btn-primary me-2" onClick={handleDownload} disabled={downloadLoading}>
            {downloadLoading ? "Downloading..." : "Download PDF"}
          </button>
          <Link to="/certificates" className="btn btn-secondary">
            Back to Certificates
          </Link>
        </div>
      </div>

      <div className="certificate">
        <div className="certificate-header">
          <div className="certificate-title">Certificate of Completion</div>
          <div className="certificate-subtitle">This certifies that</div>
        </div>

        <div className="certificate-content">
          <div className="certificate-name">{certificate.student.name}</div>
          <div className="certificate-text">has successfully completed the exam</div>
          <div className="certificate-exam">{certificate.exam.title}</div>
          <div className="certificate-text">with a score of {certificate.score}%</div>
          <div className="certificate-date">Issued on {formatDate(certificate.issueDate)}</div>
        </div>

        <div className="certificate-footer">
          <div className="certificate-signature">
            <div className="signature-line"></div>
            <div className="signature-name">{certificate.metadata?.authorizedBy || "Exam Administrator"}</div>
            <div className="signature-title">{certificate.metadata?.institution || "Online Exam Platform"}</div>
          </div>
        </div>

        <div className="certificate-seal">CERTIFIED</div>

        <div className="certificate-number">Certificate Number: {certificate.certificateNumber}</div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h3 className="card-title">Certificate Details</h3>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Certificate Number:</strong> {certificate.certificateNumber}
              </p>
              <p>
                <strong>Issue Date:</strong> {formatDate(certificate.issueDate)}
              </p>
              {certificate.expiryDate && (
                <p>
                  <strong>Expiry Date:</strong> {formatDate(certificate.expiryDate)}
                </p>
              )}
              <p>
                <strong>Status:</strong> {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Exam:</strong> {certificate.exam.title}
              </p>
              <p>
                <strong>Score:</strong> {certificate.score}%
              </p>
              <p>
                <strong>Template:</strong>{" "}
                {certificate.templateUsed.charAt(0).toUpperCase() + certificate.templateUsed.slice(1)}
              </p>
              <p>
                <strong>Verification URL:</strong>
                <a href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                  Verify Certificate
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateView


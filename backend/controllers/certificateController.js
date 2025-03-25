const Certificate = require("../models/Certificate")
const Submission = require("../models/Submission")
const Exam = require("../models/Exam")
const User = require("../models/User")
const { generateCertificate } = require("../utils/pdfGenerator")
const emailService = require("../utils/emailService")
const keys = require("../config/keys")

/**
 * @desc    Get all certificates (admin only)
 * @route   GET /api/certificates
 * @access  Private/Admin
 */
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("exam", "title category")
      .populate("student", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Get certificates for the logged-in user
 * @route   GET /api/certificates/user
 * @access  Private
 */
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("exam", "title category")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Get single certificate
 * @route   GET /api/certificates/:id
 * @access  Private
 */
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("exam")
      .populate("student")
      .populate("submission")

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    // Check if user has access to this certificate
    if (req.user.role === "student" && certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this certificate",
      })
    }

    // If user is examiner, check if they created the exam
    if (req.user.role === "examiner" && certificate.exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this certificate",
      })
    }

    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Generate certificate for a submission
 * @route   POST /api/certificates
 * @access  Private
 */
exports.generateCertificate = async (req, res) => {
  try {
    const { submissionId } = req.body

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide submission ID",
      })
    }

    // Check if submission exists and is completed
    const submission = await Submission.findById(submissionId)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Check if user owns this submission
    if (submission.student.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to generate certificate for this submission",
      })
    }

    // Check if submission is completed and passed
    if (!submission.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate certificate for incomplete submission",
      })
    }

    if (!submission.isPassed) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate certificate for failed submission",
      })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ submission: submissionId })

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already exists",
        data: existingCertificate,
      })
    }

    // Get exam and student details
    const exam = await Exam.findById(submission.exam).populate("createdBy", "name")
    const student = await User.findById(submission.student)

    if (!exam || !student) {
      return res.status(404).json({
        success: false,
        message: "Exam or student not found",
      })
    }

    // Calculate score percentage
    const scorePercentage = Math.round((submission.totalScore / exam.totalMarks) * 100)

    // Generate certificate PDF
    const pdfData = await generateCertificate({
      certificateNumber: "TEMP-" + Date.now(), // Will be replaced by pre-save hook
      studentName: student.name,
      examTitle: exam.title,
      issueDate: new Date().toLocaleDateString(),
      score: submission.totalScore,
      totalMarks: exam.totalMarks,
      institution: student.institution || "Online Exam Platform",
      authorizedBy: exam.createdBy.name || "Exam Administrator",
      templateName: exam.certificateTemplate,
    })

    // Create certificate record
    const certificate = await Certificate.create({
      exam: exam._id,
      student: student._id,
      submission: submission._id,
      issueDate: new Date(),
      templateUsed: exam.certificateTemplate,
      score: scorePercentage,
      fileUrl: `${keys.SERVER_URL}/api/certificates/${submission._id}/download`,
      verificationUrl: `${keys.CLIENT_URL}/verify-certificate`,
      status: "active",
      metadata: {
        institution: student.institution || "Online Exam Platform",
        courseName: exam.title,
        grade: scorePercentage >= 90 ? "A" : scorePercentage >= 80 ? "B" : scorePercentage >= 70 ? "C" : "D",
        authorizedBy: exam.createdBy.name || "Exam Administrator",
      },
    })

    console.log(`Certificate created with number: ${certificate.certificateNumber}`)

    // Update submission with certificate ID
    submission.certificateId = certificate._id
    await submission.save()

    // Send certificate email
    try {
      await emailService.sendCertificateEmail({
        to: student.email,
        userName: student.name,
        examTitle: exam.title,
        certificateUrl: certificate.fileUrl,
        verificationUrl: certificate.verificationUrl,
        certificatePdf: pdfData,
      })
    } catch (emailError) {
      console.error("Error sending certificate email:", emailError)
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    console.error("Error generating certificate:", error)
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    })
  }
}

/**
 * @desc    Download certificate PDF
 * @route   GET /api/certificates/:id/download
 * @access  Private
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("exam")
      .populate("student")
      .populate("submission")

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    // Check if user has access to this certificate
    if (req.user.role === "student" && certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this certificate",
      })
    }

    // Get the exam creator's name
    const examCreator = await User.findById(certificate.exam.createdBy)
    const authorizedBy = examCreator ? examCreator.name : "Exam Administrator"

    // Generate PDF
    const pdfData = await generateCertificate({
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.student.name,
      examTitle: certificate.exam.title,
      issueDate: new Date(certificate.issueDate).toLocaleDateString(),
      score: certificate.submission.totalScore,
      totalMarks: certificate.exam.totalMarks,
      institution: certificate.student.institution || "Online Exam Platform",
      authorizedBy: authorizedBy,
      templateName: certificate.templateUsed,
    })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=Certificate-${certificate._id}.pdf`)

    // Send PDF
    res.send(pdfData)
  } catch (error) {
    console.error("Error downloading certificate:", error)
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    })
  }
}

/**
 * @desc    Verify certificate by number
 * @route   GET /api/certificates/verify/:certificateNumber
 * @access  Public
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateNumber: req.params.certificateNumber,
    })
      .populate("exam", "title category")
      .populate("student", "name")

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.student.name,
        examTitle: certificate.exam.title,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
      },
    })
  } catch (error) {
    console.error("Error verifying certificate:", error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

/**
 * @desc    Revoke certificate
 * @route   PUT /api/certificates/:id/revoke
 * @access  Private/Admin
 */
exports.revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    // Update certificate status
    certificate.status = "revoked"
    await certificate.save()

    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    console.error("Error revoking certificate:", error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}


const Exam = require("../models/Exam")
const Question = require("../models/Question")

/**
 * @desc    Get all exams (for examiners/admins)
 * @route   GET /api/exams
 * @access  Private/Examiner/Admin
 */
exports.getExams = async (req, res) => {
  try {
    // For examiners, only return their own exams
    // For admins, return all exams
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id }

    const exams = await Exam.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
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
 * @desc    Get available exams (for students)
 * @route   GET /api/exams/available
 * @access  Public
 */
exports.getAvailableExams = async (req, res) => {
  try {
    const now = new Date()

    const exams = await Exam.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: "published",
    })
      .populate("createdBy", "name")
      .sort({ startDate: 1 })

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
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
 * @desc    Get upcoming exams
 * @route   GET /api/exams/upcoming
 * @access  Public
 */
exports.getUpcomingExams = async (req, res) => {
  try {
    const now = new Date()

    const exams = await Exam.find({
      startDate: { $gt: now },
      status: "published",
    })
      .populate("createdBy", "name")
      .sort({ startDate: 1 })

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
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
 * @desc    Get past exams
 * @route   GET /api/exams/past
 * @access  Public
 */
exports.getPastExams = async (req, res) => {
  try {
    const now = new Date()

    const exams = await Exam.find({
      endDate: { $lt: now },
      status: "published",
    })
      .populate("createdBy", "name")
      .sort({ endDate: -1 })

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
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
 * @desc    Get single exam
 * @route   GET /api/exams/:id
 * @access  Private
 */
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("createdBy", "name email").populate("questions")

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Check if user has access to this exam
    if (req.user.role === "student" && exam.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this exam",
      })
    }

    // If user is examiner, check if they created the exam
    if (req.user.role === "examiner" && exam.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this exam",
      })
    }

    res.status(200).json({
      success: true,
      data: exam,
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
 * @desc    Create new exam
 * @route   POST /api/exams
 * @access  Private/Examiner/Admin
 */
exports.createExam = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id

    // Create exam
    const exam = await Exam.create(req.body)

    res.status(201).json({
      success: true,
      data: exam,
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
 * @desc    Update exam
 * @route   PUT /api/exams/:id
 * @access  Private/Examiner/Admin
 */
exports.updateExam = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Make sure user is exam creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this exam",
      })
    }

    // Update exam
    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: exam,
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
 * @desc    Delete exam
 * @route   DELETE /api/exams/:id
 * @access  Private/Examiner/Admin
 */
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Make sure user is exam creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this exam",
      })
    }

    await exam.deleteOne()

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
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
 * @desc    Publish exam
 * @route   PUT /api/exams/:id/publish
 * @access  Private/Examiner/Admin
 */
exports.publishExam = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Make sure user is exam creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to publish this exam",
      })
    }

    // Check if exam has questions
    if (exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish exam without questions",
      })
    }

    // Update exam status to published
    exam = await Exam.findByIdAndUpdate(req.params.id, { status: "published" }, { new: true })

    res.status(200).json({
      success: true,
      data: exam,
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
 * @desc    Archive exam
 * @route   PUT /api/exams/:id/archive
 * @access  Private/Examiner/Admin
 */
exports.archiveExam = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Make sure user is exam creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this exam",
      })
    }

    // Update exam status to archived
    exam = await Exam.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true })

    res.status(200).json({
      success: true,
      data: exam,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}


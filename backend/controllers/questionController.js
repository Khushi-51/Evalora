const Question = require("../models/Question")
const Exam = require("../models/Exam")

/**
 * @desc    Get all questions
 * @route   GET /api/questions
 * @access  Private/Examiner/Admin
 */
exports.getQuestions = async (req, res) => {
  try {
    // For examiners, only return their own questions
    // For admins, return all questions
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id }

    const questions = await Question.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
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
 * @desc    Get single question
 * @route   GET /api/questions/:id
 * @access  Private/Examiner/Admin
 */
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("createdBy", "name email")

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      })
    }

    // Make sure user is question creator or admin
    if (question.createdBy._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this question",
      })
    }

    res.status(200).json({
      success: true,
      data: question,
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
 * @desc    Create new question
 * @route   POST /api/questions
 * @access  Private/Examiner/Admin
 */
exports.createQuestion = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id

    // Create question
    const question = await Question.create(req.body)

    res.status(201).json({
      success: true,
      data: question,
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
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private/Examiner/Admin
 */
exports.updateQuestion = async (req, res) => {
  try {
    let question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      })
    }

    // Make sure user is question creator or admin
    if (question.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this question",
      })
    }

    // Update question
    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: question,
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
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private/Examiner/Admin
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      })
    }

    // Make sure user is question creator or admin
    if (question.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this question",
      })
    }

    // Check if question is used in any exam
    const exams = await Exam.find({ questions: req.params.id })
    if (exams.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete question that is used in exams",
      })
    }

    await question.deleteOne()

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
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
 * @desc    Get questions for an exam
 * @route   GET /api/questions/exam/:examId
 * @access  Private
 */
exports.getExamQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)

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
    if (req.user.role === "examiner" && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this exam",
      })
    }

    // Get questions for the exam
    const questions = await Question.find({ _id: { $in: exam.questions } })

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}


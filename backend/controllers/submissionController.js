const Submission = require("../models/Submission")
const Exam = require("../models/Exam")
const Question = require("../models/Question")
const User = require("../models/User")

/**
 * @desc    Get all submissions (for examiners/admins)
 * @route   GET /api/submissions
 * @access  Private/Examiner/Admin
 */
exports.getSubmissions = async (req, res) => {
  try {
    let filter = {}

    // For examiners, only return submissions for exams they created
    if (req.user.role === "examiner") {
      // First get all exams created by this examiner
      const exams = await Exam.find({ createdBy: req.user.id })
      const examIds = exams.map((exam) => exam._id)

      // Then filter submissions by these exam IDs
      filter = { exam: { $in: examIds } }
    }

    const submissions = await Submission.find(filter)
      .populate("exam", "title category")
      .populate("student", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
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
 * @desc    Get submissions for a specific exam
 * @route   GET /api/submissions/exam/:examId
 * @access  Private/Examiner/Admin
 */
exports.getExamSubmissions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Check if user has access to this exam
    if (req.user.role === "examiner" && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access submissions for this exam",
      })
    }

    const submissions = await Submission.find({ exam: req.params.examId })
      .populate("student", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
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
 * @desc    Get submissions for the logged-in user
 * @route   GET /api/submissions/user
 * @access  Private
 */
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate("exam", "title category totalMarks passingScore")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
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
 * @desc    Get single submission
 * @route   GET /api/submissions/:id
 * @access  Private
 */
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("exam").populate("student").populate({
      path: "answers.question",
      model: "Question",
    })

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Check if user has access to this submission
    if (req.user.role === "student" && submission.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this submission",
      })
    }

    // If user is examiner, check if they created the exam
    if (req.user.role === "examiner" && submission.exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this submission",
      })
    }

    res.status(200).json({
      success: true,
      data: submission,
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
 * @desc    Create new submission (start exam)
 * @route   POST /api/submissions
 * @access  Private
 */
exports.createSubmission = async (req, res) => {
  try {
    const { exam } = req.body

    if (!exam) {
      return res.status(400).json({
        success: false,
        message: "Please provide exam ID",
      })
    }

    // Check if exam exists
    const examData = await Exam.findById(exam)

    if (!examData) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Check if exam is published
    if (examData.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Exam is not available",
      })
    }

    // Check if exam is within the valid date range
    const now = new Date()
    if (now < new Date(examData.startDate) || now > new Date(examData.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Exam is not currently active",
      })
    }

    // Check if user has already completed the maximum allowed attempts
    const existingSubmissions = await Submission.find({
      exam,
      student: req.user.id,
      isCompleted: true,
    })

    const maxAttempts = examData.allowReattempt ? examData.reattemptCount + 1 : 1

    if (existingSubmissions.length >= maxAttempts) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts reached for this exam",
      })
    }

    // Check if there's an incomplete submission
    const incompleteSubmission = await Submission.findOne({
      exam,
      student: req.user.id,
      isCompleted: false,
    })

    if (incompleteSubmission) {
      return res.status(200).json({
        success: true,
        message: "Continuing existing submission",
        data: incompleteSubmission,
      })
    }

    // Create new submission
    const submission = await Submission.create({
      exam,
      student: req.user.id,
      startTime: new Date(),
      attemptNumber: existingSubmissions.length + 1,
      passingScore: examData.passingScore,
      submissionStatus: "in_progress",
    })

    res.status(201).json({
      success: true,
      data: submission,
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
 * @desc    Save answer during exam
 * @route   POST /api/submissions/:id/answer
 * @access  Private
 */
exports.saveAnswer = async (req, res) => {
  try {
    const { question, selectedOptions, textAnswer, codeAnswer } = req.body

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please provide question ID",
      })
    }

    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Check if user owns this submission
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this submission",
      })
    }

    // Check if submission is still in progress
    if (submission.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed submission",
      })
    }

    // Find if answer already exists
    const answerIndex = submission.answers.findIndex((a) => a.question.toString() === question)

    if (answerIndex > -1) {
      // Update existing answer
      submission.answers[answerIndex].selectedOptions = selectedOptions || []
      submission.answers[answerIndex].textAnswer = textAnswer || ""
      submission.answers[answerIndex].codeAnswer = codeAnswer || ""
    } else {
      // Add new answer
      submission.answers.push({
        question,
        selectedOptions: selectedOptions || [],
        textAnswer: textAnswer || "",
        codeAnswer: codeAnswer || "",
      })
    }

    await submission.save()

    res.status(200).json({
      success: true,
      message: "Answer saved successfully",
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
 * @desc    Submit exam (complete submission)
 * @route   PUT /api/submissions/:id/submit
 * @access  Private
 */
exports.submitExam = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Check if user owns this submission
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit this exam",
      })
    }

    // Check if submission is already completed
    if (submission.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Submission is already completed",
      })
    }

    // Get exam details
    const exam = await Exam.findById(submission.exam)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Calculate time spent
    const startTime = new Date(submission.startTime)
    const endTime = new Date()
    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = Math.ceil(timeSpentMs / (1000 * 60))

    // Auto-grade objective questions (MCQ, true-false)
    let totalScore = 0

    // Get all questions for this exam
    const questions = await Question.find({ _id: { $in: exam.questions } })

    // Process each answer
    for (const answer of submission.answers) {
      const question = questions.find((q) => q._id.toString() === answer.question.toString())

      if (!question) continue

      // Grade based on question type
      if (question.type === "mcq-single" || question.type === "mcq-multiple" || question.type === "true-false") {
        // For objective questions, check if selected options match correct options
        const correctOptions = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.text)

        // For single choice, there should be exactly one selected option matching the correct one
        if (question.type === "mcq-single" || question.type === "true-false") {
          if (answer.selectedOptions.length === 1 && correctOptions.includes(answer.selectedOptions[0])) {
            answer.isCorrect = true
            answer.score = question.marks
            totalScore += question.marks
          } else {
            answer.isCorrect = false
            answer.score = 0
          }
        }
        // For multiple choice, all correct options must be selected and no incorrect ones
        else if (question.type === "mcq-multiple") {
          const allCorrectSelected = correctOptions.every((opt) => answer.selectedOptions.includes(opt))

          const noIncorrectSelected = answer.selectedOptions.every((opt) => correctOptions.includes(opt))

          if (allCorrectSelected && noIncorrectSelected) {
            answer.isCorrect = true
            answer.score = question.marks
            totalScore += question.marks
          } else {
            answer.isCorrect = false
            answer.score = 0
          }
        }
      }
      // For short-answer, check if answer matches exactly
      else if (question.type === "short-answer" && question.correctAnswer) {
        if (answer.textAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
          answer.isCorrect = true
          answer.score = question.marks
          totalScore += question.marks
        } else {
          answer.isCorrect = false
          answer.score = 0
        }
      }
      // For essay and coding questions, mark for manual grading
      else {
        answer.isCorrect = false
        answer.score = 0
      }
    }

    // Calculate if passed
    const percentageScore = (totalScore / exam.totalMarks) * 100
    const isPassed = percentageScore >= exam.passingScore

    // Update submission
    submission.isCompleted = true
    submission.endTime = endTime
    submission.timeSpent = timeSpentMinutes
    submission.totalScore = totalScore
    submission.isPassed = isPassed

    // Set submission status based on if manual grading is needed
    const needsManualGrading = submission.answers.some((answer) => {
      const question = questions.find((q) => q._id.toString() === answer.question.toString())
      return question && (question.type === "essay" || question.type === "coding")
    })

    submission.submissionStatus = needsManualGrading ? "submitted_for_review" : "graded"

    await submission.save()

    res.status(200).json({
      success: true,
      data: submission,
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
 * @desc    Grade submission (for subjective questions)
 * @route   PUT /api/submissions/:id/grade
 * @access  Private/Examiner/Admin
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { answers } = req.body

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Please provide answers to grade",
      })
    }

    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Check if submission is completed
    if (!submission.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot grade incomplete submission",
      })
    }

    // Get exam details
    const exam = await Exam.findById(submission.exam)

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      })
    }

    // Check if user has permission to grade this submission
    if (req.user.role === "examiner" && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to grade this submission",
      })
    }

    // Update scores for each answer
    let totalScore = 0

    for (const gradedAnswer of answers) {
      const answerIndex = submission.answers.findIndex((a) => a.question.toString() === gradedAnswer.questionId)

      if (answerIndex > -1) {
        submission.answers[answerIndex].score = gradedAnswer.score || 0
        submission.answers[answerIndex].feedback = gradedAnswer.feedback || ""
        submission.answers[answerIndex].gradedBy = req.user.id
        submission.answers[answerIndex].gradedAt = new Date()

        totalScore += gradedAnswer.score || 0
      }
    }

    // Calculate if passed
    const percentageScore = (totalScore / exam.totalMarks) * 100
    const isPassed = percentageScore >= exam.passingScore

    // Update submission
    submission.totalScore = totalScore
    submission.isPassed = isPassed
    submission.submissionStatus = "graded"

    await submission.save()

    res.status(200).json({
      success: true,
      data: submission,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}


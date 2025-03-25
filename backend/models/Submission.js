const mongoose = require("mongoose")

const SubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: "Exam",
    required: true,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  passingScore: {
    type: Number,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOptions: [
        {
          type: String, // For MCQ questions
        },
      ],
      textAnswer: {
        type: String, // For essay or short-answer questions
        trim: true,
      },
      codeAnswer: {
        type: String, // For coding questions
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
      feedback: {
        type: String,
        trim: true,
      },
      aiEvaluation: {
        score: Number,
        feedback: String,
        keywordsDetected: [String],
        plagiarismScore: Number,
        confidence: Number,
      },
      gradedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      gradedAt: {
        type: Date,
      },
    },
  ],
  timeSpent: {
    type: Number, // Time spent in minutes
    default: 0,
  },
  attemptNumber: {
    type: Number,
    default: 1,
  },
  certificateId: {
    type: mongoose.Schema.ObjectId,
    ref: "Certificate",
  },
  proctoringFlags: [
    {
      flagType: {
        type: String,
        enum: ["face_missing", "multiple_faces", "tab_switch", "prohibited_object", "suspicious_activity"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: {
        type: String,
      },
      screenshotUrl: {
        type: String, // URL to screenshot evidence if available
      },
    },
  ],
  submissionStatus: {
    type: String,
    enum: ["in_progress", "completed", "timed_out", "submitted_for_review", "graded", "under_review"],
    default: "in_progress",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add compound index for student + exam (to find a student's submission for a specific exam)
SubmissionSchema.index({ student: 1, exam: 1 })
// Add index for finding all submissions for an exam
SubmissionSchema.index({ exam: 1 })
// Add index for finding all submissions by a student
SubmissionSchema.index({ student: 1 })
// Add index for finding submissions by status
SubmissionSchema.index({ submissionStatus: 1 })

module.exports = mongoose.model("Submission", SubmissionSchema)


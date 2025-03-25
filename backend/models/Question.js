const mongoose = require("mongoose")

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please add question text"],
    trim: true,
  },
  type: {
    type: String,
    required: [true, "Please specify question type"],
    enum: ["mcq-single", "mcq-multiple", "true-false", "short-answer", "essay", "coding"],
  },
  options: [
    {
      text: {
        type: String,
        trim: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  correctAnswer: {
    type: String, // Used for short-answer type questions
    trim: true,
  },
  marks: {
    type: Number,
    required: [true, "Please specify the marks for this question"],
    min: [0, "Marks cannot be negative"],
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  explanation: {
    type: String,
    trim: true,
  },
  tags: [String],
  category: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL to image if question includes an image
  },
  code: {
    type: String, // For coding questions or questions that include code snippets
  },
  codeLanguage: {
    type: String, // For coding questions (e.g., 'javascript', 'python', etc.)
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  // Additional fields for AI-assisted grading
  gradingCriteria: {
    type: String,
    trim: true,
  },
  keywordExpectations: [String], // Keywords expected in subjective answers
  plagiarismThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80, // Percentage similarity to flag for plagiarism
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add indexes for common queries
QuestionSchema.index({ type: 1 })
QuestionSchema.index({ difficulty: 1 })
QuestionSchema.index({ tags: 1 })
QuestionSchema.index({ createdBy: 1 })

module.exports = mongoose.model("Question", QuestionSchema)


const mongoose = require("mongoose")

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  duration: {
    type: Number, // duration in minutes
    required: [true, "Please specify the exam duration"],
  },
  passingScore: {
    type: Number,
    required: [true, "Please specify the passing score"],
    min: [0, "Passing score cannot be negative"],
    max: [100, "Passing score cannot exceed 100"],
  },
  totalMarks: {
    type: Number,
    required: [true, "Please specify the total marks"],
  },
  startDate: {
    type: Date,
    required: [true, "Please specify the exam start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please specify the exam end date"],
  },
  instructions: {
    type: String,
    required: [true, "Please add exam instructions"],
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Question",
    },
  ],
  randomizeQuestions: {
    type: Boolean,
    default: true,
  },
  showResultsInstantly: {
    type: Boolean,
    default: false,
  },
  allowReattempt: {
    type: Boolean,
    default: false,
  },
  reattemptCount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, "Please specify a category"],
    enum: ["Technical", "Academic", "Professional", "Certification", "Other"],
  },
  certificateTemplate: {
    type: String,
    default: "default", // Default certificate template
  },
  isProctored: {
    type: Boolean,
    default: false,
  },
  proctoringSettings: {
    detectFaces: { type: Boolean, default: true },
    detectObjects: { type: Boolean, default: true },
    recordScreen: { type: Boolean, default: false },
    recordWebcam: { type: Boolean, default: false },
    preventTabSwitching: { type: Boolean, default: true },
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add indexes for common queries
ExamSchema.index({ startDate: 1, endDate: 1, status: 1 })
ExamSchema.index({ category: 1 })
ExamSchema.index({ createdBy: 1 })

module.exports = mongoose.model("Exam", ExamSchema)


const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const submissionController = require("../controllers/submissionController")

// Protected routes (all roles)
router.get("/user", protect, submissionController.getUserSubmissions)
router.get("/:id", protect, submissionController.getSubmission)
router.post("/", protect, submissionController.createSubmission)
router.post("/:id/answer", protect, submissionController.saveAnswer)
router.put("/:id/submit", protect, submissionController.submitExam)

// Examiner and admin routes
router.get("/", protect, authorize("examiner", "admin"), submissionController.getSubmissions)
router.get("/exam/:examId", protect, authorize("examiner", "admin"), submissionController.getExamSubmissions)
router.put("/:id/grade", protect, authorize("examiner", "admin"), submissionController.gradeSubmission)

module.exports = router


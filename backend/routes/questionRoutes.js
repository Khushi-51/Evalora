const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const questionController = require("../controllers/questionController")

// Protected routes (all roles)
router.get("/exam/:examId", protect, questionController.getExamQuestions)

// Examiner and admin routes
router.get("/", protect, authorize("examiner", "admin"), questionController.getQuestions)
router.get("/:id", protect, authorize("examiner", "admin"), questionController.getQuestion)
router.post("/", protect, authorize("examiner", "admin"), questionController.createQuestion)
router.put("/:id", protect, authorize("examiner", "admin"), questionController.updateQuestion)
router.delete("/:id", protect, authorize("examiner", "admin"), questionController.deleteQuestion)

module.exports = router


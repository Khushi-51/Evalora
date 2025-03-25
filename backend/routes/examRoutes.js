const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const examController = require("../controllers/examController")

// Public routes
router.get("/available", examController.getAvailableExams)
router.get("/upcoming", examController.getUpcomingExams)
router.get("/past", examController.getPastExams)

// Protected routes (all roles)
router.get("/:id", protect, examController.getExam)

// Examiner and admin routes
router.get("/", protect, authorize("examiner", "admin"), examController.getExams)
router.post("/", protect, authorize("examiner", "admin"), examController.createExam)
router.put("/:id", protect, authorize("examiner", "admin"), examController.updateExam)
router.delete("/:id", protect, authorize("examiner", "admin"), examController.deleteExam)
router.put("/:id/publish", protect, authorize("examiner", "admin"), examController.publishExam)
router.put("/:id/archive", protect, authorize("examiner", "admin"), examController.archiveExam)

module.exports = router


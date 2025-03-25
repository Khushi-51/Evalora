const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const certificateController = require("../controllers/certificateController")

// Public routes
router.get("/verify/:certificateNumber", certificateController.verifyCertificate)

// Protected routes (all roles)
router.get("/user", protect, certificateController.getUserCertificates)
router.get("/:id", protect, certificateController.getCertificate)
router.get("/:id/download", protect, certificateController.downloadCertificate)
router.post("/", protect, certificateController.generateCertificate)

// Admin routes
router.get("/", protect, authorize("admin"), certificateController.getAllCertificates)
router.put("/:id/revoke", protect, authorize("admin"), certificateController.revokeCertificate)

module.exports = router


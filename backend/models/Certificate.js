const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
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
  submission: {
    type: mongoose.Schema.ObjectId,
    ref: "Submission",
    required: true,
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  templateUsed: {
    type: String,
    default: "default",
  },
  score: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  verificationUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "expired", "revoked"],
    default: "active",
  },
  metadata: {
    institution: String,
    courseName: String,
    grade: String,
    authorizedBy: String,
    customFields: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for common queries
CertificateSchema.index({ certificateNumber: 1 }, { unique: true });
CertificateSchema.index({ student: 1 });
CertificateSchema.index({ exam: 1 });
CertificateSchema.index({ status: 1 });

// 🔥 Use `pre("validate")` instead of `pre("save")`
CertificateSchema.pre("validate", async function (next) {
  if (!this.certificateNumber) {
    // Generate a unique certificate number
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    this.certificateNumber = `CERT-${year}-${randomDigits}`;

    console.log(`Generated certificate number: ${this.certificateNumber}`);

    // Check uniqueness
    const existingCert = await this.constructor.findOne({ certificateNumber: this.certificateNumber });
    if (existingCert) {
      console.log(`Duplicate certificate number found: ${this.certificateNumber}, regenerating...`);
      return this.pre("validate", next); // Regenerate if duplicate
    }
  }
  next();
});

module.exports = mongoose.model("Certificate", CertificateSchema);

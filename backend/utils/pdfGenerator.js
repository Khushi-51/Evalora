const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

/**
 * Generate a certificate in PDF format
 * @param {Object} data - Certificate data
 * @param {String} data.certificateNumber - Unique certificate number
 * @param {String} data.studentName - Name of the student
 * @param {String} data.examTitle - Title of the exam
 * @param {String} data.issueDate - Date of certificate issuance
 * @param {String} data.score - Score achieved
 * @param {String} data.totalMarks - Total possible marks
 * @param {String} data.institution - Institution name
 * @param {String} [data.authorizedBy] - Name of authorizing person
 * @param {String} [data.templateName] - Template name (default, gold, blue, etc.)
 * @returns {Promise<Buffer>} - PDF document as a buffer
 */
const generateCertificate = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 0,
        info: {
          Title: `Certificate - ${data.examTitle}`,
          Author: data.institution,
          Subject: "Certification of Completion",
          Keywords: "certificate, exam, completion",
          CreationDate: new Date(),
        },
      })

      // Buffer to store PDF
      const buffers = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Certificate styling based on template
      const templateName = data.templateName || "default"
      const templateStyles = getTemplateStyles(templateName)

      // Add background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(templateStyles.backgroundColor)

      // Add border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .stroke(templateStyles.borderColor)

      // Add header
      doc
        .fontSize(30)
        .font("Helvetica-Bold")
        .fillColor(templateStyles.headerColor)
        .text("CERTIFICATE OF COMPLETION", { align: "center" })
        .moveDown(0.5)

      // Add certificate content
      doc
        .fontSize(16)
        .font("Helvetica")
        .fillColor(templateStyles.textColor)
        .text("This is to certify that", { align: "center" })
        .moveDown(0.5)

      // Student name
      doc
        .fontSize(30)
        .font("Helvetica-Bold")
        .fillColor(templateStyles.nameColor)
        .text(data.studentName, { align: "center" })
        .moveDown(0.5)

      // Completion text
      doc
        .fontSize(16)
        .font("Helvetica")
        .fillColor(templateStyles.textColor)
        .text(`has successfully completed the exam`, { align: "center" })
        .moveDown(0.2)

      // Exam title
      doc
        .fontSize(20)
        .font("Helvetica-BoldOblique")
        .fillColor(templateStyles.examTitleColor)
        .text(`"${data.examTitle}"`, { align: "center" })
        .moveDown(0.5)

      // Score information
      doc
        .fontSize(16)
        .font("Helvetica")
        .fillColor(templateStyles.textColor)
        .text(`with a score of ${data.score} out of ${data.totalMarks}`, { align: "center" })
        .moveDown(2)

      // Date and signature row
      doc.fontSize(12).font("Helvetica").fillColor(templateStyles.textColor)

      // Organization details on left
      doc.text(data.institution, 100, 400, { align: "left", width: 200 })

      // Date on right
      doc.text(`Issue Date: ${data.issueDate}`, doc.page.width - 300, 400, { align: "right", width: 200 })

      // Certificate number
      doc.fontSize(10).text(`Certificate Number: ${data.certificateNumber}`, 100, 450, { align: "left" })

      // Verification text
      doc
        .fontSize(8)
        .text("This certificate can be verified online at our verification portal.", 100, 470, { align: "left" })

      // Authorized signature if available
      if (data.authorizedBy) {
        doc
          .fontSize(12)
          .text(`Authorized by: ${data.authorizedBy}`, doc.page.width - 300, 450, { align: "right", width: 200 })
      }

      // Finalize the PDF
      doc.end()
    } catch (error) {
      console.error("Error generating certificate PDF:", error)
      reject(error)
    }
  })
}

/**
 * Get styling information based on template name
 * @param {String} templateName - Template name
 * @returns {Object} - Template styling object
 */
const getTemplateStyles = (templateName) => {
  const templates = {
    default: {
      backgroundColor: "#FFFFFF",
      borderColor: "#000000",
      headerColor: "#333333",
      textColor: "#333333",
      nameColor: "#0066CC",
      examTitleColor: "#006633",
    },
    gold: {
      backgroundColor: "#FFFDF0",
      borderColor: "#D4AF37",
      headerColor: "#B8860B",
      textColor: "#333333",
      nameColor: "#B8860B",
      examTitleColor: "#B8860B",
    },
    blue: {
      backgroundColor: "#F0F8FF",
      borderColor: "#4169E1",
      headerColor: "#00008B",
      textColor: "#333333",
      nameColor: "#0000CD",
      examTitleColor: "#4169E1",
    },
    professional: {
      backgroundColor: "#FFFFFF",
      borderColor: "#2F4F4F",
      headerColor: "#2F4F4F",
      textColor: "#2F4F4F",
      nameColor: "#2F4F4F",
      examTitleColor: "#2F4F4F",
    },
  }

  return templates[templateName] || templates.default
}

module.exports = {
  generateCertificate,
}


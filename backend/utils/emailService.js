const nodemailer = require("nodemailer")
const keys = require("../config/keys")

/**
 * Create a reusable transporter object using SMTP transport
 */
const createTransporter = () => {
  // Check if email configuration is available
  if (!keys.EMAIL_SERVICE || !keys.EMAIL_USERNAME || !keys.EMAIL_PASSWORD) {
    console.warn("Email configuration is missing. Email functionality will be limited.")
    return null
  }

  return nodemailer.createTransport({
    service: keys.EMAIL_SERVICE,
    auth: {
      user: keys.EMAIL_USERNAME,
      pass: keys.EMAIL_PASSWORD,
    },
  })
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text version of email
 * @param {String} options.html - HTML version of email
 * @param {Array} [options.attachments] - Email attachments
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter()

    // If transporter is null, log a message and return
    if (!transporter) {
      console.log(`Email would have been sent to: ${options.to}, Subject: ${options.subject}`)
      return { messageId: "email-service-not-configured" }
    }

    // Define email options
    const mailOptions = {
      from: `Online Exam Platform <${keys.EMAIL_FROM || "noreply@example.com"}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
      attachments: options.attachments || [],
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`Error sending email: ${error.message}`)
    throw error
  }
}

/**
 * Send a certificate email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.userName - User name
 * @param {String} options.examTitle - Exam title
 * @param {String} options.certificateUrl - Certificate download URL
 * @param {String} options.verificationUrl - Certificate verification URL
 * @param {Buffer} options.certificatePdf - Certificate PDF buffer
 */
const sendCertificateEmail = async (options) => {
  const subject = `Your Certificate for ${options.examTitle}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations, ${options.userName}!</h2>
      <p>You have successfully completed the exam: <strong>${options.examTitle}</strong></p>
      <p>Your certificate is attached to this email and can also be downloaded from your dashboard.</p>
      <p>To verify the authenticity of your certificate, please visit: <a href="${options.verificationUrl}">${options.verificationUrl}</a></p>
      <div style="margin: 30px 0;">
        <a href="${options.certificateUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Download Certificate</a>
      </div>
      <p>Thank you for using our platform!</p>
      <p>Best regards,<br>Online Exam Platform Team</p>
    </div>
  `

  return sendEmail({
    to: options.to,
    subject,
    html,
    attachments: [
      {
        filename: `Certificate_${options.examTitle.replace(/\s+/g, "_")}.pdf`,
        content: options.certificatePdf,
        contentType: "application/pdf",
      },
    ],
  })
}

/**
 * Send exam invitation email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.userName - User name
 * @param {String} options.examTitle - Exam title
 * @param {String} options.examDate - Formatted exam date
 * @param {String} options.examDuration - Exam duration
 * @param {String} options.examUrl - Exam URL
 */
const sendExamInvitation = async (options) => {
  const subject = `Invitation to Exam: ${options.examTitle}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello, ${options.userName}!</h2>
      <p>You have been invited to take the following exam:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${options.examTitle}</h3>
        <p><strong>Date:</strong> ${options.examDate}</p>
        <p><strong>Duration:</strong> ${options.examDuration}</p>
      </div>
      <p>Please click the button below to access the exam:</p>
      <div style="margin: 30px 0;">
        <a href="${options.examUrl}" style="background-color: #4285F4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Go to Exam</a>
      </div>
      <p>Please ensure you have a stable internet connection and are ready before starting the exam.</p>
      <p>Best regards,<br>Online Exam Platform Team</p>
    </div>
  `

  return sendEmail({
    to: options.to,
    subject,
    html,
  })
}

module.exports = {
  sendEmail,
  sendCertificateEmail,
  sendExamInvitation,
}


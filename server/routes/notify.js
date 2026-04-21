import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create a Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// POST /api/notify/session — send email when a session is requested
router.post('/session', async (req, res) => {
  const { mentorName, mentorTitle, userName, userEmail, message } = req.body;

  if (!mentorName || !userName) {
    return res.status(400).json({ error: 'mentorName and userName are required.' });
  }

  const mailOptions = {
    from: `"Nexus Mentorship" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send notifications to your own email
    subject: `🚀 New Session Request — ${userName} → ${mentorName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2c3e50, #3498db); padding: 25px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📋 New Mentorship Session Request</h1>
        </div>
        <div style="background: #ffffff; padding: 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; width: 140px;">Mentor:</td>
              <td style="padding: 10px; color: #333;">${mentorName} — ${mentorTitle || 'Mentor'}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; font-weight: bold; color: #555;">Requested By:</td>
              <td style="padding: 10px; color: #333;">${userName} (${userEmail || 'N/A'})</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Message:</td>
              <td style="padding: 10px; color: #333;">${message || '<em>No message provided</em>'}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; font-weight: bold; color: #555;">Time:</td>
              <td style="padding: 10px; color: #333;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #eaf7ea; border-radius: 6px; border-left: 4px solid #27ae60;">
            <p style="margin: 0; font-size: 13px; color: #2d6a2d;">
              ✅ This session request has been saved to the platform. Log in to your dashboard to respond.
            </p>
          </div>
        </div>
        <p style="text-align: center; color: #999; font-size: 11px; margin-top: 15px;">
          Sent from Nexus Mentorship Platform
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email notification sent!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ 
      error: 'Failed to send email notification',
      message: error.message 
    });
  }
});

export default router;

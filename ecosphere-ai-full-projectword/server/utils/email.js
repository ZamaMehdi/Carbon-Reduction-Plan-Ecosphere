// 📁 server/utils/email.js

const fs = require('fs');
const path = require('path');


require('dotenv').config();

console.log('✅ EMAIL_USER:', process.env.EMAIL_USER);
console.log('✅ EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ Loaded' : '❌ Not Loaded');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetCode = (to, code) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials missing');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'EcoSphere AI Password Reset Code',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #047857;">Password Reset Request</h2>
        <p>Your 6-digit authentication code is:</p>
        <div style="font-size: 2em; font-weight: bold; color: #047857;">${code}</div>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Email failed:', err);
    } else {
      console.log('📧 Email sent:', info.response);
    }
  });
};

const sendReportEmail = (to, filePath) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: '📄 New Report Submitted - EcoSphere AI',
      text: 'A new emissions report has been submitted. Please find the attached .docx file.',
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Failed to send report email:', err);
        return reject(err);
      } else {
        console.log('📧 Report email sent to admin:', info.response);
        return resolve(info);
      }
    });
  });
};

const sendReportEmailWithBuffer = (to, docBuffer, organisationName) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: '📄 New Report Submitted - EcoSphere AI',
      text: 'A new emissions report has been submitted. Please find the attached .docx file.',
      attachments: [
        {
          filename: `Complete_Carbon_Report_${organisationName || 'Report'}.docx`,
          content: docBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Failed to send report email:', err);
        return reject(err);
      } else {
        console.log('📧 Report email sent to admin:', info.response);
        return resolve(info);
      }
    });
  });
};


module.exports = { 
  sendPasswordResetCode,
  sendReportEmail,
  sendReportEmailWithBuffer,
};

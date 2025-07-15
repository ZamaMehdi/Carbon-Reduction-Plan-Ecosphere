const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ Loaded' : '❌ Not loaded');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'monkeydluffy0111123@gmail.com' , //process.env.OWNER_EMAIL || process.env.EMAIL_USER,
  subject: 'Test Email from EcoSphere',
  text: 'If you received this, nodemailer is working!',
}, (err, info) => {
  if (err) {
    console.error('❌ Failed to send:', err);
  } else {
    console.log('📧 Sent:', info.response);
  }
});

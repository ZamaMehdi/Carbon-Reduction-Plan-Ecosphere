const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatReportToHTML = (report) => {
  const p = (v) => (v ? parseFloat(v).toLocaleString() : '0');
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h1 style="text-align: center; color: #047857;">EcoSphere AI Carbon Reduction Plan</h1>
      <p style="text-align: center;">Report for: <strong>${report.organisationName}</strong></p>
      <hr>

      <h2>1. Report Details</h2>
      <p><strong>Publication Date:</strong> ${formatDate(report.publicationDate)}</p>

      <h2>2. Organisation Details</h2>
      <ul>
        <li><strong>Company Number:</strong> ${report.companyNumber || 'N/A'}</li>
        <li><strong>Current Head Office Address:</strong> ${report.currentAddress || 'N/A'}</li>
      </ul>

      <h2>3. Emissions Data (Annual Values)</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f0fdfa;">
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Value</th>
        </tr>
        <tr><td>Electricity Usage (kWh)</td><td>${p(report.electricityKWH)}</td></tr>
        <tr><td>Fleet Average Car (km)</td><td>${p(report.fleetAveCarKm)}</td></tr>
        <tr><td>Business Travel Taxi (km)</td><td>${p(report.businessTravelTaxiKm)}</td></tr>
        <tr><td>Home Working (Total Hours)</td><td>${p(report.homeWorkingHours)}</td></tr>
        <tr><td>Hotel Stays (Total Nights)</td><td>${p(report.hotelNights)}</td></tr>
      </table>

      <h2>4. Emissions Summary (tCO2e)</h2>
      <div style="display: flex; justify-content: space-around; text-align: center; background: #f0fdfa; padding: 10px; border-radius: 8px;">
        <div><h3>Scope 1</h3><p>${report.scope1.toFixed(2)}</p></div>
        <div><h3>Scope 2</h3><p>${report.scope2.toFixed(2)}</p></div>
        <div><h3>Scope 3</h3><p>${report.scope3.toFixed(2)}</p></div>
        <div><h3>Total Emissions</h3><p style="font-size: 1.5em;"><strong>${report.totalEmissions.toFixed(2)}</strong></p></div>
      </div>

      <h2>5. Declaration and Sign Off</h2>
      <p style="font-size: 0.8em; color: #555; border: 1px solid #eee; padding: 10px;">
        This Carbon Reduction Plan has been completed in accordance with PPN 006 and associated guidance... (and the rest of the declaration text). This Carbon Reduction Plan has been reviewed and signed off by the board of directors (or equivalent management body).
      </p>

      <hr>
      <p style="text-align: center; font-size: 0.8em; color: #777;">
        <strong>Access Code for this Report:</strong> ${report.accessCode}
      </p>
    </div>
  `;
};

const sendReportEmail = (report) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.OWNER_EMAIL) {
    console.error('Email configuration is missing. Skipping email.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: `New Carbon Report from ${report.organisationName}`,
    html: formatReportToHTML(report),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info.response);
  });
};

const sendPasswordResetCode = (to, code) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration is missing. Skipping email.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'EcoSphere AI Password Reset Code',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #047857;">Password Reset Request</h2>
      <p>We received a request to reset your EcoSphere AI account password.</p>
      <p>Your 6-digit authentication code is:</p>
      <div style="font-size: 2em; font-weight: bold; letter-spacing: 0.2em; color: #047857;">${code}</div>
      <p>This code will expire in 15 minutes. If you did not request a password reset, you can ignore this email.</p>
      <hr />
      <p style="font-size: 0.9em; color: #888;">EcoSphere AI Team</p>
    </div>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending password reset email:', error);
    }
    console.log('Password reset email sent:', info.response);
  });
};

module.exports = { sendReportEmail, sendPasswordResetCode }; 
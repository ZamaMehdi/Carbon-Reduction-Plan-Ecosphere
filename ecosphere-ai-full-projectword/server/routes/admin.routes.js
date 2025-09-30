// 📁 server/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/report.model');
const User = require('../models/user.model');
const requireAuth = require('../middleware/requireAuth'); // checks req.session.userId and sets req.user
const puppeteer = require('puppeteer');

function extractSessionCookie(cookieHeader) {
  const match = cookieHeader?.match(/connect\.sid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}


// ✅ Simple admin check - in production, you might want to add proper authentication
// For now, we'll make it accessible to anyone (you can add authentication later)

// ✅ GET all users (for Admin Dashboard)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


// ✅ Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({ isDeleted: { $ne: true } })
      .select('userEmail organisationName createdAt updatedAt submitted locked accessCode')
      .sort({ updatedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});



// ✅ Unlock report
router.post('/toggle-lock/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.locked = !report.locked;
    // report.submitted = false;
    report.isDeleted = false; // ✅ Restore it if it was soft-deleted
    await report.save();

    res.json({ message: `Report ${report.locked ? 'locked' : 'unlocked'}`, locked: report.locked });

  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle lock' });
  }
});

// ✅ Delete a report
router.delete('/reports/:reportId', async (req, res) => {
  try {
await Report.findByIdAndUpdate(req.params.reportId, { isDeleted: true });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// ✅ Delete a user and their reports
router.delete('/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Report.deleteMany({ userId: req.params.userId });
    res.json({ message: 'User and reports deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// ✅ Get only submitted reports (for admin dashboard)
router.get('/submitted-reports', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = { submitted: true };
    if (!includeDeleted) filter.isDeleted = { $ne: true };

    const submittedReports = await Report.find(filter)
      .select('userEmail organisationName createdAt updatedAt submitted locked accessCode totalEmissions scope1 scope2 scope3')
      .sort({ updatedAt: -1 });    // optional: latest first
    res.json(submittedReports);
  } catch (err) {
    console.error('❌ Failed to fetch submitted reports:', err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// ✅ Admin view single report by ID
router.get('/get-report/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('❌ Failed to fetch report by ID for admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin update report by ID
router.put('/update-report/:reportId', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('❌ Failed to update report:', err);
    res.status(500).json({ message: 'Server error updating report' });
  }
});

// 📁 routes/admin.routes.js
// router.get('/download-report/:reportId', async (req, res) => {
//   try {
//     const puppeteer = require('puppeteer');
//     const browser = await puppeteer.launch({
//       headless: 'new',
//       args: ['--no-sandbox'],
//     });
//     const page = await browser.newPage();

//     const reportUrl = `${process.env.CLIENT_BASE_URL}/printable-report/${req.params.reportId}`;
//     console.log('📄 Navigating to:', reportUrl);
//     await page.goto(reportUrl, { waitUntil: 'networkidle0' });

//     // Add buffer wait
//     await new Promise(r => setTimeout(r, 2000));

//     await page.waitForSelector('.printable-report-loaded, #print-root, .report-display',{ timeout: 20000 });

//     const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
//     await browser.close();

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename=report-${req.params.reportId}.pdf`,
//     });
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('PDF generation error:', error);
//     res.status(500).send('Error generating PDF');
//   }
// });


module.exports = router;

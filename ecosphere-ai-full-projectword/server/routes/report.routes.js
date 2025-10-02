// 📁 server/routes/report.routes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/report.model');
const User = require('../models/user.model');
const requireAuth = require('../middleware/requireAuth');  // ✅ Protects routes for logged-in users only
const { generateReportDocx, generateCompleteReportDocx } = require('../utils/generateReportDocx');
// Email functionality removed



router.get('/my-report', requireAuth, async (req, res) => {
  try {
    const report = await Report.findOne({ userId: req.user._id, isDeleted: { $ne: true } })
  .sort({ updatedAt: -1 });

  console.log('👀 Report returned to frontend:', report);

    if (!report) return res.status(404).json({ message: 'No report found' });
    res.json(report);
  } catch (err) {
    console.error('❌ Error fetching user report:', err);
    res.status(500).json({ message: 'Server error' });
  }
 });

 router.get('/debug/report/:id', async (req, res) => {
  console.log('🔍 Looking for report with ID:', req.params.id);
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      console.log('❌ Report not found');
      return res.status(404).json({ message: 'Not found' });
    }
    console.log('✅ Report found:', report);
    res.json(report);
  } catch (err) {
    console.error('🔥 Error fetching report:', err);
    res.status(500).json({ message: 'Error fetching report' });
  }
 });

 router.get('/latest-report', requireAuth, async (req, res) => {
  try {
    const latestReport = await Report.findOne({
      userId: req.user._id,
      submitted: true
    }).sort({ updatedAt: -1 }); // ✅ Most recent first

    if (!latestReport) {
      return res.status(404).json({ message: 'No report found' });
    }

    res.json(latestReport);
  } catch (err) {
    console.error('❌ Error fetching latest report:', err);
    res.status(500).json({ message: 'Server error' });
  }
 });


 // 📄 server/routes/report.routes.js
 router.get('/user/reports/:id', requireAuth, async (req, res) => {
  console.log('🧪 Route HIT');
  console.log('🔍 Params:', req.params.id);
  console.log('👤 req.user:', req.user);

  try {
    if (!req.params.id) {
      console.warn('⛔ No report ID in params');
      return res.status(400).json({ message: 'Missing report ID' });
    }

    if (!req.user || !req.user._id) {
      console.warn('⛔ No authenticated user');
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      console.warn('⚠️ No report found or user mismatch');
      return res.status(404).json({ message: 'Report not found' });
    }

    console.log('✅ Report found:', report._id);
    res.json(report);
  } catch (err) {
    console.error('🔥 Server crash in report fetch:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  } 
 });



 // 📄 server/routes/report.routes.js

 // Get all submitted reports for the logged-in user (history)
 router.get('/my-history', requireAuth, async (req, res) => {
  try {
    const reports = await Report.find({
      userId: req.user._id,
      submitted: true,
    }).sort({ updatedAt: -1 }); // optional: latest first

    res.json(reports);
  } catch (err) {
    console.error('❌ Error fetching user report history:', err);
    res.status(500).json({ message: 'Server error fetching history' });
  }
 });

// Temporary route to fix reports without userId
router.post('/fix-user-links', async (req, res) => {
  try {
    // Find all reports without userId but with userEmail
    const reportsWithoutUserId = await Report.find({
      userId: { $exists: false },
      userEmail: { $exists: true }
    });

    console.log(`Found ${reportsWithoutUserId.length} reports without userId`);

    let fixedCount = 0;
    for (const report of reportsWithoutUserId) {
      // Find user by email
      const user = await User.findOne({ email: report.userEmail });
      if (user) {
        report.userId = user._id;
        await report.save();
        fixedCount++;
        console.log(`Fixed report ${report._id} for user ${user.email}`);
      } else {
        console.log(`No user found for email: ${report.userEmail}`);
      }
    }

    res.json({ 
      message: `Fixed ${fixedCount} out of ${reportsWithoutUserId.length} reports`,
      fixedCount,
      totalReports: reportsWithoutUserId.length
    });
  } catch (err) {
    console.error('Error fixing user links:', err);
    res.status(500).json({ message: 'Error fixing user links', error: err.message });
  }
});

//  router.post("/generate-docx", async (req, res) => {
//   const { reportData, scopeChartImage } = req.body;
//   try {
//     const docBuffer = await generateReportDocx(reportData, scopeChartImage);
//     res.set({
//       'Content-Disposition': `attachment; filename=Report.docx`,
//       'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     });
//     res.send(docBuffer);
//   } catch (err) {
//     console.error("❌ Error generating DOCX:", err);
//     res.status(500).send("Failed to generate DOCX");
//   }
// });


 router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('📦 Incoming report data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.userEmail) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    
    if (!req.body.organisationName) {
      return res.status(400).json({ message: 'Organisation name is required' });
    }

    // 🔢 Calculate emission metrics
    const baseline = req.body.previousPeriods?.[0];
    const baselineEmissions =
      Number(baseline?.scope1 || 0) +
      Number(baseline?.scope2 || 0) +
      Number(baseline?.scope3 || 0);

    const totalEmissions = Number(req.body.totalEmissions || 0);
    const annualReduction = Number(req.body.annualReductionPercentage || 0) / 100;

    const yearsTo2030 = 2030 - Number(req.body.endYear);
    const yearsToNetZero = Number(req.body.netZeroYear || 2050) - Number(req.body.endYear);

    const projected2030Emissions = +(totalEmissions * Math.pow(1 - annualReduction, yearsTo2030)).toFixed(2);
    const projectedNetZeroEmissions = +(totalEmissions * Math.pow(1 - annualReduction, yearsToNetZero)).toFixed(2);

    const reduction2030 = +(((totalEmissions - projected2030Emissions) / totalEmissions) * 100).toFixed(1);
    const reductionNetZero = +(((totalEmissions - projectedNetZeroEmissions) / totalEmissions) * 100).toFixed(1);

    // 📄 Data for Word document
    const data = {
      organisationName: req.body.organisationName,
      companyNumber: req.body.companyNumber,
      currentAddress: req.body.currentAddress,
      registeredAddress: req.body.registeredAddress,
      branches: req.body.branches || [],
      baselineYear: baseline?.year || 'N/A',
      baselineScope1: baseline?.scope1 || 0,
      baselineScope2: baseline?.scope2 || 0,
      baselineScope3: baseline?.scope3 || 0,
      currentYear: req.body.endYear,
      scope1: req.body.scope1,
      scope2: req.body.scope2,
      scope3: req.body.scope3,
      totalEmissions: req.body.totalEmissions,
      projected2030Emissions,
      reduction2030,
      projectedNetZeroEmissions,
      reductionNetZero,
      netZeroYear: req.body.netZeroYear,
    };

    // Clean input before creating report
 if ('_id' in req.body) {
  delete req.body._id;
 }

    // 🆕 Always create a new report
    const newReport = await Report.create({
      ...req.body,
      userId: req.user._id, // Link report to user
      userEmail: req.body.userEmail,
      locked: true,
      submitted: true,
      accessCode: Math.random().toString().slice(2, 10),
    });

    // 📄 Generate Word doc (email sending removed)
    const docBuffer = await generateCompleteReportDocx({
      ...req.body,
      projected2030Emissions,
      projectedNetZeroEmissions,
      reduction2030,
      reductionNetZero
    });
    
    console.log('✅ Report saved to database and Word document generated');

    return res.status(201).json({
      message: 'Report submitted successfully',
      reportId: newReport._id,
    });

  } 
  catch (err) {
    console.error('❌ Report submission failed:', err.message);
    console.error('📛 Stack trace:', err.stack);
    console.error('📦 Request body:', JSON.stringify(req.body, null, 2));
    return res.status(500).json({
      message: 'Server error while submitting report',
      error: err.message,
    });
  }
  
});

router.post("/export-complete-docx", requireAuth, async (req, res) => {
  const { reportData, scopeChartImage, yearComparisonChartImage, reductionPlanChartImage } = req.body;
  try {
    const docBuffer = await generateCompleteReportDocx(reportData, {
      scopeChartImage,
      yearComparisonChartImage,
      reductionPlanChartImage
    });
    res.set({
      'Content-Disposition': `attachment; filename=Complete_Carbon_Report_${reportData.organisationName || 'Report'}.docx`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    res.send(docBuffer);
  } catch (err) {
    console.error("❌ Error generating complete DOCX:", err);
    res.status(500).send("Failed to generate DOCX");
  }
});


module.exports = router;

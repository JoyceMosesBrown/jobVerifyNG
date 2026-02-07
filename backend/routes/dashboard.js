const express = require("express");
const Verification = require("../models/Verification");
const Report = require("../models/Report");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard - Get user dashboard data
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch saved verifications
    const verifications = await Verification.find({ userId, saved: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch reports
    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate stats
    const totalVerifications = await Verification.countDocuments({ userId });
    const scamsDetected = await Verification.countDocuments({ userId, verdict: "high_risk_scam" });
    const reportsSubmitted = await Report.countDocuments({ userId });

    // Map verifications to expected frontend format
    const mappedVerifications = verifications.map((v) => ({
      id: v._id,
      verdict: v.verdict,
      risk_score: v.riskScore,
      created_at: v.createdAt,
      advert_text: v.advertText,
    }));

    const mappedReports = reports.map((r) => ({
      id: r._id,
      report_type: r.reportType,
      status: r.status,
      created_at: r.createdAt,
    }));

    res.json({
      verifications: mappedVerifications,
      reports: mappedReports,
      stats: {
        totalVerifications,
        scamsDetected,
        reportsSubmitted,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;

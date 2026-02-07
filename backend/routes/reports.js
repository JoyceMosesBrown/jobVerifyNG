const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

// POST /api/reports - Submit a report
router.post("/", async (req, res) => {
  try {
    const { verificationId, reportType, userId, message } = req.body;

    const report = await Report.create({
      verificationId,
      reportType: reportType,
      userId: userId || null,
      message: message || null,
      status: "pending",
    });

    res.status(201).json({
      id: report._id,
      success: true,
    });
  } catch (error) {
    console.error("Report submission error:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

module.exports = router;

const express = require("express");
const Verification = require("../models/Verification");
const Report = require("../models/Report");
const Blacklist = require("../models/Blacklist");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("verificationId")
      .lean();

    const mappedReports = reports.map((r) => ({
      id: r._id,
      verification_id: r.verificationId?._id || r.verificationId,
      report_type: r.reportType,
      status: r.status,
      message: r.message,
      created_at: r.createdAt,
      verification_results: r.verificationId
        ? {
            advert_text: r.verificationId.advertText,
            recruiter_email: r.verificationId.recruiterEmail,
            recruiter_phone: r.verificationId.recruiterPhone,
          }
        : null,
    }));

    res.json(mappedReports);
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// PUT /api/admin/reports/:id/resolve
router.put("/reports/:id/resolve", async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: "resolved" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// GET /api/admin/verifications
router.get("/verifications", async (req, res) => {
  try {
    const verifications = await Verification.find()
      .sort({ createdAt: -1 })
      .lean();

    const mapped = verifications.map((v) => ({
      id: v._id,
      verdict: v.verdict,
      risk_score: v.riskScore,
      recruiter_email: v.recruiterEmail,
      recruiter_phone: v.recruiterPhone,
      advert_text: v.advertText,
      created_at: v.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

// GET /api/admin/blacklist
router.get("/blacklist", async (req, res) => {
  try {
    const blacklist = await Blacklist.find().sort({ createdAt: -1 }).lean();

    const mapped = blacklist.map((b) => ({
      id: b._id,
      type: b.type,
      value: b.value,
      created_at: b.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blacklist" });
  }
});

// POST /api/admin/blacklist
router.post("/blacklist", async (req, res) => {
  try {
    const { type, value } = req.body;
    const item = await Blacklist.create({
      type,
      value,
      addedBy: req.user._id,
    });

    res.status(201).json({
      id: item._id,
      type: item.type,
      value: item.value,
      created_at: item.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add to blacklist" });
  }
});

// DELETE /api/admin/blacklist/:id
router.delete("/blacklist/:id", async (req, res) => {
  try {
    await Blacklist.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from blacklist" });
  }
});

module.exports = router;

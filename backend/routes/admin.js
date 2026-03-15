const express = require("express");
const Verification = require("../models/Verification");
const Report = require("../models/Report");
const Blacklist = require("../models/Blacklist");
const User = require("../models/User");
const ContactMessage = require("../models/ContactMessage");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// GET /api/admin — Platform stats overview
router.get("/", async (req, res) => {
  try {
    const [totalVerifications, totalUsers, pendingReports, blacklistCount, scamsDetected] =
      await Promise.all([
        Verification.countDocuments(),
        User.countDocuments({ role: "user" }),
        Report.countDocuments({ status: "pending" }),
        Blacklist.countDocuments(),
        Verification.countDocuments({ verdict: "high_risk_scam" }),
      ]);

    res.json({
      totalVerifications,
      totalUsers,
      pendingReports,
      blacklistCount,
      scamsDetected,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/verifications — All verifications
router.get("/verifications", async (req, res) => {
  try {
    const verifications = await Verification.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const mapped = verifications.map((v) => ({
      id: v._id,
      advert_text: v.advertText,
      advert_link: v.advertLink,
      risk_score: v.riskScore,
      verdict: v.verdict,
      indicators: v.indicators,
      saved: v.saved,
      created_at: v.createdAt,
      user: v.userId ? { name: v.userId.name, email: v.userId.email } : null,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Admin verifications error:", error);
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

// GET /api/admin/reports — All reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "name email")
      .populate("verificationId", "advertText riskScore verdict")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = reports.map((r) => ({
      id: r._id,
      report_type: r.reportType,
      message: r.message,
      status: r.status,
      created_at: r.createdAt,
      user: r.userId ? { name: r.userId.name, email: r.userId.email } : null,
      verification: r.verificationId
        ? {
            advert_text: r.verificationId.advertText?.substring(0, 100),
            risk_score: r.verificationId.riskScore,
            verdict: r.verificationId.verdict,
          }
        : null,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// PUT /api/admin/reports/:id/resolve — Resolve a report
router.put("/reports/:id/resolve", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// GET /api/admin/blacklist — All blacklist entries
router.get("/blacklist", async (req, res) => {
  try {
    const items = await Blacklist.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = items.map((b) => ({
      id: b._id,
      type: b.type,
      value: b.value,
      added_by: b.addedBy?.name || "System",
      created_at: b.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Admin blacklist error:", error);
    res.status(500).json({ error: "Failed to fetch blacklist" });
  }
});

// POST /api/admin/blacklist — Add to blacklist
router.post("/blacklist", async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({ error: "Type and value are required" });
    }

    if (!["email", "phone", "domain"].includes(type)) {
      return res.status(400).json({ error: "Type must be email, phone, or domain" });
    }

    const existing = await Blacklist.findOne({ type, value: value.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "This entry already exists in the blacklist" });
    }

    const entry = await Blacklist.create({
      type,
      value: value.toLowerCase(),
      addedBy: req.user._id,
    });

    res.status(201).json({ success: true, id: entry._id });
  } catch (error) {
    console.error("Add blacklist error:", error);
    res.status(500).json({ error: "Failed to add to blacklist" });
  }
});

// DELETE /api/admin/blacklist/:id — Remove from blacklist
router.delete("/blacklist/:id", async (req, res) => {
  try {
    const entry = await Blacklist.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: "Blacklist entry not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete blacklist error:", error);
    res.status(500).json({ error: "Failed to remove from blacklist" });
  }
});

// GET /api/admin/messages — All contact messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    const mapped = messages.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      message: m.message,
      status: m.status,
      admin_reply: m.adminReply,
      replied_at: m.repliedAt,
      created_at: m.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Admin messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PUT /api/admin/messages/:id/read — Mark message as read
router.put("/messages/:id/read", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// PUT /api/admin/messages/:id/reply — Reply to a message
router.put("/messages/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply.trim(), status: "replied", repliedAt: new Date() },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// DELETE /api/admin/messages/:id — Delete a message
router.delete("/messages/:id", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;

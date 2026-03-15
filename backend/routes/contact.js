const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ContactMessage = require("../models/ContactMessage");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Optional auth — extracts user if token is present, but doesn't block
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch {
    // Token invalid or expired — that's fine, continue as guest
  }
  next();
};

// POST /api/contact — save a contact message (public, optionally linked to user)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please provide name, email, and message" });
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      userId: req.user?._id || null,
    });

    res.status(201).json({
      id: contact._id,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

// GET /api/contact/my-messages — get logged-in user's messages with replies
router.get("/my-messages", protect, async (req, res) => {
  try {
    // Match by userId OR by email so messages sent before login also show up
    const messages = await ContactMessage.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = messages.map((m) => ({
      id: m._id,
      message: m.message,
      status: m.status,
      admin_reply: m.adminReply,
      replied_at: m.repliedAt,
      created_at: m.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("My messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;

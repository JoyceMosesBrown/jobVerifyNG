const mongoose = require("mongoose");

const verificationLimitSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VerificationLimit", verificationLimitSchema);

const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    advertText: { type: String, default: null },
    advertLink: { type: String, default: null },
    sourcePlatform: { type: String, default: null },
    recruiterEmail: { type: String, default: null },
    recruiterPhone: { type: String, default: null },
    riskScore: { type: Number, required: true },
    verdict: {
      type: String,
      enum: ["verified", "likely_legit", "needs_review", "suspicious", "high_risk_scam"],
      required: true,
    },
    indicators: { type: [mongoose.Schema.Types.Mixed], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    saved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", verificationSchema);

const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "phone", "domain"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blacklist", blacklistSchema);

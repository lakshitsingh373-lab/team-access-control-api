const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ["admin", "member", "viewer"],
    required: true
  },
  token: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired"],
    default: "pending"
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Invitation", invitationSchema);
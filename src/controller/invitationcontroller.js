const crypto = require("crypto");
const Invitation = require("../models/Invitation");
const Membership = require("../models/Membership");
const User = require("../models/User");
const logAction = require("../utils/auditlogger");

const createInvite = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await Invitation.create({
      orgId: req.params.orgId,
      email,
      role,
      token,
      invitedBy: req.user.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await logAction({
      orgId: req.params.orgId,
      actorId: req.user.userId,
      action: "invite.created",
      targetType: "Invitation",
      targetId: invite._id,
      metadata: { email, role }
    });

    res.status(201).json({
      message: "Invitation created",
      invite: { id: invite._id, email: invite.email, role: invite.role, token: invite.token }
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await Invitation.findOne({ token, status: "pending" });

    if (!invite) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ error: "Invitation has expired" });
    }

    const user = await User.findById(req.user.userId);
    if (user.email !== invite.email) {
      return res.status(403).json({ error: "This invitation is not for your account" });
    }

    await Membership.create({
      userId: req.user.userId,
      orgId: invite.orgId,
      role: invite.role
    });

    invite.status = "accepted";
    await invite.save();

    await logAction({
      orgId: invite.orgId,
      actorId: req.user.userId,
      action: "invite.accepted",
      targetType: "Membership",
      targetId: invite._id
    });

    res.status(200).json({ message: "Invitation accepted", role: invite.role });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { createInvite, acceptInvite };
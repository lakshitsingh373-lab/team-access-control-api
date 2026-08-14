const Organization = require("../models/Organization");
const Membership = require("../models/Membership");
const logAction = require("../utils/auditlogger");
const createOrg = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const org = await Organization.create({
      name,
      ownerId: req.user.userId
    });

    await Membership.create({
      userId: req.user.userId,
      orgId: org._id,
      role: "owner"
    });

    res.status(201).json({
      message: "Organization created",
      organization: { id: org._id, name: org.name },
      role: "owner"
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
const getMembers = async (req, res) => {
  try {
    const members = await Membership.find({
      orgId: req.params.orgId,
      status: "active"
    }).populate("userId", "name email");

    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
     
    const membership = await Membership.findOne({
      userId,
      orgId: req.params.orgId,
      status: "active"
    });

    if (!membership) {
      return res.status(404).json({ error: "Member not found" });
    }

    membership.role = role;
    await membership.save();
    await logAction({
  orgId: req.params.orgId,
  actorId: req.user.userId,
  action: "role.changed",
  targetType: "Membership",
  targetId: membership._id,
  metadata: { newRole: role, targetUserId: req.params.userId }
});
    res.status(200).json({ message: "Role updated", role: membership.role });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ orgId: req.params.orgId })
      .sort({ createdAt: -1 })
      .populate("actorId", "name email");

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
module.exports = { createOrg,getMembers,changeRole,getAuditLogs };
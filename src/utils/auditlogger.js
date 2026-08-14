const AuditLog = require("../models/AuditLog");

const logAction = async ({ orgId, actorId, action, targetType, targetId, metadata }) => {
  try {
    await AuditLog.create({ orgId, actorId, action, targetType, targetId, metadata });
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
};

module.exports = logAction;
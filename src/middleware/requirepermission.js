const ROLE_PERMISSIONS = require("../config/permissions");

const requirePermission = (permission) => {
  return (req, res, next) => {
    const role = req.membership.role;
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: "You don't have permission to perform this action" });
    }

    next();
  };
};

module.exports = requirePermission;
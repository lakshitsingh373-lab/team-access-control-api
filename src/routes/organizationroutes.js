const express = require("express");
const router = express.Router();
const loadMembership=require("../middleware/loadmembership")
const { createOrg, getMembers, changeRole, getAuditLogs } = require("../controller/organizationcontroller");
const {authenticate} = require("../middleware/authmiddleware");
const {createInvite,acceptInvite}=require("../controller/invitationcontroller")

const requirePermission = require("../middleware/requirepermission");

router.post("/", authenticate, createOrg);
router.get("/:orgId/members", authenticate, loadMembership, getMembers);

router.post("/:token/accept", authenticate, acceptInvite);
router.post("/:orgId/invite", authenticate, loadMembership, requirePermission("users.invite"), createInvite);

router.patch("/:orgId/members/:userId/role", authenticate, loadMembership, requirePermission("role.change"), changeRole);
router.get("/:orgId/audit-logs", authenticate, loadMembership, requirePermission("users.read"), getAuditLogs);

module.exports = router;
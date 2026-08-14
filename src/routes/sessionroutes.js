const express = require("express");
const router = express.Router();
const { getMySessions, revokeSession } = require("../controller/sessioncontroller");
const {authenticate} = require("../middleware/authmiddleware");

router.get("/", authenticate, getMySessions);
router.delete("/:sessionId", authenticate, revokeSession);

module.exports = router;
const Membership = require("../models/Membership");

const loadMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      userId: req.user.userId,
      orgId: req.params.orgId,
      status: "active"
    });

    if (!membership) {
      return res.status(404).json({ error: "Not found" });
    }

    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = loadMembership;
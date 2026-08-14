const Session = require("../models/session");

const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.userId,
      revokedAt: null
    }).select("-refreshTokenHash");

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.revokedAt = new Date();
    await session.save();

    res.status(200).json({ message: "Session revoked" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { getMySessions, revokeSession };
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Session=require("../models/session")
const logAction=require("../utils/auditlogger")
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({
      message: "User created",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await logAction({
  actorId: user._id,
  action: "login",
  targetType: "User",
  targetId: user._id
});

    await Session.create({
  userId: user._id,
  refreshTokenHash,
  userAgent: req.headers["user-agent"],
  ip: req.ip,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
const getProfile = async (req, res) => {
  res.status(200).json({
    message: "This is a protected route",
    userId: req.user.userId
  });
};
module.exports = { signup, login,getProfile };
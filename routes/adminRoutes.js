const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbConnect = require('../config/db');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error("Missing JWT_SECRET environment variable");
}

/**
 * POST /admin/login
 * Expects a JSON body with "username" and "password".
 */
router.post('/login', async (req, res) => {
  try {
    // Connect to the database
    await dbConnect();

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Look up the admin user by email (assuming 'username' is the email) and role.
    const user = await User.findOne({ email: username, role: "admin" });
    if (!user) {
      console.log("User not found for email:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // For debugging: log the stored hashed password (remove or disable in production)
    console.log("Stored hash:", user.password);

    // Compare the provided password with the stored hashed password.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      console.log("Password mismatch for user:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a JWT that includes the admin's UID and role.
    const token = jwt.sign({ uid: user.uid, role: "admin" }, SECRET_KEY, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

   // Example code in your /admin/login route (server-side)
res.cookie("admin_jwt", token, {
    httpOnly: true,
    // For local development over HTTP, set secure to false.
    secure: process.env.NODE_ENV === "production",
    // Use 'lax' or 'none' (with secure) if cross-site cookies are necessary.
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    // Optionally set the domain if needed.
    // domain: ".phulkaribagh.com",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, // 1 day in milliseconds
  });

    return res.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


/**
 * POST /admin/change-password
 * Expects JSON body: { currentPassword, newPassword }
 * Requires admin authentication.
 */
router.post('/change-password', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbConnect();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    // req.user is set by auth middleware (should contain uid or _id)
    const user = await User.findOne({ uid: req.user.uid, role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    // Optionally enforce password strength here
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    // Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

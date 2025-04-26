// middleware/auth.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");   // adjust path if needed

/**
 * Extract the JWT from either the Authorization header
 * (  Authorization: Bearer <token> )
 * …or the `token` cookie. Returns undefined if none found.
 */
function getBearerToken(req) {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return undefined;
}

/**
 * 1. Verify the token.
 * 2. Load the user by _id **or** uid (we support both).
 * 3. Attach the user to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 🔑  Decode & verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍  Try _id first, then uid
    const user =
      (decoded.id && await User.findById(decoded.id)) ||
      (decoded.uid && await User.findOne({ uid: decoded.uid }));

    if (!user) {
      return res.status(401).json({ error: "Invalid token: user not found" });
    }

    req.user = user;        // attach for downstream handlers
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Same idea as before, but we now respect `role: "admin"`
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "admin") {        // ← changed line
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
const Event = require("../models/Event");

const logPageView = async (req, _res, next) => {
  // Skip assets, admin, and analytics routes
  if (/^\/(_next|static)\b|^\/api\/(analytics|events)/.test(req.originalUrl)) {
    return next();
  }

  try {
    await Event.create({
      type: "view",
      userId: req.user?._id,   // adapt to your auth implementation
      path:   req.originalUrl,
    });
  } catch (err) {
    console.error("View‑event log failed:", err.message);
    // Never block request flow
  }

  next();
};

module.exports = { logPageView };
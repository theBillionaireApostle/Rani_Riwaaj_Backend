const express = require("express");
const Event   = require("../models/Event");

const router = express.Router();

/**
 * POST /api/events
 * Body: { type:"click", identifier:"add_to_cart", path:"/products/abc123" }
 */
router.post("/", async (req, res) => {
  const { type = "click", identifier, path } = req.body;

  if (type !== "click" || !identifier) {
    return res.status(400).json({ error: "identifier required" });
  }

  try {
    await Event.create({
      type: "click",
      userId: req.user?._id,
      identifier,
      path,
    });
    return res.status(201).end();
  } catch (err) {
    console.error("Click‑event log failed:", err.message);
    return res.status(500).json({ error: "Failed to log event" });
  }
});

module.exports = router;
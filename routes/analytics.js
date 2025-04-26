const express = require("express");
const Event   = require("../models/Event");
const { getDateStart } = require("../utils/getDateStart");
const { requireAdmin } = require("../middlewares/auth");   // <- here

const router = express.Router();

/**
 * GET /api/analytics?metric=views&period=day|month|quarter|year
 * Response: { total, uniqueUsers }
 */
router.get("/", requireAdmin, async (req, res) => {        // <- and here
  const period = req.query.period || "day";
  const metric = req.query.metric || "views";
  const from   = getDateStart(period);

  try {
    const pipeline = [
      { $match: { createdAt: { $gte: from }, type: metric === "views" ? "view" : "click" } },
      {
        $group: {
          _id:   null,
          total: { $sum: 1 },
          users: { $addToSet: "$userId" }
        }
      },
      { $project: { _id: 0, total: 1, uniqueUsers: { $size: "$users" } } }
    ];

    const [stats] = await Event.aggregate(pipeline);
    res.json(stats || { total: 0, uniqueUsers: 0 });
  } catch (err) {
    console.error("Analytics aggregation failed:", err.message);
    res.status(500).json({ error: "Analytics aggregation failed" });
  }
});

module.exports = router;
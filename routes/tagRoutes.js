const express = require("express");
const router = express.Router();
const dbConnect = require("../config/db");
const Tag = require("../models/Tag");

// GET /api/tags — list all tags
router.get("/", async (req, res) => {
  try {
    await dbConnect();
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: err.message || "Failed to fetch tags" });
  }
});

// POST /api/tags — create a new tag
router.post("/", async (req, res) => {
  try {
    await dbConnect();
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }
    const tag = new Tag({ name, slug });
    await tag.save();
    res.status(201).json(tag);
  } catch (err) {
    console.error("Error creating tag:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Tag name or slug already exists" });
    }
    res.status(500).json({ error: err.message || "Failed to create tag" });
  }
});

// PATCH /api/tags/:id — update an existing tag
router.patch("/:id", async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }
    const updated = await Tag.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating tag:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Tag name or slug already exists" });
    }
    res.status(500).json({ error: err.message || "Failed to update tag" });
  }
});

// DELETE /api/tags/:id — delete a tag
router.delete("/:id", async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting tag:", err);
    res.status(500).json({ error: err.message || "Failed to delete tag" });
  }
});

module.exports = router;

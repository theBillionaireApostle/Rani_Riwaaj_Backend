// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const dbConnect = require('../config/db'); // Adjust the path as needed.
const Cart = require('../models/Cart');

// GET: Fetch the cart for a given user based on a query parameter.
router.get('/', async (req, res) => {
  try {
    // Establish a connection to the database.
    await dbConnect();

    // Get userId from query parameters.
    const { userId } = req.query;

    // Validate that userId is provided.
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Find the cart document corresponding to the userId.
    // Using .lean() returns a plain JavaScript object.
    const cart = await Cart.findOne({ userId }).lean();

    // Return the cart if found; otherwise, return a default structure with empty items.
    return res.json(cart || { userId, items: [] });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch cart" });
  }
});

// POST: Save or update the cart for a user.
router.post('/', async (req, res) => {
  try {
    // Establish a connection to the database.
    await dbConnect();

    // Retrieve data from the request body.
    const { userId, items } = req.body;

    // Validate required fields.
    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid data: userId and items array are required." });
    }

    // Additional validation: Ensure each item has the expected fields.
    const isValidItems = items.every(
      (item) =>
        item.productId &&
        typeof item.productId === "string" &&
        item.name &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity)
    );

    if (!isValidItems) {
      return res.status(400).json({ error: "Invalid items structure." });
    }

    // Update or create the cart document.
    // The runValidators option enforces your schema validations.
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ error: error.message || "Failed to update cart" });
  }
});

module.exports = router;
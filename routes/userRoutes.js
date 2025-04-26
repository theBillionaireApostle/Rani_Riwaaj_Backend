// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const dbConnect = require('../config/db');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    // Ensure a connection to the database
    await dbConnect();

    // Parse JSON data from the request body
    const { uid, email, displayName, photoURL } = req.body;

    // Validate required fields: uid and email must be provided
    if (!uid || !email) {
      return res.status(400).json({
        error: "Missing required fields: uid and email are required."
      });
    }

    // Upsert the user record: create a new user if one doesn't exist or update the existing one.
    const userRecord = await User.findOneAndUpdate(
      { uid }, // Filter by uid
      { email, displayName, photoURL, updatedAt: new Date() }, // Update object
      { new: true, upsert: true, runValidators: true } // Options
    );

    // Return the created/updated user record
    return res.status(200).json(userRecord);
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return res.status(500).json({
      error: error.message || "Failed to create/update user"
    });
  }
});

module.exports = router;
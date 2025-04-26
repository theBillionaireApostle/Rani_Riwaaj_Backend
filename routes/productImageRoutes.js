// routes/productImageRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../config/cloudinary');

/**
 * POST /upload
 * Receives a base64-encoded image, converts it to a Buffer, then uploads it to Cloudinary.
 * Expects a JSON body:
 * {
 *   imageBase64: string, // Required, base64 string
 *   folder?: string      // Optional folder name
 * }
 */
router.post('/upload', async (req, res) => {
  try {
    const { imageBase64, folder } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided." });
    }

    // Convert the base64 string to a Buffer
    const buffer = Buffer.from(imageBase64, "base64");
    const result = await uploadImage(buffer, { folder: folder || "house_of_phulkari" });

    return res.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    const errorMessage = error.message || "Something went wrong.";
    return res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;
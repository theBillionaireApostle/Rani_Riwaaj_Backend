// models/category.js

const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

// Sub-schema for storing image metadata (e.g., Cloudinary)
const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

// Main Category schema
const CategorySchema = new Schema(
  {
    /**
     * Display name for the category, e.g. "Shawls", "Home Decor"
     */
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /**
     * URL-friendly identifier, e.g. "shawls", "home-decor"
     */
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Optional description shown in the UI or SEO meta
     */
    description: {
      type: String,
      trim: true,
    },

    /**
     * Cloudinary image metadata for this category
     */
    image: {
      type: ImageSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export model (avoid re-compilation if already defined)
const Category = models.Category || model('Category', CategorySchema);
module.exports = Category;

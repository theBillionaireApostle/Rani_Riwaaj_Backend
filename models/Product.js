// models/Product.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

// Schema for each image stored on Cloudinary
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

// Optional: Schema for size options
const SizeSchema = new Schema(
  {
    label: { type: String, required: true },
    badge: { type: String }, // e.g., "JUST IN", "10% OFF", "3 LEFT"
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name:         { type: String, required: true },
    desc:         { type: String },
    price:        { type: String, required: true },
    globalImages: { type: [ImageSchema], default: [] }, // new
    defaultImage: { type: ImageSchema },  
    imagesByColor:{
      type: Map,
      of: [ImageSchema],
      default: {},
    },
    colors:       { type: [String], default: [] },
    sizes:        { type: [Schema.Types.Mixed], default: [] },
    badge:        { type: String },
    justIn:       { type: Boolean, default: false },
    published:    { type: Boolean, default: false },

    // ↓ New category reference ↓
    category: {
      type: Schema.Types.ObjectId,
      ref:  "Category",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = models.Product || model("Product", ProductSchema);
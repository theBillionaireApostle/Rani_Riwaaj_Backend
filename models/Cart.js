// models/Cart.js
const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
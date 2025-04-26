const { Schema, model, models } = require("mongoose");

const EventSchema = new Schema(
  {
    type:       { type: String, enum: ["view", "click"], required: true },
    userId:     { type: String },   // optional – anonymous visits still count
    path:       { type: String },
    identifier: { type: String },   // semantic click id, e.g. "add_to_cart"
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// compound index for fast range queries
EventSchema.index({ type: 1, createdAt: -1 });

module.exports = models.Event || model("Event", EventSchema);
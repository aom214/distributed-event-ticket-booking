const mongoose = require("mongoose");

/**
 * Schema for booking tickets.
 */
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  eventId: { type: String, required: true },
  quantity: { type: Number, required: true },
  email: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);

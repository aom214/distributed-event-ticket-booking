const Booking = require("../models/Booking");
const { publishToQueue } = require("../utils/rabbitmq.js");

/**
 * Handles ticket booking request.
 */
const bookTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create a pending booking entry
    const booking = await Booking.create({
      userId: req.user.id,
      email: req.user.email,
      eventId,
      quantity,
      status: "pending",
    });

    // Prepare message for Event Service
    const payload = {
      bookingId: booking._id,
      eventId,
      quantity,
      email: booking.email,
    };

    // Publish to RabbitMQ for reservation
    await publishToQueue("event.MakeReserve", payload);

    return res.status(200).json({
      message: "Booking request sent",
      bookingId: booking._id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

module.exports = {
  bookTicket,
};

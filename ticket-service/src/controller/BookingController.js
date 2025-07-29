const Booking = require("../models/Booking");
const { getChannel } = require("../utils/rabbitmq");

const bookTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      quantity,
      status: "pending",
    });

    const channel = getChannel();
    const payload = {
      bookingId: booking._id,
      eventId,
      quantity,
    };

    channel.sendToQueue("event.MakeReserve", Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    return res.status(200).json({ message: "Booking request sent", bookingId: booking._id });
  } catch (err) {
    return res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

module.exports = {
  bookTicket,
};

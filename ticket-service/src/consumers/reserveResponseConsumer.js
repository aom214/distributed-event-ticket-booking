const { getChannel } = require("../utils/rabbitmq");
const Booking = require("../models/Booking");

const consumeReserveQueue = async () => {
  const channel = getChannel();

  await channel.consume("event.Reserve", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📩 Received message from event.Reserve:", data);

    const { bookingId, status } = data;

    try {
      await Booking.findByIdAndUpdate(bookingId, {
        status: status === "reserved" ? "confirmed" : "failed",
      });
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Error updating booking:", err.message);
    }
  });
};

module.exports = consumeReserveQueue;

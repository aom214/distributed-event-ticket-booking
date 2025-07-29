const Booking = require("../models/Booking");

/**
 * Handles the reservation message from RabbitMQ.
 * @param {Object} data - The message data.
 * @param {string} data.bookingId - The ID of the booking.
 * @param {string} data.status - The status of the reservation ('reserved' or 'failed').
 */
const handleReserveMessage = async ({ bookingId, status }) => {
  try {
    const newStatus = status === "success" ? "confirmed" : "failed";


    const result = await Booking.findByIdAndUpdate(
      bookingId,
      { status: newStatus },
      { new: true }
    );

    if (result) {
      console.log(`✅ Booking ${bookingId} updated to ${newStatus}`);
    } else {
      console.warn(`⚠️ Booking ID ${bookingId} not found`);
    }
  } catch (err) {
    console.error(`❌ Error updating booking ${bookingId}:`, err.message);
  }
};

module.exports = handleReserveMessage;

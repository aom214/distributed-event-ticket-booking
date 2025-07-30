const Booking = require("../models/Booking");
const { publishToQueue } = require("../utils/rabbitmq.js");

/**
 * Handles the reservation response and updates booking status.
 * Also triggers notification if booking is confirmed or failed.
 */
const handleReserveMessage = async ({ bookingId, status }) => {
  try {
    const newStatus = status === "success" ? "confirmed" : "failed";

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedBooking) {
      console.warn(`Booking ID ${bookingId} not found`);
      return;
    }

    console.log(`Booking ${bookingId} updated to ${newStatus}`);

    // Prepare notification payload
    const notificationPayload = {
      bookingId: updatedBooking._id,
      userId: updatedBooking.userId,
      email: updatedBooking.email,
      eventId: updatedBooking.eventId,
      status: updatedBooking.status,
      message: `Your booking has been ${updatedBooking.status}`,
      tickets: updatedBooking.quantity,
      timestamp: new Date().toISOString(),
    };

    // Send notification message to notification service
    await publishToQueue("ticket.notification", notificationPayload);

    console.log(`Notification sent for booking ${bookingId}`);
  } catch (err) {
    console.error(`Error handling reservation message for ${bookingId}:`, err.message);
  }
};

module.exports = handleReserveMessage;

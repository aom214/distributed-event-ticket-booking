const sendEmail = require("./mailer/sendEmail");
const generateEmailHTML = require("./utils/emailTemplate");

/**
 * Start consuming messages from the specified queue.
 * @param {Channel} channel - RabbitMQ channel
 * @param {string} queue - Queue name
 */
const startConsumer = (channel, queue) => {
  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    console.log("Notification received:", data);

    const html = generateEmailHTML(data);

    const mailOptions = {
      to: data.email || "aom.k@ahduni.edu.in", // Fallback for demo/testing
      subject: `Booking Confirmed: ${data.bookingId}`,
      text: data.message,
      html,
    };

    try {
      await sendEmail(mailOptions);
      console.log(`Email sent to ${mailOptions.to}`);
    } catch (err) {
      console.error("Failed to send email:", err.message);
    }

    channel.ack(msg);
  });
};

module.exports = startConsumer;

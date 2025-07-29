const amqp = require("amqplib");
const Event = require("../models/event.models.js");

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const connectAndConsume = async () => {
  let attempt = 0;
  let connection = null;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`🔁 Trying to connect to RabbitMQ (Attempt ${attempt}/${MAX_RETRIES})...`);

      connection = await amqp.connect(RABBITMQ_URL);
      console.log("✅ Connected to RabbitMQ!");

      const channel = await connection.createChannel();

      await channel.assertQueue("event.MakeReserve", { durable: true });
      await channel.assertQueue("event.Reserve", { durable: true });

      console.log("🎧 Waiting for messages in event.MakeReserve queue...");

      channel.consume("event.MakeReserve", async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        const { eventId, userId, quantity, bookingId } = data;

        console.log("📩 Received booking request:", data);

        try {
          const event = await Event.findById(eventId);

          if (!event) throw new Error("Event not found");
          if (event.capacity < quantity) throw new Error("Not enough capacity left");

          event.capacity -= quantity;
          await event.save();

          console.log("✅ Event capacity updated, reservation successful");

          // Send success response with bookingId
          channel.sendToQueue(
            "event.Reserve",
            Buffer.from(
              JSON.stringify({
                status: "success",
                eventId,
                userId,
                quantity,
                bookingId, // include bookingId
                message: "Reservation successful",
              })
            ),
            { persistent: true }
          );
        } catch (error) {
          console.error("❌ Reservation failed:", error.message);

          // Send failure response with bookingId
          channel.sendToQueue(
            "event.Reserve",
            Buffer.from(
              JSON.stringify({
                status: "failed",
                eventId,
                userId,
                quantity,
                bookingId, // include bookingId
                error: error.message,
              })
            ),
            { persistent: true }
          );
        }

        channel.ack(msg);
      });

      break; // Success: exit loop
    } catch (err) {
      console.error(`❌ Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        console.error("🚫 Max retries reached. Giving up.");
        break;
      }
      await delay(RETRY_INTERVAL_MS);
    }
  }
};

module.exports = connectAndConsume;

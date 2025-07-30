const amqp = require('amqplib');
const Event = require('../models/event.models');

const RABBITMQ_URL = 'amqp://rabbitmq:5672';
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const connectAndConsume = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`Connecting to RabbitMQ (Attempt ${attempt})`);

      const connection = await amqp.connect(RABBITMQ_URL);
      console.log('Connected to RabbitMQ');

      const channel = await connection.createChannel();
      await channel.assertQueue('event.MakeReserve', { durable: true });
      await channel.assertQueue('event.Reserve', { durable: true });

      channel.consume('event.MakeReserve', async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        const { eventId, userId, email, quantity, bookingId } = data;

        try {
          const event = await Event.findById(eventId);

          if (!event) throw new Error('Event not found');
          if (event.capacity < quantity) throw new Error('Insufficient capacity');

          event.capacity -= quantity;
          await event.save();

          channel.sendToQueue(
            'event.Reserve',
            Buffer.from(JSON.stringify({
              status: 'success',
              eventId,
              userId,
              email,
              quantity,
              bookingId,
              message: 'Reservation successful',
            })),
            { persistent: true }
          );
        } catch (error) {
          channel.sendToQueue(
            'event.Reserve',
            Buffer.from(JSON.stringify({
              status: 'failed',
              eventId,
              userId,
              quantity,
              bookingId,
              error: error.message,
            })),
            { persistent: true }
          );
        }

        channel.ack(msg);
      });

      break;
    } catch (err) {
      console.error(`RabbitMQ connection failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) break;
      await delay(RETRY_INTERVAL_MS);
    }
  }
};

module.exports = connectAndConsume;

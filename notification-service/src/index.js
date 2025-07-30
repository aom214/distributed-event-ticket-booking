require("dotenv").config();
const amqp = require("amqplib");
const startConsumer = require("./consumer");
const delay = require("./utils/delay");

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const QUEUE = "ticket.notification";
const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 3000;

/**
 * Establish connection to RabbitMQ and start the consumer.
 */
const connectAndStart = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`Connecting to RabbitMQ (Attempt ${attempt}/${MAX_RETRIES})...`);

      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });

      console.log("Connected to RabbitMQ");
      console.log(`Listening for messages on queue: ${QUEUE}`);

      startConsumer(channel, QUEUE);
      break;
    } catch (err) {
      console.error(`Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        console.error("Max retries reached. Exiting.");
        process.exit(1);
      }
      await delay(RETRY_INTERVAL_MS);
    }
  }
};

connectAndStart();

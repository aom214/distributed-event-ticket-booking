const amqp = require("amqplib");

let channel;

/**
 * Establish connection to RabbitMQ and assert necessary queues.
 */
const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertQueue("event.MakeReserve", { durable: true });
  await channel.assertQueue("event.Reserve", { durable: true });

  console.log("✅ Connected to RabbitMQ and queues asserted");
};

/**
 * Publishes a message to the specified queue.
 */
const publishToQueue = async (queue, msg) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
};

/**
 * Consumes messages from the specified queue.
 */
const consumeFromQueue = async (queue, callback) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");

  await channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      await callback(content);
      channel.ack(msg);
    }
  });
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  consumeFromQueue,
};

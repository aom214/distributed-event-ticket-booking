// config/rabbitmq.js
const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("event.MakeReserve");
  await channel.assertQueue("event.Reserve");
  console.log("RabbitMQ connected and queues asserted");
};

const publishToQueue = async (queue, msg) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
};

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

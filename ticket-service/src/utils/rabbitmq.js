const amqp = require("amqplib");

let channel = null;

const connectRabbitMQ = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await amqp.connect("amqp://rabbitmq:5672");
      channel = await connection.createChannel();
      await channel.assertQueue("event.MakeReserve", { durable: true });
      console.log("✅ Connected to RabbitMQ and queue asserted");
      return; // success
    } catch (err) {
      console.log("❌ RabbitMQ not ready, retrying...", err.message);
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after retries");
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  getChannel,
};

const amqp = require("amqplib");

let channel;
let connection;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue("event.MakeReserve", { durable: true });
    await channel.assertQueue("event.Reserve", { durable: true });

    console.log("✅ Connected to RabbitMQ");
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
  }
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  getChannel,
};

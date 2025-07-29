const { getChannel } = require("../utils/rabbitmq");
const handleReserveMessage = require("../utils/handleReserveMessage.js");

const consumeReserveQueue = async () => {
  const channel = getChannel();

  await channel.consume("event.Reserve", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📩 Received message from event.Reserve:", data);

    await handleReserveMessage(data);

    channel.ack(msg);
  });
};

module.exports = consumeReserveQueue;

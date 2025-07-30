const { consumeFromQueue } = require("../utils/rabbitmq.js");
const handleReserveMessage = require("../utils/handleReserveMessage");

/**
 * Starts consuming reservation status messages from event.Reserve queue.
 */
const consumeReserveQueue = async () => {
  await consumeFromQueue("event.Reserve", handleReserveMessage);
};

module.exports = consumeReserveQueue;

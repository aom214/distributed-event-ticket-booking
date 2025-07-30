// src/index.js

const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const verifyUser = require("./middleware/user");
const dbConnect = require("./database");
const { connectRabbitMQ } = require("./utils/rabbitmq.js");
const consumeReserveQueue = require("./consumers/reserveResponseConsumer");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());
app.use(cookieParser());
app.use(verifyUser);

app.use("/api/v1/booking", bookingRoutes);

/**
 * Attempts to start the Ticket Service with retries for RabbitMQ connection.
 */
const startServer = async () => {
  try {
    await dbConnect();

    // Retry mechanism for RabbitMQ
    const maxRetries = 5;
    let connected = false;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Connecting to RabbitMQ (Attempt ${attempt}/${maxRetries})...`);
        await connectRabbitMQ();
        connected = true;
        console.log("Connected to RabbitMQ");
        break;
      } catch (err) {
        console.warn(`RabbitMQ connection failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds
        }
      }
    }

    if (!connected) {
      throw new Error("Unable to connect to RabbitMQ after multiple attempts.");
    }

    await consumeReserveQueue();

    app.listen(PORT, () => {
      console.log(`Ticket Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start Ticket Service:", err.message);
    process.exit(1);
  }
};

startServer();

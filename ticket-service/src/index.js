const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const verify_user = require("./middleware/user");
const { connectRabbitMQ } = require("./utils/rabbitmq");
const consumeReserveQueue = require("./consumers/reserveResponseConsumer");
const db_connect = require('./database/index.js')

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(verify_user);

const bookingRoutes = require("./routes/bookingRoutes");


const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await db_connect();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("successfully commited----")
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

app.use("/api/v1/booking", bookingRoutes);

startServer();



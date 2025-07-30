require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const dbConnect = require('./database/index');
const eventRoutes = require('./routes/eventroute');
const connectAndConsume = require('./consumers/reserve.consumer');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware for parsing JSON, URL-encoded data, and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Event service is healthy' });
});

// Event Management Routes
app.use('/api/v1/events', eventRoutes);

// Initialize server and connect to RabbitMQ and MongoDB
const startServer = async () => {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    connectAndConsume();
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();

require('dotenv').config();
const express = require('express');
const db_connect = require('./database/index.js')
const router = require('./routes/authRoute.js')
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db_connect();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
app.use('/api/v1',router)

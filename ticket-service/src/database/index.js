const mongoose = require("mongoose");

/**
 * Connects to MongoDB using URI from environment.
 */
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = dbConnect;

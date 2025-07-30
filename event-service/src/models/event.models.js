const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  capacity: { type: Number, required: true },
  price: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);

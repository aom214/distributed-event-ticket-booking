const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controller/eventContorller.js');

const isAdmin = require('../middlewares/isAdmin.js');
const verifyUser = require('../middlewares/user.js');

const router = express.Router();

// Health Check
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Your app health is good." });
});

// 🔓 Public Routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// 🔐 Admin-Only Routes (Require Login + Admin Role)
router.post("/", verifyUser, isAdmin, createEvent);
router.put("/:id", verifyUser, isAdmin, updateEvent);
router.delete("/:id", verifyUser, isAdmin, deleteEvent);

module.exports = router;

const express = require("express");
const router = express.Router();
const { bookTicket } = require("../controller/BookingController");

router.post("/", bookTicket);

module.exports = router;

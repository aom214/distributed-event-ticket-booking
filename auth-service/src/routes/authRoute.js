const express = require('express');
const { register, login, logout } = require('../controller/userController');
const verifyUser = require('../middleware/user.middleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.send('Auth Service is healthy');
});

router.post('/user/register', register);
router.post('/user/login', verifyUser, login);
router.post('/user/logout', verifyUser, logout);

module.exports = router;
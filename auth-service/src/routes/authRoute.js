const express = require('express')
const {register,Login, logout} = require('../controller/userController.js')
const verify_user = require('../middleware/user.middleware.js')
const router = express.Router();

router.get('/health', (req, res) => {
  res.send('Auth Service health is good');
});

router.post('/user/register',register)


router.post('/user/login',Login)

router.post('/user/logout',verify_user,logout)

module.exports = router
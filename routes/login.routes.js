const express = require('express');
const LoginController = require('../controllers/login.controller.js');
const loginController = new LoginController();
const router = express.Router();

router.post('/login', loginController.login);

router.get('/logout', loginController.logout)

module.exports = router;
const express = require('express');
const router = express.Router();
const { signup, login, sendOtp } = require('../controllers/authController'); // 🔑 IMPORT sendOtp

// 🔑 NEW ROUTE: For sending the OTP
router.post('/send-otp', sendOtp); 
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
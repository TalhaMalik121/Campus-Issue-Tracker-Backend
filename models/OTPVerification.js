// models/OTPVerification.js

const mongoose = require('mongoose');

const OTPVerificationSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true // Ensure emails are consistent
  },
  otp: { 
    type: String, 
    required: true 
  },
  // Set the document to automatically expire after 10 minutes (600 seconds)
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 // OTP will be deleted from DB after 10 minutes
  }
}, { timestamps: true });

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);
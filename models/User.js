// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // We will store the hashed version here
// }, { timestamps: true });

// module.exports = mongoose.model('User', UserSchema);
// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true }, // Added lowercase
  password: { type: String, required: true }, // Hashed version
  // 🔑 Added role for user permissions
  role: { type: String, enum: ['Admin', 'User'], default: 'User' } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
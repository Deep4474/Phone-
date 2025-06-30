const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 
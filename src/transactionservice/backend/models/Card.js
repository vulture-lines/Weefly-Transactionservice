const mongoose = require('mongoose');
const { encrypt } = require('../utils/encryption');

const CardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate card numbers
    set: encrypt
  },
  cardSecurityCode: {
    type: String,
    required: true,
    set: encrypt
  },
  cardExpiryDate: {
    type: String,
    required: true,
    set: encrypt
  },
  cardStartDate: {
    type: String,
    required: true,
    set: encrypt
  },
  cardType: {
    type: String,
    required: true,
    enum: ['Visa', 'MasterCard', 'Amex', 'Discover', 'Other'],
    set: encrypt
  },
  cardIssueNumber: {
    type: String,
    required: true,
    set: encrypt
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Card', CardSchema);

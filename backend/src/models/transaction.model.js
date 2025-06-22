const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  vip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vip',
    required: true
  },
  type: {
    type: String,
    enum: ['recharge', 'consume'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bonusAmount: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number,
    default: 0
  },
  discountedAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },
  customAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 1.0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'pos', 'vip_balance'],
    default: 'vip_balance'
  },
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }]
});

module.exports = mongoose.model('Transaction', transactionSchema); 
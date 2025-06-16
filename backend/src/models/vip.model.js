const mongoose = require('mongoose');

const vipSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [{
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
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician'
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Vip = mongoose.model('Vip', vipSchema);

module.exports = Vip; 
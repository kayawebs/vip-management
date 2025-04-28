const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  vip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vip',
    required: false
  },
  type: {
    type: String,
    enum: ['recharge', 'consumption'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['vip_balance', 'cash', 'pos', 'douyin', 'meituan', 'other'],
    required: function() { return this.type === 'consumption'; }
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
  }],
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

module.exports = mongoose.model('Transaction', transactionSchema); 
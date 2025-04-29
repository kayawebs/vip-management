const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  vip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vip',
    required: true
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
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: function() {
      return this.type === 'consumption';
    }
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
  paymentMethod: {
    type: String,
    enum: ['vip_balance', 'cash', 'pos', 'douyin', 'meituan'],
    required: true
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema); 
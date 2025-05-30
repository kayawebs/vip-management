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
  bonusAmount: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: function() {
      return this.type === 'consumption';
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'pos', 'vip_balance'],
    default: 'cash'
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
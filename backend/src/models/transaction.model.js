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
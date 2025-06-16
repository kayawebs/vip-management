const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
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
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Technician = mongoose.model('Technician', technicianSchema);

module.exports = Technician; 
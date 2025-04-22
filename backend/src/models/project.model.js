const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // 项目时长（分钟）
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Project', projectSchema); 
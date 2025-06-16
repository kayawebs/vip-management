const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 
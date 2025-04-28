const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  date: {
    type: Date, // Represents the date the report is for
    required: true,
    unique: true // Ensure only one report per day
  },
  douyin: {
    hours: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 }
  },
  meituan: {
    hours: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 }
  },
  cash: {
    hours: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 }
  },
  pos: {
    hours: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 }
  },
  // You might want to add who created/updated it and when
  createdBy: {
    type: String // Or ObjectId ref if you have user accounts
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to set the date to the start of the day for consistency
dailyReportSchema.pre('save', function(next) {
  if (this.date) {
    const startOfDay = new Date(this.date);
    startOfDay.setHours(0, 0, 0, 0);
    this.date = startOfDay;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DailyReport', dailyReportSchema); 
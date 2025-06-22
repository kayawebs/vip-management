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
    trim: true
  },
  balance: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 1.0, // 默认不打折，1.0表示原价
    min: 0.1,     // 最低折扣0.1折
    max: 1.0      // 最高折扣1.0折（原价）
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 只保留店铺名称的索引，移除手机号唯一性约束
vipSchema.index({ storeName: 1 });

const Vip = mongoose.model('Vip', vipSchema);

module.exports = Vip; 
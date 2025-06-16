const Vip = require('../models/vip.model');
const Transaction = require('../models/transaction.model');
const { sendRechargeSms, sendConsumptionSms } = require('../services/sms.service');

// 获取所有VIP
exports.getAllVips = async (req, res) => {
  try {
    const vips = await Vip.find({ storeName: req.user.storeName });
    res.json(vips);
  } catch (error) {
    res.status(500).json({ message: '获取VIP列表失败' });
  }
};

// 获取单个VIP
exports.getVipById = async (req, res) => {
  try {
    const vip = await Vip.findOne({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    res.json(vip);
  } catch (error) {
    res.status(500).json({ message: '获取VIP信息失败' });
  }
};

// 创建VIP
exports.createVip = async (req, res) => {
  try {
    const vip = new Vip({
      ...req.body,
      storeName: req.user.storeName
    });
    await vip.save();
    res.status(201).json(vip);
  } catch (error) {
    res.status(500).json({ message: '创建VIP失败' });
  }
};

// 更新VIP
exports.updateVip = async (req, res) => {
  try {
    const vip = await Vip.findOneAndUpdate(
      { 
        _id: req.params.id,
        storeName: req.user.storeName 
      },
      req.body,
      { new: true }
    );
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    res.json(vip);
  } catch (error) {
    res.status(500).json({ message: '更新VIP失败' });
  }
};

// 删除VIP
exports.deleteVip = async (req, res) => {
  try {
    const vip = await Vip.findOneAndDelete({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除VIP失败' });
  }
};

// VIP充值
exports.rechargeVip = async (req, res) => {
  try {
    const vip = await Vip.findOne({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }

    const { amount, bonusAmount = 0, technicianId, notes } = req.body;
    const totalAmount = amount + bonusAmount;

    vip.balance += totalAmount;
    vip.transactions.push({
      type: 'recharge',
      amount: totalAmount,
      bonusAmount,
      technicianId,
      notes,
      createdAt: new Date()
    });

    await vip.save();
    res.json(vip);
  } catch (error) {
    res.status(500).json({ message: '充值失败' });
  }
};

// VIP消费
exports.consumeVip = async (req, res) => {
  try {
    const vip = await Vip.findOne({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }

    const { amount, technicianId, notes, customAmount = 0 } = req.body;
    const totalAmount = amount + customAmount;

    if (vip.balance < totalAmount) {
      return res.status(400).json({ message: '余额不足' });
    }

    vip.balance -= totalAmount;
    vip.transactions.push({
      type: 'consume',
      amount: totalAmount,
      technicianId,
      notes,
      createdAt: new Date()
    });

    await vip.save();
    res.json(vip);
  } catch (error) {
    res.status(500).json({ message: '消费失败' });
  }
};

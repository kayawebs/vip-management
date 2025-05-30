const Vip = require('../models/vip.model');
const Transaction = require('../models/transaction.model');
const { sendRechargeSms, sendConsumptionSms } = require('../services/sms.service');

// 获取所有VIP
exports.getAllVips = async (req, res) => {
  try {
    const vips = await Vip.find().sort({ name: 1 });
    res.status(200).json(vips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个VIP
exports.getVipById = async (req, res) => {
  try {
    const vip = await Vip.findById(req.params.id);
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    res.status(200).json(vip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建VIP
exports.createVip = async (req, res) => {
  try {
    const { name, phone, balance } = req.body;

    // 检查手机号是否已存在
    const existingVip = await Vip.findOne({ phone });
    if (existingVip) {
      return res.status(400).json({ message: '该手机号已注册' });
    }

    // 创建新VIP
    const newVip = new Vip({
      name,
      phone,
      balance: balance || 0
    });

    // 保存到数据库
    const savedVip = await newVip.save();
    res.status(201).json(savedVip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VIP充值
exports.rechargeVip = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, bonusAmount = 0, technicianId, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: '充值金额必须大于0' });
    }

    const vip = await Vip.findById(id);
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }

    // 更新余额（实际充值金额 + 赠送金额）
    vip.balance += amount + bonusAmount;
    await vip.save();

    // 记录交易
    const transaction = new Transaction({
      vip: vip._id,
      type: 'recharge',
      amount,
      bonusAmount,
      technician: technicianId,
      paymentMethod: 'cash',
      notes: notes || '会员充值'
    });

    await transaction.save();

    // 发送短信通知
    await sendRechargeSms(vip.phone, vip.name, amount, bonusAmount, vip.balance);

    res.status(200).json({
      success: true,
      vip,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VIP消费
exports.consumeVip = async (req, res) => {
  try {
    const { id } = req.params;
    const { projects, customAmount = 0, technicianId, notes } = req.body;

    if (!projects || !projects.length) {
      return res.status(400).json({ message: '请选择消费项目' });
    }

    if (!technicianId) {
      return res.status(400).json({ message: '请选择技师' });
    }

    const vip = await Vip.findById(id);
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }

    // 计算总金额
    let totalAmount = 0;
    for (const item of projects) {
      totalAmount += item.price * item.quantity;
    }
    // 加上自定义金额
    totalAmount += customAmount;

    // 检查余额
    if (vip.balance < totalAmount) {
      return res.status(400).json({ message: '余额不足' });
    }

    // 更新余额
    vip.balance -= totalAmount;
    await vip.save();

    // 记录交易
    const transaction = new Transaction({
      vip: vip._id,
      type: 'consumption',
      amount: totalAmount,
      projects: projects.map(p => ({
        project: p.id,
        quantity: p.quantity
      })),
      paymentMethod: 'vip_balance',
      technician: technicianId,
      notes: notes || '项目消费'
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      vip,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

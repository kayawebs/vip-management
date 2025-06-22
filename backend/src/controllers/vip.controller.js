const Vip = require('../models/vip.model');
const Transaction = require('../models/transaction.model');
const { sendRechargeSms, sendConsumptionSms, sendVipCreatedSms } = require('../services/sms.service');

// 输入验证函数
const validateVipData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('会员姓名至少需要2个字符');
  }
  
  if (!data.phone || !/^1\d{10}$/.test(data.phone)) {
    errors.push('请输入有效的11位手机号码');
  }
  
  if (data.balance && (isNaN(data.balance) || data.balance < 0)) {
    errors.push('余额必须是非负数');
  }

  if (data.discount && (isNaN(data.discount) || data.discount < 0.1 || data.discount > 1.0)) {
    errors.push('折扣必须在0.1到1.0之间');
  }
  
  return errors;
};

// 获取所有VIP
exports.getAllVips = async (req, res) => {
  try {
    const vips = await Vip.find({ storeName: req.user.storeName });
    res.json(vips);
  } catch (error) {
    console.error('获取VIP列表失败:', error);
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
    console.error('获取VIP信息失败:', error);
    res.status(500).json({ message: '获取VIP信息失败' });
  }
};

// 创建VIP
exports.createVip = async (req, res) => {
  try {
    // 输入验证
    const validationErrors = validateVipData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: validationErrors 
      });
    }

    // 清理输入数据
    const cleanData = {
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      balance: req.body.balance || 0,
      discount: req.body.discount || 1.0,
      storeName: req.user.storeName
    };

    const vip = new Vip(cleanData);
    await vip.save();

    // 如果设置了初始金额，创建充值记录
    if (cleanData.balance > 0) {
      const transaction = new Transaction({
        vip: vip._id,
        type: 'recharge',
        amount: cleanData.balance,
        bonusAmount: 0,
        technician: req.body.technicianId || null,
        notes: req.body.notes || '会员卡初始充值',
        date: new Date()
      });
      await transaction.save();
    }

    // 发送会员创建短信通知
    try {
      await sendVipCreatedSms(vip.phone, vip.name, vip.balance);
    } catch (smsError) {
      console.error('会员创建短信发送失败:', smsError);
      // 短信发送失败不影响VIP创建流程
    }
    
    res.status(201).json(vip);
  } catch (error) {
    console.error('创建VIP失败:', error);
    res.status(500).json({ message: '创建VIP失败' });
  }
};

// 更新VIP
exports.updateVip = async (req, res) => {
  try {
    // 输入验证
    const validationErrors = validateVipData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: validationErrors 
      });
    }

    // 清理输入数据
    const cleanData = {
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      balance: req.body.balance || 0,
      discount: req.body.discount || 1.0
    };

    const vip = await Vip.findOneAndUpdate(
      { 
        _id: req.params.id,
        storeName: req.user.storeName 
      },
      cleanData,
      { new: true }
    );
    
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    
    res.json(vip);
  } catch (error) {
    console.error('更新VIP失败:', error);
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
    console.error('删除VIP失败:', error);
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
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: '充值金额必须大于0' });
    }
    if (bonusAmount < 0) {
      return res.status(400).json({ message: '赠送金额不能为负数' });
    }
    const totalAmount = amount + bonusAmount;
    vip.balance += totalAmount;
    await vip.save();
    // 新建充值交易
    const transaction = new Transaction({
      vip: vip._id,
      type: 'recharge',
      amount: totalAmount,
      bonusAmount,
      technician: technicianId,
      notes
    });
    await transaction.save();

    // 发送充值短信通知
    try {
      await sendRechargeSms(vip.phone, amount, bonusAmount, vip.balance);
    } catch (smsError) {
      console.error('充值短信发送失败:', smsError);
      // 短信发送失败不影响充值流程
    }

    res.json({ vip, transaction });
  } catch (error) {
    console.error('充值失败:', error);
    res.status(500).json({ message: '充值失败' });
  }
};

// VIP消费
exports.consumeVip = async (req, res) => {
  try {
    const vip = await Vip.findOne({ _id: req.params.id });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    
    const { amount = 0, technicianId, notes, customAmount = 0, originalAmount = 0, discountedAmount = 0, finalAmount = 0 } = req.body;
    
    // 确保所有金额都是有效数字
    const validAmount = parseFloat(amount) || 0;
    const validCustomAmount = parseFloat(customAmount) || 0;
    const validOriginalAmount = parseFloat(originalAmount) || 0;
    const validDiscountedAmount = parseFloat(discountedAmount) || 0;
    const validFinalAmount = parseFloat(finalAmount) || 0;
    
    // 验证消费金额
    if (validAmount <= 0 && validCustomAmount <= 0) {
      return res.status(400).json({ message: '消费金额必须大于0' });
    }
    
    if (validCustomAmount < 0) {
      return res.status(400).json({ message: '自定义金额不能为负数' });
    }

    const totalAmount = validAmount + validCustomAmount;
    
    if (vip.balance < totalAmount) {
      return res.status(400).json({ message: '余额不足' });
    }

    vip.balance -= totalAmount;
    await vip.save();
    
    // 新建消费交易
    const transaction = new Transaction({
      vip: vip._id,
      type: 'consume',
      amount: totalAmount,
      originalAmount: validOriginalAmount,
      discountedAmount: validDiscountedAmount,
      finalAmount: validFinalAmount,
      customAmount: validCustomAmount,
      discount: vip.discount,
      technician: technicianId,
      notes
    });
    await transaction.save();

    // 发送消费短信通知
    try {
      await sendConsumptionSms(vip.phone, totalAmount, vip.balance);
    } catch (smsError) {
      console.error('消费短信发送失败:', smsError);
      // 短信发送失败不影响消费流程
    }

    res.json({ vip, transaction });
  } catch (error) {
    console.error('消费失败:', error);
    res.status(500).json({ message: '消费失败' });
  }
};

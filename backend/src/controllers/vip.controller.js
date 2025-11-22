const Vip = require('../models/vip.model');
const Transaction = require('../models/transaction.model');
const Project = require('../models/project.model');
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
    // 附带历史交易记录（充值/消费）
    const history = await Transaction.find({ vip: vip._id })
      .sort({ date: -1 });

    res.json({ ...vip.toObject(), history });
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
    const amt = parseFloat(amount);
    const bonus = parseFloat(bonusAmount) || 0;
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: '充值金额必须大于0' });
    }
    if (bonus < 0) {
      return res.status(400).json({ message: '赠送金额不能为负数' });
    }
    const totalAmount = Math.round((amt + bonus) * 100) / 100;
    vip.balance += totalAmount;
    await vip.save();
    // 新建充值交易
    const transaction = new Transaction({
      vip: vip._id,
      type: 'recharge',
      amount: totalAmount,
      bonusAmount: bonus,
      technician: technicianId || undefined,
      notes
    });
    await transaction.save();

    // 发送充值短信通知
    try {
      await sendRechargeSms(vip.phone, amt, bonus, vip.balance);
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
    const vip = await Vip.findOne({ _id: req.params.id, storeName: req.user.storeName });
    if (!vip) {
      return res.status(404).json({ message: 'VIP不存在' });
    }
    const { amount = 0, technicianId, notes, customAmount = 0 } = req.body;
    const projectsInput = Array.isArray(req.body.projects) ? req.body.projects : [];

    // 若传入项目列表，则按项目价格与数量计算
    let computedOriginal = 0;
    let computedDiscounted = 0;
    let computedFinal = 0;
    let validCustomAmount = parseFloat(customAmount) || 0;
    let totalAmount = 0;
    let projectsForTxn = [];

    if (projectsInput.length > 0) {
      const ids = projectsInput.map(p => p.project || p.id).filter(Boolean);
      const qtyMap = new Map();
      for (const p of projectsInput) {
        const key = String(p.project || p.id || '');
        if (!key) continue;
        const q = Number(p.quantity) > 0 ? Number(p.quantity) : 1;
        qtyMap.set(key, (qtyMap.get(key) || 0) + q);
      }
      const found = await Project.find({ _id: { $in: ids }, storeName: req.user.storeName });
      if (ids.length === 0 || found.length === 0) {
        return res.status(400).json({ message: '请选择有效项目或输入自定义金额' });
      }
      if (found.length !== ids.length) {
        return res.status(400).json({ message: '项目不存在或不属于该门店' });
      }
      for (const proj of found) {
        const q = qtyMap.get(String(proj._id)) || 1;
        computedOriginal += proj.price * q;
        projectsForTxn.push({ project: proj._id, quantity: q });
      }
      // 按会员折扣计算
      computedDiscounted = Math.round(computedOriginal * vip.discount * 100) / 100;
      computedFinal = computedDiscounted; // 当前无额外费用/优惠
      totalAmount = computedFinal + validCustomAmount; // 允许叠加自定义金额
    } else {
      // 兼容旧入参：amount + customAmount
      const validAmount = parseFloat(amount) || 0;
      if (validAmount <= 0 && validCustomAmount <= 0) {
        return res.status(400).json({ message: '消费金额必须大于0' });
      }
      if (validCustomAmount < 0) {
        return res.status(400).json({ message: '自定义金额不能为负数' });
      }
      totalAmount = validAmount + validCustomAmount;
      computedOriginal = validAmount;
      computedDiscounted = validAmount; // 未提供项目，视为已折后金额
      computedFinal = validAmount;
    }
    if (totalAmount <= 0) {
      return res.status(400).json({ message: '消费金额必须大于0' });
    }

    if (vip.balance < totalAmount) {
      return res.status(400).json({ message: '余额不足' });
    }

    vip.balance -= totalAmount;
    await vip.save();

    const transaction = new Transaction({
      vip: vip._id,
      type: 'consume',
      amount: totalAmount,
      originalAmount: computedOriginal,
      discountedAmount: computedDiscounted,
      finalAmount: computedFinal,
      customAmount: validCustomAmount,
      discount: vip.discount,
      technician: technicianId,
      notes,
      projects: projectsForTxn
    });
    await transaction.save();

    try {
      await sendConsumptionSms(vip.phone, totalAmount, vip.balance);
    } catch (smsError) {
      console.error('消费短信发送失败:', smsError);
    }

    res.json({ vip, transaction });
  } catch (error) {
    console.error('消费失败:', error);
    res.status(500).json({ message: '消费失败' });
  }
};

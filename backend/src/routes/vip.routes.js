const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vip.controller');

// 获取所有VIP
router.get('/', vipController.getAllVips);

// 获取单个VIP详情
router.get('/:id', vipController.getVipById);

// 创建新VIP
router.post('/', vipController.createVip);

// VIP充值
router.post('/:id/recharge', vipController.rechargeVip);

// VIP消费
router.post('/:id/consume', vipController.consumeVip);

module.exports = router; 
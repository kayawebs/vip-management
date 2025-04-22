const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// 获取所有交易记录（可筛选）
router.get('/transactions', reportController.getTransactions);

// 获取充值报表
router.get('/recharge', reportController.getRechargeReport);

// 获取消费报表
router.get('/consumption', reportController.getConsumptionReport);

module.exports = router; 
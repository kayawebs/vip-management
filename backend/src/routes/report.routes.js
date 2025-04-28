const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// 获取所有交易记录（可筛选）
router.get('/transactions', reportController.getTransactions);

// 获取充值报表
router.get('/recharge', reportController.getRechargeReport);

// 获取消费报表
router.get('/consumption', reportController.getConsumptionReport);

// 获取 VIP 概览数据
router.get('/summary/vip', reportController.getVipSummary);

// 获取平台 (Douyin/Meituan) 概览数据
// Requires 'platform' query param (e.g., /summary/platform?platform=douyin)
router.get('/summary/platform', reportController.getPlatformSummary);

// 获取现金/POS 概览数据
router.get('/summary/cash', reportController.getCashSummary);

// --- Manual Daily Report Route --- 
// Create or Update a Daily Report
router.post('/daily', reportController.createDailyReport);

module.exports = router; 
const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vip.controller');
const auth = require('../middleware/auth.middleware');

// 所有VIP路由都需要认证
router.use(auth);

// 获取所有VIP
router.get('/', vipController.getAllVips);

// 获取单个VIP详情
router.get('/:id', vipController.getVipById);

// 创建新VIP
router.post('/', vipController.createVip);

// 更新VIP
router.put('/:id', vipController.updateVip);

// 删除VIP
router.delete('/:id', vipController.deleteVip);

// VIP充值
router.post('/:id/recharge', vipController.rechargeVip);

// VIP消费
router.post('/:id/consume', vipController.consumeVip);

module.exports = router; 
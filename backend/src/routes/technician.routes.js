const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technician.controller');
const auth = require('../middleware/auth.middleware');

// 所有技师路由都需要认证
router.use(auth);

// 获取所有技师
router.get('/', technicianController.getAllTechnicians);

// 获取单个技师详情
router.get('/:id', technicianController.getTechnicianById);

// 创建新技师
router.post('/', technicianController.createTechnician);

// 更新技师信息
router.put('/:id', technicianController.updateTechnician);

// 删除技师
router.delete('/:id', technicianController.deleteTechnician);

module.exports = router; 
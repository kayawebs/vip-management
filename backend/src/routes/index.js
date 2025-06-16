const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const auth = require('../middleware/auth.middleware');

// 公开路由
router.use('/auth', authRoutes);

// 受保护的路由
router.use('/vip', auth, require('./vip.routes'));
router.use('/technician', auth, require('./technician.routes'));
router.use('/project', auth, require('./project.routes'));
router.use('/report', auth, require('./report.routes'));

module.exports = router; 
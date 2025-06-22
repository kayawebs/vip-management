const express = require('express');
const router = express.Router();
const converterController = require('../controllers/converter.controller');

// 获取汇率
router.get('/rates', converterController.getRates);

module.exports = router; 
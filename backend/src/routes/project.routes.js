const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');

// 所有项目路由都需要认证
router.use(auth);

// 获取所有项目
router.get('/', projectController.getAllProjects);

// 获取单个项目详情
router.get('/:id', projectController.getProjectById);

// 创建新项目
router.post('/', projectController.createProject);

// 更新项目
router.put('/:id', projectController.updateProject);

// 删除项目
router.delete('/:id', projectController.deleteProject);

module.exports = router; 
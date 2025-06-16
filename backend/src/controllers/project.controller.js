const Project = require('../models/project.model');

// 获取所有项目
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ storeName: req.user.storeName });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: '获取项目列表失败' });
  }
};

// 获取单个项目
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: '获取项目信息失败' });
  }
};

// 创建项目
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      storeName: req.user.storeName
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: '创建项目失败' });
  }
};

// 更新项目
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { 
        _id: req.params.id,
        storeName: req.user.storeName 
      },
      req.body,
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: '更新项目失败' });
  }
};

// 删除项目
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除项目失败' });
  }
}; 
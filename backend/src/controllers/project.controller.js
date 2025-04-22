const Project = require('../models/project.model');

// 获取所有项目
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个项目
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建项目
exports.createProject = async (req, res) => {
  try {
    const { name, duration, price, notes } = req.body;
    
    if (!name || !duration || !price) {
      return res.status(400).json({ message: '项目名称、时长和价格为必填项' });
    }
    
    const newProject = new Project({
      name,
      duration,
      price,
      notes
    });
    
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新项目
exports.updateProject = async (req, res) => {
  try {
    const { name, duration, price, notes, isActive } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, duration, price, notes, isActive },
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除项目（软删除，设置isActive为false）
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    res.status(200).json({ message: '项目已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
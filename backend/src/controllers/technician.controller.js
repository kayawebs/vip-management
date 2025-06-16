const Technician = require('../models/technician.model');

// 获取所有技师
exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find({ storeName: req.user.storeName });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: '获取技师列表失败' });
  }
};

// 获取单个技师
exports.getTechnicianById = async (req, res) => {
  try {
    const technician = await Technician.findOne({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!technician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: '获取技师信息失败' });
  }
};

// 创建技师
exports.createTechnician = async (req, res) => {
  try {
    const technician = new Technician({
      ...req.body,
      storeName: req.user.storeName
    });
    await technician.save();
    res.status(201).json(technician);
  } catch (error) {
    res.status(500).json({ message: '创建技师失败' });
  }
};

// 更新技师
exports.updateTechnician = async (req, res) => {
  try {
    const technician = await Technician.findOneAndUpdate(
      { 
        _id: req.params.id,
        storeName: req.user.storeName 
      },
      req.body,
      { new: true }
    );
    if (!technician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: '更新技师失败' });
  }
};

// 删除技师
exports.deleteTechnician = async (req, res) => {
  try {
    const technician = await Technician.findOneAndDelete({ 
      _id: req.params.id,
      storeName: req.user.storeName 
    });
    if (!technician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除技师失败' });
  }
}; 
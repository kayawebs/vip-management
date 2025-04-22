const Technician = require('../models/technician.model');

// 获取所有技师
exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个技师
exports.getTechnicianById = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    res.status(200).json(technician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建技师
exports.createTechnician = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ message: '技师姓名和编号为必填项' });
    }
    
    // 检查编号是否已存在
    const existingTechnician = await Technician.findOne({ code });
    if (existingTechnician) {
      return res.status(400).json({ message: '该编号已存在' });
    }
    
    const newTechnician = new Technician({
      name,
      code
    });
    
    const savedTechnician = await newTechnician.save();
    res.status(201).json(savedTechnician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新技师
exports.updateTechnician = async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    
    // 如果修改了编号，检查是否与其他技师冲突
    if (code) {
      const existingTechnician = await Technician.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingTechnician) {
        return res.status(400).json({ message: '该编号已存在' });
      }
    }
    
    const updatedTechnician = await Technician.findByIdAndUpdate(
      req.params.id,
      { name, code, isActive },
      { new: true, runValidators: true }
    );
    
    if (!updatedTechnician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    
    res.status(200).json(updatedTechnician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除技师（软删除，设置isActive为false）
exports.deleteTechnician = async (req, res) => {
  try {
    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!technician) {
      return res.status(404).json({ message: '技师不存在' });
    }
    
    res.status(200).json({ message: '技师已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
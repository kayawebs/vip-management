const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// 输入验证函数
const validateRegistration = (storeName, username, password) => {
  const errors = [];
  
  if (!storeName || storeName.trim().length < 2) {
    errors.push('店铺名至少需要2个字符');
  }
  
  if (!username || username.trim().length < 3) {
    errors.push('用户名至少需要3个字符');
  }
  
  if (!password || password.length < 6) {
    errors.push('密码至少需要6个字符');
  }
  
  return errors;
};

const validateLogin = (username, password) => {
  const errors = [];
  
  if (!username || !username.trim()) {
    errors.push('用户名不能为空');
  }
  
  if (!password) {
    errors.push('密码不能为空');
  }
  
  return errors;
};

// 注册新用户
exports.register = async (req, res) => {
  try {
    const { storeName, username, password } = req.body;

    // 输入验证
    const validationErrors = validateRegistration(storeName, username, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: validationErrors 
      });
    }

    // 清理输入数据
    const cleanStoreName = storeName.trim();
    const cleanUsername = username.trim().toLowerCase();

    // 检查店铺名是否已存在
    const existingStore = await User.findOne({ storeName: cleanStoreName });
    if (existingStore) {
      return res.status(400).json({ message: '店铺名已被使用' });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已被使用' });
    }

    // 创建新用户
    const user = new User({
      storeName: cleanStoreName,
      username: cleanUsername,
      password
    });

    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        storeName: user.storeName,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        storeName: user.storeName,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    
    // 处理MongoDB唯一性约束错误
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'storeName' ? '店铺名' : '用户名';
      return res.status(400).json({ message: `${fieldName}已被使用` });
    }
    
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 输入验证
    const validationErrors = validateLogin(username, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: validationErrors 
      });
    }

    // 清理用户名
    const cleanUsername = username.trim().toLowerCase();

    // 查找用户
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        storeName: user.storeName,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        storeName: user.storeName,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

// 验证token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    res.json({
      message: '令牌有效',
      user: {
        id: user._id,
        storeName: user.storeName,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('令牌验证失败:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    
    res.status(500).json({ message: '令牌验证失败' });
  }
}; 
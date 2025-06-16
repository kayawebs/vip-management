const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// 注册新用户
exports.register = async (req, res) => {
  try {
    const { storeName, username, password } = req.body;

    // 检查店铺名是否已存在
    const existingStore = await User.findOne({ storeName });
    if (existingStore) {
      return res.status(400).json({ message: '店铺名已被使用' });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已被使用' });
    }

    // 创建新用户
    const user = new User({
      storeName,
      username,
      password
    });

    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, storeName: user.storeName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        storeName: user.storeName,
        username: user.username
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });
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
      { userId: user._id, storeName: user.storeName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        storeName: user.storeName,
        username: user.username
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
}; 
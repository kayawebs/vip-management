const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查用户是否仍然存在
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: '用户不存在，请重新登录' });
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: user._id,
      storeName: user.storeName,
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '认证令牌已过期，请重新登录' });
    }
    
    res.status(401).json({ message: '认证失败，请重新登录' });
  }
};

module.exports = auth; 
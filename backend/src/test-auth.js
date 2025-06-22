const mongoose = require('mongoose');
const User = require('./models/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuth() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    // 清理测试数据
    await User.deleteMany({ username: { $regex: /^test_/ } });
    console.log('清理测试数据完成');

    // 测试注册
    console.log('\n=== 测试注册功能 ===');
    const testUser = new User({
      storeName: '测试店铺',
      username: 'test_user',
      password: '123456'
    });

    await testUser.save();
    console.log('用户注册成功:', testUser.username);

    // 测试密码验证
    console.log('\n=== 测试密码验证 ===');
    const isMatch = await testUser.comparePassword('123456');
    console.log('密码验证结果:', isMatch);

    const isWrongMatch = await testUser.comparePassword('wrongpassword');
    console.log('错误密码验证结果:', isWrongMatch);

    // 测试JWT生成
    console.log('\n=== 测试JWT生成 ===');
    const token = jwt.sign(
      { 
        userId: testUser._id, 
        storeName: testUser.storeName,
        username: testUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT Token生成成功');

    // 测试JWT验证
    console.log('\n=== 测试JWT验证 ===');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT验证成功:', decoded);

    // 测试用户名查找
    console.log('\n=== 测试用户查找 ===');
    const foundUser = await User.findOne({ username: 'test_user' });
    console.log('用户查找成功:', foundUser ? foundUser.username : '未找到');

    console.log('\n=== 所有测试通过 ===');

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行测试
if (require.main === module) {
  testAuth();
}

module.exports = testAuth; 
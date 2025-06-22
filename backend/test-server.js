const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testServer() {
  try {
    console.log('开始测试服务器...\n');

    // 测试服务器是否运行
    console.log('1. 测试服务器连接...');
    try {
      await axios.get(`${API_BASE_URL}/auth/verify`);
      console.log('✅ 服务器连接正常');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 服务器连接正常（需要认证）');
      } else {
        console.log('❌ 服务器连接失败:', error.message);
        return;
      }
    }

    // 测试认证端点
    console.log('\n2. 测试认证端点...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'test_user',
        password: 'wrong_password'
      });
      console.log('❌ 登录应该失败');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 认证端点正常（拒绝错误密码）');
      } else {
        console.log('❌ 认证端点异常:', error.message);
      }
    }

    // 测试需要认证的端点（应该返回401）
    console.log('\n3. 测试需要认证的端点...');
    try {
      await axios.get(`${API_BASE_URL}/vip`);
      console.log('❌ 应该需要认证');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 认证保护正常（返回401）');
      } else {
        console.log('❌ 认证保护异常:', error.message);
      }
    }

    // 测试汇率端点（不需要认证）
    console.log('\n4. 测试汇率端点...');
    try {
      const response = await axios.get(`${API_BASE_URL}/converter/rates`);
      if (response.data.success) {
        console.log('✅ 汇率端点正常');
      } else {
        console.log('❌ 汇率端点返回错误数据');
      }
    } catch (error) {
      console.log('❌ 汇率端点异常:', error.message);
    }

    console.log('\n🎉 服务器测试完成！');

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testServer();
}

module.exports = testServer; 
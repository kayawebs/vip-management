const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testSimple() {
  try {
    console.log('开始简单测试...\n');

    // 1. 注册用户
    console.log('1. 注册用户...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      storeName: '测试店铺',
      username: 'test_user',
      password: '123456'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ 注册成功，token:', token.substring(0, 20) + '...');

    // 设置认证头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 创建VIP
    console.log('\n2. 创建VIP...');
    const vipData = {
      name: '测试会员',
      phone: '13800138001',
      balance: 100,
      discount: 0.8
    };

    const createResponse = await axios.post(`${API_BASE_URL}/vip`, vipData, { headers });
    console.log('✅ 创建VIP成功');
    console.log('响应数据:', JSON.stringify(createResponse.data, null, 2));

    // 3. 获取VIP列表
    console.log('\n3. 获取VIP列表...');
    const listResponse = await axios.get(`${API_BASE_URL}/vip`, { headers });
    console.log('✅ 获取VIP列表成功');
    console.log('响应数据:', JSON.stringify(listResponse.data, null, 2));

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testSimple(); 
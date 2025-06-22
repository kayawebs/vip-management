const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testVip() {
  try {
    console.log('开始测试VIP功能...\n');

    // 1. 先注册一个测试用户
    console.log('1. 注册测试用户...');
    let token;
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        storeName: '测试店铺',
        username: 'test_user',
        password: '123456'
      });
      token = registerResponse.data.token;
      console.log('✅ 注册成功');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('已被使用')) {
        // 用户已存在，尝试登录
        console.log('用户已存在，尝试登录...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          username: 'test_user',
          password: '123456'
        });
        token = loginResponse.data.token;
        console.log('✅ 登录成功');
      } else {
        console.log('❌ 注册/登录失败:', error.response?.data?.message || error.message);
        return;
      }
    }

    // 设置认证头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 测试创建VIP
    console.log('\n2. 测试创建VIP...');
    try {
      const vipData = {
        name: '张三',
        phone: '13800138001',
        balance: 100,
        discount: 0.8 // 8折
      };

      const createResponse = await axios.post(`${API_BASE_URL}/vip`, vipData, { headers });
      console.log('✅ 创建VIP成功:', createResponse.data.name);
      console.log('✅ VIP折扣:', createResponse.data.discount);
      
      const vipId = createResponse.data._id;

      // 3. 测试获取VIP列表
      console.log('\n3. 测试获取VIP列表...');
      const listResponse = await axios.get(`${API_BASE_URL}/vip`, { headers });
      console.log('✅ 获取VIP列表成功，共', listResponse.data.length, '个会员');

      // 4. 测试获取单个VIP
      console.log('\n4. 测试获取单个VIP...');
      const getResponse = await axios.get(`${API_BASE_URL}/vip/${vipId}`, { headers });
      console.log('✅ 获取VIP详情成功:', getResponse.data.name);

      // 5. 测试VIP充值
      console.log('\n5. 测试VIP充值...');
      const rechargeData = {
        amount: 200,
        bonusAmount: 20,
        notes: '测试充值'
      };
      const rechargeResponse = await axios.post(`${API_BASE_URL}/vip/${vipId}/recharge`, rechargeData, { headers });
      console.log('✅ VIP充值成功，新余额:', rechargeResponse.data.balance);

      // 6. 测试VIP消费（测试折扣功能）
      console.log('\n6. 测试VIP消费（折扣功能）...');
      const consumeData = {
        amount: 100, // 原价100元
        notes: '测试消费（8折）',
        originalAmount: 100,
        finalAmount: 80 // 8折后80元
      };
      const consumeResponse = await axios.post(`${API_BASE_URL}/vip/${vipId}/consume`, consumeData, { headers });
      console.log('✅ VIP消费成功，新余额:', consumeResponse.data.balance);
      
      // 检查交易记录中的折扣信息
      const lastTransaction = consumeResponse.data.transactions[consumeResponse.data.transactions.length - 1];
      console.log('✅ 交易记录折扣信息:', {
        originalAmount: lastTransaction.originalAmount,
        finalAmount: lastTransaction.finalAmount,
        discount: lastTransaction.discount
      });

      // 7. 测试创建相同手机号的VIP（现在应该允许）
      console.log('\n7. 测试创建相同手机号的VIP...');
      try {
        const duplicateVipData = {
          name: '李四',
          phone: '13800138001', // 相同手机号
          balance: 0,
          discount: 1.0
        };
        const duplicateResponse = await axios.post(`${API_BASE_URL}/vip`, duplicateVipData, { headers });
        console.log('✅ 成功创建相同手机号的VIP:', duplicateResponse.data.name);
      } catch (error) {
        console.log('❌ 创建相同手机号VIP失败:', error.response?.data?.message || error.message);
      }

      // 8. 测试更新VIP
      console.log('\n8. 测试更新VIP...');
      const updateData = {
        name: '张三（已更新）',
        phone: '13800138002',
        balance: 300,
        discount: 0.9 // 9折
      };
      const updateResponse = await axios.put(`${API_BASE_URL}/vip/${vipId}`, updateData, { headers });
      console.log('✅ 更新VIP成功:', updateResponse.data.name);
      console.log('✅ 更新后折扣:', updateResponse.data.discount);

      // 9. 测试删除VIP
      console.log('\n9. 测试删除VIP...');
      await axios.delete(`${API_BASE_URL}/vip/${vipId}`, { headers });
      console.log('✅ 删除VIP成功');

      console.log('\n🎉 VIP功能测试完成！');

    } catch (error) {
      console.error('VIP测试失败:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testVip();
}

module.exports = testVip;
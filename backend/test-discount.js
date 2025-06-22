const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDiscount() {
  try {
    console.log('开始测试VIP折扣功能...\n');

    // 1. 注册用户
    console.log('1. 注册用户...');
    let token;
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        storeName: '折扣测试店铺',
        username: 'discount_test',
        password: '123456'
      });
      token = registerResponse.data.token;
      console.log('✅ 注册成功');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('已被使用')) {
        // 用户已存在，尝试登录
        console.log('用户已存在，尝试登录...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          username: 'discount_test',
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

    // 2. 创建8折VIP
    console.log('\n2. 创建8折VIP...');
    const vipData = {
      name: '折扣测试会员',
      phone: '13800138001',
      balance: 1000,
      discount: 0.8 // 8折
    };

    const createResponse = await axios.post(`${API_BASE_URL}/vip`, vipData, { headers });
    console.log('✅ 创建VIP成功');
    console.log('VIP折扣:', createResponse.data.discount);
    console.log('VIP余额:', createResponse.data.balance);
    
    const vipId = createResponse.data._id;

    // 3. 测试消费（项目100元8折后80元 + 自定义20元 = 100元）
    console.log('\n3. 测试消费（项目100元8折后80元 + 自定义20元 = 100元）...');
    const consumeData = {
      amount: 100, // 总消费金额
      notes: '测试项目折扣+自定义金额',
      originalAmount: 100, // 项目原价
      discountedAmount: 80, // 项目折扣后价格
      finalAmount: 100, // 总消费金额（80+20）
      customAmount: 20 // 自定义金额
    };
    
    const consumeResponse = await axios.post(`${API_BASE_URL}/vip/${vipId}/consume`, consumeData, { headers });
    console.log('✅ 消费成功');
    console.log('消费后余额:', consumeResponse.data.balance);
    
    // 检查交易记录
    const lastTransaction = consumeResponse.data.transactions[consumeResponse.data.transactions.length - 1];
    console.log('交易记录:', {
      type: lastTransaction.type,
      originalAmount: lastTransaction.originalAmount,
      discountedAmount: lastTransaction.discountedAmount,
      finalAmount: lastTransaction.finalAmount,
      customAmount: lastTransaction.customAmount,
      discount: lastTransaction.discount,
      amount: lastTransaction.amount
    });

    // 4. 测试纯自定义金额消费（不参与折扣）
    console.log('\n4. 测试纯自定义金额消费（不参与折扣）...');
    const consumeData2 = {
      amount: 50, // 自定义金额
      notes: '纯自定义金额消费',
      originalAmount: 0, // 无项目
      discountedAmount: 0, // 无项目折扣
      finalAmount: 50, // 总消费金额
      customAmount: 50 // 自定义金额
    };
    
    const consumeResponse2 = await axios.post(`${API_BASE_URL}/vip/${vipId}/consume`, consumeData2, { headers });
    console.log('✅ 纯自定义金额消费成功');
    console.log('消费后余额:', consumeResponse2.data.balance);

    console.log('\n🎉 折扣功能测试完成！');

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testDiscount(); 
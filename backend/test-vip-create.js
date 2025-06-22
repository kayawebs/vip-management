const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testVipCreateWithInitialBalance() {
  try {
    // 1. 先登录获取token
    console.log('1. 登录获取token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('登录成功，获取到token');

    // 2. 创建VIP会员，设置初始余额
    console.log('\n2. 创建VIP会员，设置初始余额...');
    const vipData = {
      name: '测试会员',
      phone: '13800138001',
      balance: 500, // 初始余额
      discount: 0.8,
      technicianId: null, // 可选
      notes: '测试初始充值' // 可选
    };

    const createResponse = await axios.post(`${API_BASE_URL}/vip`, vipData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const vip = createResponse.data;
    console.log('VIP创建成功:', {
      id: vip._id,
      name: vip.name,
      phone: vip.phone,
      balance: vip.balance,
      discount: vip.discount
    });

    // 3. 查询该VIP的充值记录
    console.log('\n3. 查询VIP的充值记录...');
    const rechargeResponse = await axios.get(`${API_BASE_URL}/reports/recharge?phone=${vip.phone}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const rechargeData = rechargeResponse.data;
    console.log('充值记录查询结果:');
    console.log('- 总充值金额:', rechargeData.summary.totalAmount);
    console.log('- 充值记录数量:', rechargeData.summary.totalCount);
    
    if (rechargeData.transactions.length > 0) {
      const firstRecharge = rechargeData.transactions[0];
      console.log('- 最新充值记录:', {
        amount: firstRecharge.amount,
        bonusAmount: firstRecharge.bonusAmount,
        notes: firstRecharge.notes,
        date: firstRecharge.date
      });
    }

    // 4. 查询该VIP的交易记录
    console.log('\n4. 查询VIP的所有交易记录...');
    const transactionResponse = await axios.get(`${API_BASE_URL}/reports/transactions?vipId=${vip._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const transactions = transactionResponse.data;
    console.log('交易记录数量:', transactions.length);
    transactions.forEach((t, index) => {
      console.log(`- 交易${index + 1}:`, {
        type: t.type,
        amount: t.amount,
        notes: t.notes,
        date: t.date
      });
    });

    console.log('\n✅ 测试完成！VIP创建和初始充值记录功能正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testVipCreateWithInitialBalance(); 
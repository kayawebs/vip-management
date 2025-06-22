const { sendRechargeSms, sendConsumptionSms, sendVipCreatedSms } = require('./src/services/sms.service');

async function testSmsService() {
  console.log('开始测试短信服务...\n');

  // 测试充值短信
  console.log('1. 测试充值短信...');
  try {
    const rechargeResult = await sendRechargeSms('17621783357', 500, 50, 550);
    console.log('充值短信发送结果:', rechargeResult ? '成功' : '失败');
  } catch (error) {
    console.error('充值短信测试失败:', error.message);
  }

  console.log('\n2. 测试消费短信...');
  try {
    const consumptionResult = await sendConsumptionSms('17621783357', 200, 350);
    console.log('消费短信发送结果:', consumptionResult ? '成功' : '失败');
  } catch (error) {
    console.error('消费短信测试失败:', error.message);
  }

  console.log('\n3. 测试会员创建短信...');
  try {
    const vipCreatedResult = await sendVipCreatedSms('17621783357', '张三', 1000);
    console.log('会员创建短信发送结果:', vipCreatedResult ? '成功' : '失败');
  } catch (error) {
    console.error('会员创建短信测试失败:', error.message);
  }

  console.log('\n短信服务测试完成！');
}

// 运行测试
testSmsService(); 
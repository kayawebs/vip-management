const { sendConsumptionSms, sendRechargeSms } = require('../services/sms.service');

async function testSms() {
  const phoneNumber = '+8617621783357';

  try {
    console.log('开始测试短信发送...');

    // 测试消费短信
    console.log('\n测试消费短信:');
    const consumptionResult = await sendConsumptionSms(
      phoneNumber,
      100.50,  // 消费金额
      500.00   // 余额
    );
    console.log('消费短信发送结果:', consumptionResult);

    // // 等待2秒，避免发送太快
    // await new Promise(resolve => setTimeout(resolve, 2000));
    //
    // // 测试充值短信
    // console.log('\n测试充值短信:');
    // const rechargeResult = await sendRechargeSms(
    //   phoneNumber,
    //   200.00,  // 充值金额
    //   50.00,   // 赠送金额
    //   750.00   // 余额
    // );
    // console.log('充值短信发送结果:', rechargeResult);
    //
    // console.log('\n短信测试完成！');
  } catch (error) {
    console.error('短信测试失败:', error);
  }
}

// 运行测试
testSms();

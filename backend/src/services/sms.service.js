const { Vonage } = require('@vonage/server-sdk')
const dotenv = require('dotenv');
dotenv.config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
})

/**
 * 发送消费通知短信
 * @param {string} phoneNumber 手机号码
 * @param {string} vipName VIP姓名
 * @param {number} amount 消费金额
 * @param {number} balance 余额
 * @returns {Promise} 短信发送结果
 */
const sendConsumptionSms = async (phoneNumber, vipName, amount, balance) => {
  const to = `+86${phoneNumber}`;
  const from = "Vonage APIs";
  const text = `【芯瑜健康】尊敬的${vipName}，您在本店消费了${amount}元，当前余额为${balance}元。感谢您的光临！`;
  try {
    return await vonage.sms.send({to, from, text});
  } catch (error) {
    console.error("短信发送失败:", error);
    throw error;
  }
};

/**
 * 发送充值通知短信
 * @param {string} phoneNumber 手机号码
 * @param {string} vipName VIP姓名
 * @param {number} amount 充值金额
 * @param {number} balance 余额
 * @returns {Promise} 短信发送结果
 */
const sendRechargeSms = async (phoneNumber, vipName, amount, balance) => {
  const to = `+86${phoneNumber}`;
  const from = "Vonage APIs";
  const text = `【芯瑜健康】尊敬的${vipName}，您已成功充值${amount}元，当前余额为${balance}元。感谢您的支持！`;
  try {
    return await vonage.sms.send({to, from, text});
  } catch (error) {
    console.error("短信发送失败:", error);
    throw error;
  }
};

module.exports = {
  sendConsumptionSms,
  sendRechargeSms
};

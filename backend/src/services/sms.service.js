const qiniu = require('qiniu');
const dotenv = require('dotenv');
const {sendSingleMessage} = require("qiniu");
dotenv.config();

// 配置七牛云
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;

// 创建七牛云客户端
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

/**
 * 发送消费通知短信
 * @param {string} phoneNumber 手机号码
 * @param {number} amount 消费金额
 * @param {number} balance 余额
 * @returns {Promise} 短信发送结果
 */
const sendConsumptionSms = async (phoneNumber, amount, balance) => {
  try {
    const templateId = process.env.QINIU_SMS_CONSUMPTION_TEMPLATE_ID;
    const params = {
      consumption: amount.toFixed(2),
      balance: balance.toFixed(2)
    };

    return new Promise((resolve, reject) => {
      qiniu.sms.message.sendSingleMessage({
        template_id: templateId,
        mobile: phoneNumber,
        parameters: params
      }, mac, (err, respBody, respInfo) => {
        if (err) {
          console.error("短信发送失败:", err);
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          console.error("短信发送失败:", respBody);
          reject(new Error(respBody.error || '短信发送失败'));
          return;
        }
        resolve(respBody);
      });
    });
  } catch (error) {
    console.error("短信发送失败:", error);
    throw error;
  }
};

/**
 * 发送充值通知短信
 * @param {string} phoneNumber 手机号码
 * @param {number} amount 充值金额
 * @param {number} bonusAmount 赠送金额
 * @param {number} balance 余额
 * @returns {Promise} 短信发送结果
 */
const sendRechargeSms = async (phoneNumber, amount, bonusAmount, balance) => {
  try {
    const templateId = process.env.QINIU_SMS_RECHARGE_TEMPLATE_ID;
    const params = {
      recharge: amount.toFixed(2),
      gift: bonusAmount ? bonusAmount.toFixed(2) : '0.00',
      balance: balance.toFixed(2)
    };

    return new Promise((resolve, reject) => {
      qiniu.sms.message.sendMessage({
        template_id: templateId,
        mobiles: [phoneNumber],
        parameters: params
      }, mac, (err, respBody, respInfo) => {
        if (err) {
          console.error("短信发送失败:", err);
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          console.error("短信发送失败:", respBody);
          reject(new Error(respBody.error || '短信发送失败'));
          return;
        }
        resolve(respBody);
      });
    });
  } catch (error) {
    console.error("短信发送失败:", error);
    throw error;
  }
};

module.exports = {
  sendConsumptionSms,
  sendRechargeSms
};

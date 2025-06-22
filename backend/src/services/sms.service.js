// 阿里云短信服务
// 注意：需要先安装依赖包：
// npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client @alicloud/tea-util @alicloud/credentials @alicloud/tea-typescript

const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');

class SmsService {
  constructor() {
    this.client = this.createClient();
    this.signName = "杭州芯瑜健康管理";
  }

  /**
   * 创建阿里云短信客户端
   */
  createClient() {
    try {
      // 不指定参数
      const credentialClient = new Credential.default();
      const config = new OpenApi.Config({
        credential: credentialClient,
      });
      config.endpoint = 'dysmsapi.aliyuncs.com';
      return new Dysmsapi20170525.default(config);
    } catch (error) {
      console.error('创建短信客户端失败:', error);
      return null;
    }
  }

  /**
   * 发送充值短信
   * @param {string} phone 手机号
   * @param {number} recharge 充值金额
   * @param {number} gift 赠送金额
   * @param {number} balance 当前余额
   */
  async sendRechargeSms(phone, recharge, gift = 0, balance) {
    try {
      if (!this.client) {
        console.error('短信客户端未初始化');
        return false;
      }

      const templateParam = JSON.stringify({
        recharge: recharge.toString(),
        gift: gift.toString(),
        balance: balance.toString()
      });

      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        signName: this.signName,
        templateCode: "SMS_488625041",
        phoneNumbers: phone,
        templateParam: templateParam,
      });

      const runtime = new Util.RuntimeOptions({});
      const result = await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
      
      console.log('充值短信发送成功:', {
        phone,
        recharge,
        gift,
        balance,
        result: result.body
      });
      
      return true;
    } catch (error) {
      console.error('充值短信发送失败:', {
        phone,
        recharge,
        gift,
        balance,
        error: error.message
      });
      
      if (error.data && error.data.Recommend) {
        console.error('诊断地址:', error.data.Recommend);
      }
      
      return false;
    }
  }

  /**
   * 发送消费短信
   * @param {string} phone 手机号
   * @param {number} consumption 消费金额
   * @param {number} balance 当前余额
   */
  async sendConsumptionSms(phone, consumption, balance) {
    try {
      if (!this.client) {
        console.error('短信客户端未初始化');
        return false;
      }

      const templateParam = JSON.stringify({
        consumption: consumption.toString(),
        balance: balance.toString()
      });

      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        signName: this.signName,
        templateCode: "SMS_488640049",
        phoneNumbers: phone,
        templateParam: templateParam,
      });

      const runtime = new Util.RuntimeOptions({});
      const result = await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
      
      console.log('消费短信发送成功:', {
        phone,
        consumption,
        balance,
        result: result.body
      });
      
      return true;
    } catch (error) {
      console.error('消费短信发送失败:', {
        phone,
        consumption,
        balance,
        error: error.message
      });
      
      if (error.data && error.data.Recommend) {
        console.error('诊断地址:', error.data.Recommend);
      }
      
      return false;
    }
  }

  /**
   * 发送会员创建短信
   * @param {string} phone 手机号
   * @param {string} name 会员姓名
   * @param {number} balance 初始余额
   */
  async sendVipCreatedSms(phone, name, balance = 0) {
    try {
      if (!this.client) {
        console.error('短信客户端未初始化');
        return false;
      }

      // 使用充值模板发送会员创建短信
      const templateParam = JSON.stringify({
        recharge: balance.toString(),
        gift: "0",
        balance: balance.toString()
      });

      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        signName: this.signName,
        templateCode: "SMS_488625041",
        phoneNumbers: phone,
        templateParam: templateParam,
      });

      const runtime = new Util.RuntimeOptions({});
      const result = await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
      
      console.log('会员创建短信发送成功:', {
        phone,
        name,
        balance,
        result: result.body
      });
      
      return true;
    } catch (error) {
      console.error('会员创建短信发送失败:', {
        phone,
        name,
        balance,
        error: error.message
      });
      
      if (error.data && error.data.Recommend) {
        console.error('诊断地址:', error.data.Recommend);
      }
      
      return false;
    }
  }
}

// 创建单例实例
const smsService = new SmsService();

module.exports = {
  sendRechargeSms: (phone, recharge, gift, balance) => smsService.sendRechargeSms(phone, recharge, gift, balance),
  sendConsumptionSms: (phone, consumption, balance) => smsService.sendConsumptionSms(phone, consumption, balance),
  sendVipCreatedSms: (phone, name, balance) => smsService.sendVipCreatedSms(phone, name, balance)
};

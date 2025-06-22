# 阿里云短信服务依赖安装

## 需要安装的依赖包

```bash
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client @alicloud/tea-util @alicloud/credentials @alicloud/tea-typescript
```

## 配置说明

1. **AccessKey配置**：需要在阿里云控制台配置AccessKey，或者使用环境变量
2. **短信签名**：已设置为"杭州芯瑜健康管理"
3. **模板ID**：
   - 充值短信：SMS_488625041
   - 消费短信：SMS_488640049

## 功能说明

### 1. 会员创建短信
- 当创建VIP会员时自动发送
- 使用充值模板，初始余额作为充值金额

### 2. 充值短信
- 当VIP充值时自动发送
- 包含充值金额、赠送金额、当前余额

### 3. 消费短信
- 当VIP消费时自动发送
- 包含消费金额、当前余额

## 错误处理

- 短信发送失败不会影响主要业务流程
- 所有短信发送错误都会记录到控制台日志
- 支持诊断地址输出，便于排查问题

## 测试

运行测试脚本：
```bash
node test-sms.js
``` 
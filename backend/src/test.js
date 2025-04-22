const {sendConsumptionSms, sendRechargeSms} = require('./services/sms.service');

sendConsumptionSms('17621783357', '晓金', 100, 500)

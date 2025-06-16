const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 路由导入
const vipRoutes = require('./routes/vip.routes');
const projectRoutes = require('./routes/project.routes');
const technicianRoutes = require('./routes/technician.routes');
const reportRoutes = require('./routes/report.routes');

// 配置环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors({
  // origin: "http://121.196.193.60:5174", // 你的前端地址
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"], // 允许的 HTTP 方法
  allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
}));
app.use(express.json());

// 数据库连接
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 路由
app.use('/api/vip', vipRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/reports', reportRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器出错');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口: ${PORT}`);
});

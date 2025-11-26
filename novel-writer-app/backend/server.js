require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入配置和路由
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const novelRoutes = require('./routes/novels');
const chapterRoutes = require('./routes/chapters');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3389;

// 连接数据库
connectDB();

// 中间件配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://your-app-domain.com'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '小说写作助手后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/novels', auth, novelRoutes);
app.use('/api/chapters', auth, chapterRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的接口不存在'
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误:', error);

  // Mongoose验证错误
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors
    });
  }

  // Mongoose重复键错误
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field}已存在`
    });
  }

  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的令牌'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '令牌已过期'
    });
  }

  // 默认错误响应
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==============================================
  小说写作助手后端服务
==============================================
  服务器地址: http://${process.env.SERVER_IP || 'localhost'}:${PORT}
  运行环境: ${process.env.NODE_ENV || 'development'}
  启动时间: ${new Date().toLocaleString('zh-CN')}
==============================================
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

module.exports = app;

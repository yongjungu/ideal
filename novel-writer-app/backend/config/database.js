const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('connected', () => {
      console.log('Mongoose 已连接到数据库');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose 连接已断开');
    });

    // 应用关闭时关闭数据库连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose 连接已关闭');
      process.exit(0);
    });

  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

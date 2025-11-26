const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT令牌
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，请提供有效的令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '令牌无效，用户不存在'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: '请先验证您的邮箱'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期，请重新登录'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器认证错误'
    });
  }
};

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 可选认证（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 忽略认证错误，继续处理请求
    next();
  }
};

// 管理员权限检查
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 这里可以根据需要添加管理员权限检查
    // 例如：if (req.user.role !== 'admin') { ... }
    
    next();
  } catch (error) {
    console.error('管理员认证错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器认证错误'
    });
  }
};

module.exports = {
  auth,
  generateToken,
  optionalAuth,
  adminAuth
};

const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../config/email');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });

    // 生成验证码
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // 发送验证邮件
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: '验证邮件发送失败，请稍后重试'
      });
    }

    res.status(201).json({
      success: true,
      message: '注册成功，验证码已发送到您的邮箱',
      data: {
        userId: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，注册失败'
    });
  }
});

// 验证邮箱
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和验证码'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: '邮箱已验证'
      });
    }

    const isValid = user.verifyCode(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '邮箱验证成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，验证失败'
    });
  }
});

// 重新发送验证码
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱地址'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: '邮箱已验证'
      });
    }

    // 生成新的验证码
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // 发送验证邮件
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: '验证邮件发送失败，请稍后重试'
      });
    }

    res.json({
      success: true,
      message: '验证码已重新发送到您的邮箱'
    });

  } catch (error) {
    console.error('重新发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，发送失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: '请先验证您的邮箱'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          profile: user.profile,
          subscription: user.subscription,
          usageStats: user.usageStats
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，登录失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription,
          usageStats: user.usageStats,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新用户资料
router.put('/profile', async (req, res) => {
  try {
    const { nickname, bio, writingStyle, favoriteGenres, targetWordCount } = req.body;

    const updateData = {};
    
    if (nickname !== undefined) updateData['profile.nickname'] = nickname;
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (writingStyle !== undefined) updateData['preferences.writingStyle'] = writingStyle;
    if (favoriteGenres !== undefined) updateData['preferences.favoriteGenres'] = favoriteGenres;
    if (targetWordCount !== undefined) updateData['preferences.targetWordCount'] = targetWordCount;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: '资料更新成功',
      data: { user }
    });

  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，更新失败'
    });
  }
});

// 修改密码
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供当前密码和新密码'
      });
    }

    const user = await User.findById(req.user._id);

    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，密码修改失败'
    });
  }
});

module.exports = router;

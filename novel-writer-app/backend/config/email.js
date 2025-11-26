const nodemailer = require('nodemailer');

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// 发送验证码邮件
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"小说写作助手" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '邮箱验证码 - 小说写作助手',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">小说写作助手</h1>
            <p style="margin: 10px 0 0; font-size: 16px;">开启你的创作之旅</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">邮箱验证</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              感谢您注册小说写作助手！请使用以下验证码完成邮箱验证：
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: white; padding: 20px 40px; border-radius: 10px; border: 2px dashed #667eea;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
                  ${verificationCode}
                </span>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
              <strong>重要提示：</strong>
            </p>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>此验证码将在10分钟后失效</li>
              <li>请勿将此验证码分享给他人</li>
              <li>如果您没有注册此服务，请忽略此邮件</li>
            </ul>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                此邮件由系统自动发送，请勿回复。<br>
                如有问题，请联系我们的客服团队。
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('验证码邮件已发送:', info.messageId);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
};

// 发送通知邮件
const sendNotificationEmail = async (email, subject, content) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"小说写作助手" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('通知邮件已发送:', info.messageId);
    return true;
  } catch (error) {
    console.error('发送通知邮件失败:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendNotificationEmail
};

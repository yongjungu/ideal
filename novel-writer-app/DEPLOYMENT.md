# 小说写作助手部署指南

## 快速开始

### 1. 环境要求

**后端服务:**
- Node.js 16+
- MongoDB 4.4+
- 邮件服务（Gmail或其他SMTP服务）
- AI API密钥（OpenAI/Anthropic）

**Android应用:**
- Android Studio
- JDK 11+
- Android SDK

### 2. 后端部署

#### 方式一：传统部署

1. **安装依赖**
   ```bash
   cd backend
   npm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置以下参数：
   # - 数据库连接
   # - JWT密钥
   # - 邮件服务
   # - AI API密钥
   ```

3. **启动服务**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

#### 方式二：Docker部署

1. **使用Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **单独构建镜像**
   ```bash
   cd backend
   docker build -t novel-writer-backend .
   docker run -p 3389:3389 novel-writer-backend
   ```

### 3. Android应用构建

1. **打开项目**
   - 使用Android Studio打开 `frontend` 目录

2. **配置服务器地址**
   - 修改 `ApiService.kt` 中的 `BASE_URL`
   ```kotlin
   private const val BASE_URL = "http://你的服务器IP:3389/api/"
   ```

3. **构建APK**
   - Build → Generate Signed Bundle / APK
   - 或使用命令行：`./gradlew assembleRelease`

### 4. 环境配置详解

#### 数据库配置
```env
MONGODB_URI=mongodb://localhost:27017/novel_writer
```

#### 邮件服务配置（Gmail示例）
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Gmail应用专用密码
```

#### AI服务配置
```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# 自定义模型
CUSTOM_AI_API_URL=https://your-custom-ai-api.com/v1
```

#### 安全配置
```env
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
JWT_EXPIRES_IN=30d
```

### 5. 服务器配置

#### Nginx配置（可选）
创建 `nginx.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://localhost:3389;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        # 静态文件或前端应用
        root /var/www/html;
        index index.html;
    }
}
```

#### SSL证书配置
```bash
# 使用Let's Encrypt
certbot --nginx -d your-domain.com
```

### 6. 监控和维护

#### 日志查看
```bash
# Docker日志
docker-compose logs -f backend

# 传统部署日志
tail -f /var/log/novel-writer.log
```

#### 数据库备份
```bash
# MongoDB备份
mongodump --uri="mongodb://localhost:27017/novel_writer" --out=backup/
```

#### 健康检查
```bash
curl http://localhost:3389/health
```

### 7. 故障排除

#### 常见问题

1. **邮件发送失败**
   - 检查SMTP配置
   - 验证应用专用密码
   - 检查防火墙设置

2. **AI服务不可用**
   - 验证API密钥
   - 检查网络连接
   - 查看API配额

3. **数据库连接失败**
   - 检查MongoDB服务状态
   - 验证连接字符串
   - 检查网络权限

4. **Android应用无法连接**
   - 验证服务器地址
   - 检查网络权限
   - 查看SSL证书

#### 日志调试
```javascript
// 启用详细日志
DEBUG=* node server.js
```

### 8. 性能优化

#### 数据库优化
```javascript
// 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.novels.createIndex({ author: 1, updatedAt: -1 })
```

#### 缓存策略
```javascript
// 使用Redis缓存常用数据
const redis = require('redis')
const client = redis.createClient()
```

#### 负载均衡
```yaml
# docker-compose-scale.yml
version: '3.8'
services:
  backend:
    image: novel-writer-backend
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### 9. 安全建议

1. **环境变量保护**
   - 不要将敏感信息提交到代码仓库
   - 使用安全的密钥管理服务

2. **API安全**
   - 实施请求频率限制
   - 验证输入数据
   - 使用HTTPS

3. **数据库安全**
   - 启用认证
   - 限制网络访问
   - 定期备份

### 10. 扩展功能

#### 添加新的AI模型
1. 在 `aiService.js` 中添加模型配置
2. 更新API路由支持新模型
3. 更新前端模型选择界面

#### 自定义提示词
修改 `services/aiService.js` 中的提示词模板，适应不同的写作风格和需求。

## 支持与维护

如需技术支持，请提供：
- 服务器环境信息
- 错误日志
- 复现步骤
- 期望行为与实际行为

## 版本更新

定期检查更新：
```bash
# 后端依赖更新
npm update

# Docker镜像更新
docker-compose pull
docker-compose up -d
```

---

**注意**: 生产环境部署前，请确保所有安全配置都已正确设置，并进行充分测试。

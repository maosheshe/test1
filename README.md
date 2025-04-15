# 用户认证系统

一个基于Node.js和MySQL的用户登录注册系统，包含前端界面和后端API。

## 功能特点

- 用户注册
- 用户登录
- JWT认证
- 密码加密存储
- 响应式界面
- 安全防护措施

## 技术栈

- 前端：
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  
- 后端：
  - Node.js
  - Express.js
  - MySQL
  - JWT认证
  - bcrypt密码加密

- 安全特性：
  - Helmet安全头
  - 速率限制
  - CORS配置
  - 环境变量配置
  - 内容安全策略

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建`.env`文件并配置以下变量：
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
PORT=3001
```

4. 数据库设置
```sql
CREATE DATABASE user_auth;
USE user_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. 启动服务器
```bash
npm start
```

## 项目结构

```
project/
├── public/
│   ├── login.html
│   └── dashboard.html
├── server.js
├── package.json
├── .env
└── README.md
```

## API接口

### 注册
- 路径：`/api/register`
- 方法：POST
- 请求体：
```json
{
    "username": "用户名",
    "password": "密码"
}
```

### 登录
- 路径：`/api/login`
- 方法：POST
- 请求体：
```json
{
    "username": "用户名",
    "password": "密码"
}
```

## 安全特性

1. 密码安全
   - 使用bcrypt进行密码加密
   - 密码强度验证

2. 认证安全
   - JWT令牌认证
   - 令牌过期机制

3. 请求安全
   - 速率限制
   - CORS配置
   - 请求体大小限制

4. 服务器安全
   - Helmet安全头
   - 内容安全策略
   - 环境变量配置

## 开发说明

1. 开发环境
```bash
npm run dev
```

2. 生产环境
```bash
npm start
```

## 注意事项

1. 确保MySQL服务已启动
2. 检查环境变量配置
3. 确保端口未被占用
4. 生产环境需要配置HTTPS
5. 定期备份数据库

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请联系项目维护者。 
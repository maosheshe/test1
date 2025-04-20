# 用户登录与文章管理系统

## 项目简介
这是一个基于 Node.js + Express + MySQL 的用户登录与文章管理系统，提供以下功能：

### 用户功能
- 用户注册与登录
- 个人信息管理

### 文章管理功能
- 文章列表展示
- 文章详情查看
- 文章创建与编辑
- 文章删除

### 系统特性
- 响应式设计，适配多种设备
- 完善的错误处理机制
- 使用JWT进行身份验证

## 功能特性
- 用户注册与登录
- JWT 身份认证
- 文章管理（创建、查看、编辑、删除）
- 响应式界面设计
- 安全防护（密码加密、SQL注入防护等）

## 技术栈
- 后端：Node.js + Express
- 数据库：MySQL
- 前端：HTML5 + CSS3 + JavaScript
- 安全：JWT + bcrypt + helmet

## 项目结构
```
project/
├── public/                # 静态文件
│   ├── login.html         # 登录/注册页面
│   ├── articles.html      # 文章列表页面
│   ├── article-detail.html # 文章详情页面
│   └── create-article.html # 新建文章页面
├── server.js              # 服务器入口文件
├── .env                   # 环境变量配置
└── README.md              # 项目说明文档
```

## 数据库设计
### users 表
- id: 主键
- username: 用户名
- password: 密码（加密存储）
- created_at: 创建时间
- updated_at: 更新时间

### articles 表
- id: 主键
- title: 文章标题
- content: 文章内容
- user_id: 作者ID（外键关联users表）
- created_at: 创建时间
- updated_at: 更新时间

## API 接口
### 用户相关
- POST /api/register - 用户注册
- POST /api/login - 用户登录

### 文章相关
- GET /api/articles - 获取文章列表
- GET /api/articles/:id - 获取文章详情
- POST /api/articles - 创建新文章
- PUT /api/articles/:id - 更新文章
- DELETE /api/articles/:id - 删除文章

## 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7
- npm >= 6.0.0

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
创建 .env 文件并配置以下内容：
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. 创建数据库表
```sql
-- 创建用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建文章表
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

5. 启动服务器
```bash
node server.js
```

## 使用说明
### 快速开始
1. 克隆项目: `git clone https://github.com/your-repo/project.git`
2. 安装依赖: `npm install`
3. 配置数据库: 修改`.env`文件中的数据库连接信息
4. 运行迁移: `npx sequelize-cli db:migrate`
5. 启动服务: `npm start`

### 访问系统
1. 访问 http://localhost:3000 进入登录页面
2. 注册新用户或使用已有账号登录
3. 登录成功后进入文章列表页面

### 功能操作
- 创建文章: 点击"新建文章"按钮
- 查看文章: 点击文章标题
- 编辑文章: 在文章详情页点击"编辑"按钮
- 删除文章: 在文章详情页点击"删除"按钮

## 安全特性
- 密码使用 bcrypt 加密存储
- 使用 JWT 进行身份认证
- 使用 helmet 增强安全性
- 防止 SQL 注入
- 请求频率限制

## 版本历史
### v1.0.0 (2025-04-14)
- 初始版本发布
- 实现用户注册和登录功能
- 添加基础安全防护

### v1.1.0 (2025-04-15)
- 新增文章管理功能
  - 文章列表展示
  - 文章详情查看
  - 文章创建
  - 文章编辑
  - 文章删除
- 优化用户界面
- 统一使用3000端口
- 完善错误处理机制



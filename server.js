const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const app = express();

// 配置Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// 安全中间件
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://badivy.cn']  // 生产环境只允许特定域名
        : '*',  // 开发环境允许所有域名
    credentials: true
}));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 其他中间件
app.use(express.json({ limit: '10kb' }));  // 限制请求体大小
app.use(express.static('public'));

// 根路径重定向到登录页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    debug: true,  // 启用调试
    trace: true,   // 启用跟踪
    timezone: '+08:00',  // 设置时区为东八区
    dateStrings: true    // 将日期作为字符串返回
});

// 将连接池转换为Promise形式
const promisePool = pool.promise();

// 测试数据库连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
    connection.release();
});

// 注册路由
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('开始注册流程，用户名:', username);
        
        // 检查用户名是否已存在
        const [existingUsers] = await promisePool.query(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log('用户名已存在:', username);
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('密码加密完成');

        // 插入新用户
        const now = new Date();
        await promisePool.query(
            'INSERT INTO Users (username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, now, now]
        );
        console.log('用户数据插入成功');

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误详情:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录路由
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 查找用户
        const [users] = await promisePool.query(
            'SELECT id, username, password, createdAt, updatedAt FROM Users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        const user = users[0];

        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 文章路由
app.post('/api/articles', async (req, res) => {
    const { title, content } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const now = new Date();
        const [result] = await promisePool.query(
            'INSERT INTO Articles (title, content, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
            [title, content, userId, now, now]
        );

        res.status(201).json({
            message: '文章创建成功',
            articleId: result.insertId
        });
    } catch (error) {
        console.error('创建文章错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 格式化日期的辅助函数
function formatDate(dateString) {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效时间';
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

app.get('/api/articles', async (req, res) => {
    try {
        const [articles] = await promisePool.query(
            'SELECT a.*, u.username FROM Articles a JOIN Users u ON a.userId = u.id ORDER BY a.createdAt DESC'
        );
        // 格式化日期
        const formattedArticles = articles.map(article => ({
            ...article,
            createdAt: formatDate(article.createdAt),
            updatedAt: formatDate(article.updatedAt)
        }));
        res.json(formattedArticles);
    } catch (error) {
        console.error('获取文章列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

app.get('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;

    try {
        const [articles] = await promisePool.query(
            'SELECT a.*, u.username FROM Articles a JOIN Users u ON a.userId = u.id WHERE a.id = ?',
            [articleId]
        );

        if (articles.length === 0) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 格式化日期
        const formattedArticle = {
            ...articles[0],
            createdAt: formatDate(articles[0].createdAt),
            updatedAt: formatDate(articles[0].updatedAt)
        };

        res.json(formattedArticle);
    } catch (error) {
        console.error('获取文章详情错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
    const { title, content } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 检查文章是否存在且属于当前用户
        const [articles] = await promisePool.query(
            'SELECT * FROM Articles WHERE id = ? AND userId = ?',
            [articleId, userId]
        );

        if (articles.length === 0) {
            return res.status(404).json({ message: '文章不存在或无权修改' });
        }

        await promisePool.query(
            'UPDATE Articles SET title = ?, content = ?, updatedAt = ? WHERE id = ? AND userId = ?',
            [title, content, new Date(), articleId, userId]
        );

        res.json({ message: '文章更新成功' });
    } catch (error) {
        console.error('更新文章错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 检查文章是否存在且属于当前用户
        const [articles] = await promisePool.query(
            'SELECT * FROM Articles WHERE id = ? AND userId = ?',
            [articleId, userId]
        );

        if (articles.length === 0) {
            return res.status(404).json({ message: '文章不存在或无权删除' });
        }

        await promisePool.query(
            'DELETE FROM Articles WHERE id = ? AND userId = ?',
            [articleId, userId]
        );

        res.json({ message: '文章删除成功' });
    } catch (error) {
        console.error('删除文章错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 
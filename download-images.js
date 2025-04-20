const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建图片目录
const imageDir = path.join(__dirname, 'public', 'images', 'articles');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

// 下载图片的函数
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        console.log(`开始下载: ${filename} 从 ${url}`);
        
        const request = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`下载图片失败: ${response.statusCode}`));
                return;
            }

            const filePath = path.join(imageDir, filename);
            const fileStream = fs.createWriteStream(filePath);

            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`下载完成: ${filename}`);
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        });

        // 设置超时
        request.setTimeout(30000, () => {
            request.abort();
            reject(new Error(`下载超时: ${filename}`));
        });

        request.on('error', (err) => {
            console.error(`下载出错: ${filename}`, err);
            reject(err);
        });
    });
}

// 下载多张图片
async function downloadImages() {
    // 使用静态图片URL
    const imageUrls = [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', filename: 'article1.jpg' },
        { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', filename: 'article2.jpg' },
        { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', filename: 'article3.jpg' },
        { url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb', filename: 'article4.jpg' },
        { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3', filename: 'article5.jpg' }
    ];

    console.log('开始下载所有图片...');
    
    for (const image of imageUrls) {
        try {
            await downloadImage(image.url, image.filename);
            // 添加延迟，避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`下载 ${image.filename} 失败:`, error);
        }
    }
    
    console.log('所有图片下载完成！');
}

// 执行下载
downloadImages().catch(err => {
    console.error('下载过程中发生错误:', err);
}); 
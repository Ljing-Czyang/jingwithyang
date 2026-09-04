/**
 * 零依赖本地静态开发服务器
 * 用法: npm run dev -- --port 7100 --host 127.0.0.1
 * （也兼容 -p 8080 与 PORT 环境变量）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function argValue(names, fallback) {
    for (let i = 0; i < args.length; i++) {
        if (names.includes(args[i]) && args[i + 1]) return args[i + 1];
        const eq = names.find(n => args[i].startsWith(n + '='));
        if (eq) return args[i].slice(eq.length + 1);
    }
    return fallback;
}

const PORT = Number(argValue(['--port', '-p'], process.env.PORT || 7100));
const HOST = argValue(['--host', '-h'], '127.0.0.1');
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4'
};

http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    // 防止目录穿越
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found: ' + urlPath);
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(data);
    });
}).listen(PORT, HOST, () => {
    console.log(`Our Memory 开发服务器已启动: http://${HOST}:${PORT}/`);
});

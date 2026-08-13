// TradePilot 单机版 — 本地 HTTP 层，可被 Electron main 内嵌启动
const express = require('express');
const path = require('path');
const api = require('./routes/api');

function createServer({ frontendDir } = {}) {
  const app = express();

  app.use(express.json());

  // 本地静态前端（同源，前端 /api 相对路径直达，无 CORS 问题）
  const rawDir = frontendDir || process.env.FRONTEND_DIR;
  const staticDir = rawDir ? path.resolve(rawDir) : '';
  if (staticDir && fsExists(staticDir)) {
    app.use(express.static(staticDir));
    // ponytail: Next static export → /mail maps to mail.html; refresh won't 404
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      const file = path.join(staticDir, req.path.replace(/^\//, ''), 'index.html');
      const fallback = path.join(staticDir, req.path.replace(/^\//, '').replace(/\/$/, '') + '.html');
      if (fsExists(file)) return res.sendFile(file);
      if (fsExists(fallback)) return res.sendFile(fallback);
      next();
    });
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
  app.use('/api', api);

  // ponytail: global error handler
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  });

  // listen(0) = 随机空闲端口，避免与用户其它服务冲突
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      console.log(`TradePilot → http://127.0.0.1:${port}`);
      resolve({ app, server, port });
    });
  });
}

function fsExists(p) {
  try { const s = require('fs').statSync(p); return s.isDirectory() || s.isFile(); } catch { return false; }
}

// CLI 独立调试：node src/app.js [--port N] [--frontend ../web/out]
if (require.main === module) {
  const args = process.argv.slice(2);
  const portArg = args.find((a) => a.startsWith('--port'));
  const frontArg = args.find((a) => a.startsWith('--frontend'));
  createServer({ frontendDir: frontArg ? frontArg.split('=')[1] : undefined }).then(({ server }) => {
    const port = portArg ? parseInt(portArg.split('=')[1], 10) : server.address().port;
    if (portArg) {
      server.close();
      server.listen(port, '127.0.0.1', () => console.log(`TradePilot → http://127.0.0.1:${port}`));
    }
  });
}

module.exports = { createServer };

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const FRONTEND_PATH = path.join(__dirname, '../frontend');
const PHOTO_PATH = path.join(__dirname, '../角色照片');

// 中間件
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 後端代理：以 query 參數安全傳送圖片檔案，避免路徑編碼問題
app.get('/api/photo', (req, res, next) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: 'missing name' });
  try {
    const decoded = decodeURIComponent(name);
    const filePath = path.join(PHOTO_PATH, decoded);
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ error: 'not found' });
    }
    return res.sendFile(filePath, err => {
      if (err) {
        console.error('[API PHOTO] sendFile error:', err && err.message);
        return next(err);
      }
    });
  } catch (err) {
    console.error('[API PHOTO] exception:', err && err.message);
    return res.status(400).json({ error: 'bad request' });
  }
});

app.use('/角色照片', express.static(PHOTO_PATH));
app.use(express.static(FRONTEND_PATH));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/cooldown', require('./routes/cooldown'));

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 資料來源資訊
app.get('/api/info', (req, res) => {
  res.json({
    name: '第五人格角色投票',
    source: '遊戲內、第五檔案館、官方微博、官方微信小程序',
    lastUpdate: process.env.DATA_UPDATE_DATE || '2026年7月22號'
  });
});

// 如果不是 API 路由，就回傳前端 index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '伺服器錯誤' });
});

app.listen(PORT, () => {
  console.log(`伺服器執行於 http://localhost:${PORT}`);
});

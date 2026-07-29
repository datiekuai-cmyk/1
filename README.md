# 第五人格角色投票網站

完整的全端投票應用程式，實現角色投票、答題系統和排行榜功能。

## 功能規劃

### 核心功能
- ✅ Google OAuth 登入
- ✅ 角色分類（求生者/監管者）
- ✅ 角色詳情頁面
- ✅ 答題投票系統
- ✅ 題庫管理（簡單題/困難題）
- ✅ 冷卻時間管理（答對30分鐘，答錯10分鐘）
- ✅ 答題倒數計時（60秒）
- ✅ 排行榜（全角色/求生者/監管者）
- ✅ 投票紀錄

### 未來功能（第二版）
- [ ] 交流區
- [ ] 留言功能
- [ ] 私訊功能
- [ ] 好友功能
- [ ] 帳號修改資料
- [ ] 信箱驗證
- [ ] 管理員後台

## 項目結構

```
├── frontend/                # 前端應用
│   ├── index.html          # 主 HTML 頁面
│   ├── css/
│   │   └── style.css       # 全局樣式
│   └── js/
│       ├── config.js       # 配置常數
│       ├── api.js          # API 通訊模組
│       ├── auth.js         # 認證模組
│       ├── ui.js           # UI 管理模組
│       └── main.js         # 主應用程式
├── backend/                # 後端應用
│   ├── server.js           # Express 伺服器
│   ├── package.json        # 依賴配置
│   ├── import-data.js      # 資料導入腳本
│   ├── config/
│   │   ├── database.js     # 資料庫配置
│   │   └── auth.js         # OAuth 配置
│   ├── middleware/
│   │   └── auth.js         # 認證中間件
│   └── routes/
│       ├── auth.js         # 認證路由
│       ├── characters.js   # 角色路由
│       ├── questions.js    # 題目路由
│       ├── votes.js        # 投票路由
│       ├── leaderboard.js  # 排行榜路由
│       └── cooldown.js     # 冷卻時間路由
├── database/               # 資料庫
│   ├── schema.sql          # 資料庫結構
│   └── import.sql          # 資料導入模板
├── data/                   # 原始資料
│   ├── characters.full.json
│   ├── characters.summary.csv
│   ├── question-bank.json
│   ├── question-bank.csv
│   └── pdf-raw-text.txt
└── .env.example            # 環境變數範本
```

## 安裝步驟

### 1. 環境設定

複製環境變數範本：
```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入：
- `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` (Google Cloud Console)
- 資料庫連線資訊

### 2. 資料庫初始化

```bash
# 進入 database 目錄
cd database

# 使用 MySQL 客戶端執行
mysql -u root -p identity_v_voting < schema.sql
```

### 3. 安裝後端依賴

```bash
cd backend
npm install
```

### 4. 導入資料

```bash
# 在 backend 目錄中
node import-data.js
```

### 5. 啟動後端伺服器

```bash
npm start
```

伺服器將在 `http://localhost:3001` 運行

### 6. 啟動前端

使用 Live Server 或簡單的 HTTP 伺服器：
```bash
# 進入 frontend 目錄
cd frontend

# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

前端將在 `http://localhost:8000` 運行

## GitHub Pages 部署

此專案使用 GitHub Actions 將 `frontend/` 資料夾部署到 `gh-pages` 分支。

部署步驟：

1. 把本地變更提交到 `main`：
   ```bash
   git add .github/workflows/gh-pages.yml
   git commit -m "Add GitHub Pages deployment workflow"
   ```
2. 推送到 GitHub：
   ```bash
   git push origin main
   ```
3. 到 GitHub 倉庫設定中，將 Pages 來源設為 `gh-pages` 分支。

如果你想讓前端連到後端，請把 `frontend/js/config.js` 中的 `API_URL` 改成後端實際網址。

## 直接公開部署後端到 Render

如果你要讓 GitHub Pages 網站也能登入，建議把後端部署到公開服務，例如 Render，然後把 `frontend/js/config.js` 的 `API_URL` 改成該公開後端網址。

你可以參考 `DEPLOYMENT_RENDER.md` 的步驟，內容包含：
- 建立 Render Web Service
- 設定環境變數
- 更新 Google Cloud Console callback URL
- 修改 `frontend/js/config.js`

## API 端點

### 認證
- `POST /api/auth/google/callback` - Google 登入回調
- `GET /api/auth/verify` - 驗證權杖
- `POST /api/auth/logout` - 登出

### 角色
- `GET /api/characters` - 取得所有角色
- `GET /api/characters/:characterId` - 取得角色詳情
- `GET /api/characters/rank/:camp` - 取得排名

### 題目
- `GET /api/questions/random/:characterId` - 取得隨機題目
- `POST /api/questions/submit` - 提交答案

### 投票
- `POST /api/votes` - 記錄投票
- `GET /api/votes/user/history` - 取得投票紀錄

### 排行榜
- `GET /api/leaderboard/all` - 全角色排行
- `GET /api/leaderboard/survivor` - 求生者排行
- `GET /api/leaderboard/hunter` - 監管者排行

### 冷卻時間
- `GET /api/cooldown/status/:characterId` - 檢查冷卻狀態

### 資訊
- `GET /api/info` - 取得網站資訊

## 資料庫架構

### users 表
- 存儲 Google 用戶信息

### characters 表
- 存儲角色資訊

### questions 表
- 存儲題目資訊

### votes 表
- 記錄投票

### user_cooldowns 表
- 管理冷卻時間

### user_stats 表
- 用戶統計信息

## 投票規則

### 難度系統
1. 首次投票開始使用簡單題
2. 累積 5 次正確投票後，可能出現困難題（30% 機率）
3. 答錯困難題後，回到簡單題

### 冷卻時間
- **答對**：30 分鐘後可再次投票
- **答錯**：10 分鐘後可重新挑戰

### 題目限時
- 每題 60 秒限時
- 超時自動視為答錯

## 題庫規則

### 簡單題類型
- 莊園名
- 本名
- 曾用名
- 小名
- 外號
- 陣營
- 生日/紀念日
- 年齡
- 性別
- 喜歡的東西
- 討厭的東西
- 代表稀世時裝
- 代表奇珍時裝
- 深淵稀世/奇珍時裝

### 困難題類型
- 上線日期
- 中文配音演員
- 角色實驗代號

### 題目生成規則
- 選項必須是同一角色的不同答案
- 若無法湊滿三個選項，可減少選項數量
- 答案為「無」、「未知」、「不詳」、「未公開」的題目不納入

## 資訊來源

> 資訊來源：遊戲內、第五檔案館、官方微博、官方微信小程序
> 
> 資料最後紀錄時間：2026 年 7 月 22 號

## 技術棧

- **前端**：HTML5、CSS3、JavaScript (Vanilla)
- **後端**：Node.js、Express.js
- **資料庫**：MySQL
- **認證**：Google OAuth 2.0
- **API**：RESTful

## 系統需求

- Node.js 14+
- MySQL 5.7+ 或 8.0+
- 現代瀏覽器 (Chrome、Firefox、Safari、Edge)

## 開發建議

### 環境變數
在 `.env` 中設置以下變數：
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=identity_v_voting
JWT_SECRET=your_jwt_secret
SERVER_PORT=3001
CLIENT_URL=http://localhost:8000
DATA_UPDATE_DATE=2026年7月22號
```

### 本地開發

1. 啟動 MySQL 服務
2. 在後端目錄運行 `npm start`
3. 在前端目錄開啟 Live Server 或 HTTP 伺服器

### 生產部署

1. 更新 `.env` 為生產配置
2. 設置 HTTPS
3. 配置適當的 CORS 策略
4. 使用生產級資料庫
5. 實施適當的安全措施（速率限制、輸入驗證等）

## 故障排除

### API 連線失敗
- 檢查後端伺服器是否運行
- 驗證 `CONFIG.API_URL` 設置正確
- 檢查 CORS 配置

### 資料庫連線失敗
- 驗證 MySQL 伺服器運行
- 檢查 `.env` 中的資料庫配置
- 確認資料庫已建立

### Google 登入失敗
- 驗證 Google Client ID 正確
- 檢查 Google Cloud Console 中的授權域名
- 確認回調 URL 匹配

## 許可證

MIT

## 聯絡方式

如有問題或建議，歡迎提出 Issue。

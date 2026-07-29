# 開發指南

## 專案架構說明

### 前端架構

前端使用原生 HTML、CSS、JavaScript，無框架依賴，便於快速開發。

#### 核心模組

1. **config.js** - 配置管理
   - API 端點配置
   - 常數定義（冷卻時間、計時等）
   - 本地儲存鍵值

2. **api.js** - API 通訊層
   - 所有後端 API 呼叫
   - 統一的錯誤處理
   - 自動令牌注入

3. **auth.js** - 認證模組
   - Google Sign-In 集成
   - 登入狀態管理
   - 令牌存儲和驗證

4. **ui.js** - UI 控制
   - 視圖切換
   - 頁面更新
   - 事件綁定
   - 定時器管理

5. **main.js** - 應用程序入口
   - 初始化應用
   - 全局事件綁定

### 後端架構

後端使用 Express.js 框架，採用 MVC-like 結構。

#### 核心模組

1. **server.js** - 主伺服器
   - Express 應用設定
   - 中間件配置
   - 路由掛載

2. **config/** - 配置模組
   - database.js - MySQL 連接池
   - auth.js - OAuth 配置

3. **middleware/** - 中間件
   - auth.js - JWT 驗證

4. **routes/** - 路由層
   - auth.js - 認證路由
   - characters.js - 角色接口
   - questions.js - 題目接口
   - votes.js - 投票接口
   - leaderboard.js - 排行榜接口
   - cooldown.js - 冷卻管理接口

## 開發流程

### 新增功能步驟

1. **後端開發**
   - 在 `routes/` 中添加新路由
   - 編寫 SQL 查詢
   - 測試 API 端點

2. **前端開發**
   - 在 `api.js` 中添加 API 方法
   - 在 `ui.js` 中添加 UI 邏輯
   - 添加 HTML 結構（如需要）

3. **集成測試**
   - 在瀏覽器中測試完整流程
   - 檢查控制台錯誤
   - 驗證資料庫更新

### 調試技巧

#### 前端調試
```javascript
// 在 config.js 中啟用調試
const DEBUG = true;

// 使用 log() 函數
log('調試信息', data);
error('錯誤信息', error);
```

#### 後端調試
```bash
# 使用 nodemon 自動重啟
npm run dev

# 查看 API 日誌
curl http://localhost:3001/api/info
```

#### 資料庫調試
```bash
# 登入 MySQL
mysql -u root -p identity_v_voting

# 查看表結構
DESCRIBE characters;

# 查看資料
SELECT * FROM characters LIMIT 5;
```

## 程式碼規範

### JavaScript 命名規則
- 類名：PascalCase（如 `UserManager`）
- 函數名：camelCase（如 `getUserInfo`）
- 常數：UPPER_SNAKE_CASE（如 `CONFIG`, `API_URL`）
- 變量：camelCase（如 `currentUser`）

### SQL 風格
- 關鍵詞：大寫（SELECT, INSERT, WHERE 等）
- 表名/列名：snake_case
- 使用參數化查詢避免 SQL 注入

### CSS 命名
- 使用 BEM 命名法（如 `.character-card__image`)
- 或簡單的連字符（如 `.btn-primary`）
- 避免類名過深（最多 2-3 級）

## 常見任務

### 添加新角色欄位

1. 更新 `database/schema.sql` 中的 characters 表
2. 更新 `data/characters.full.json` 格式
3. 修改 `backend/import-data.js` 導入邏輯
4. 更新前端顯示代碼

### 添加新題目類型

1. 在 `database/schema.sql` 確認 questions 表結構
2. 更新 `data/question-bank.json` 格式
3. 在 `backend/routes/questions.js` 中添加難度邏輯
4. 在前端 `ui.js` 中更新題目顯示

### 修改冷卻時間規則

1. 編輯 `frontend/js/config.js` 中的常數
2. 更新 `backend/routes/questions.js` 冷卻插入邏輯
3. 修改 `backend/routes/cooldown.js` 計算邏輯

### 部署到生產環境

1. 更新 `.env` 為生產配置
2. 設置 HTTPS
3. 配置 CORS 政策
4. 使用生產級資料庫
5. 實施監控和日誌

## 性能優化

### 前端
- 懶加載角色圖片
- 緩存 API 響應
- 減少 DOM 操作
- 使用事件委託

### 後端
- 添加資料庫索引
- 實施查詢緩存
- 使用連接池
- 添加速率限制

### 資料庫
- 適當的索引（已在 schema.sql 中）
- 定期優化表結構
- 歸檔舊資料
- 備份策略

## 測試

### 前端測試
```javascript
// 手動測試檢查清單
- [ ] Google 登入
- [ ] 角色列表加載
- [ ] 答題流程
- [ ] 冷卻時間顯示
- [ ] 排行榜加載
- [ ] 響應式設計
```

### 後端測試
```bash
# 使用 curl 測試 API
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/characters

# 測試 POST 請求
curl -X POST -H "Content-Type: application/json" \
  -d '{"token":"..."}' \
  http://localhost:3001/api/auth/google/callback
```

## 常見錯誤排除

### CORS 錯誤
- 檢查 `backend/server.js` 中的 CORS 配置
- 確認 `CLIENT_URL` 環境變數正確

### JWT 驗證失敗
- 檢查 `JWT_SECRET` 環境變數
- 驗證令牌格式
- 檢查令牌過期時間

### 資料庫連接失敗
- 確認 MySQL 服務運行
- 驗證連接參數
- 檢查防火牆設定

### Google OAuth 失敗
- 驗證 Client ID/Secret
- 確認授權域名
- 檢查回調 URL

## 資源

- [Express.js 文檔](https://expressjs.com/)
- [MySQL 文檔](https://dev.mysql.com/doc/)
- [Google OAuth 文檔](https://developers.google.com/identity)
- [MDN Web 文檔](https://developer.mozilla.org/en-US/)

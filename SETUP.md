# 安裝和啟動指南

## 快速開始

### 前置要求
- Node.js 14 以上
- MySQL 5.7 以上
- Google OAuth 認證（從 Google Cloud Console 取得）

## 詳細步驟

### 第 1 步：Google OAuth 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 建立新專案
3. 啟用 Google+ API
4. 建立 OAuth 2.0 認證
   - 應用程式類型：Web 應用程式
   - 授權的重定向 URI：`http://localhost:3001/api/auth/google/callback`
5. 複製 Client ID 和 Client Secret

### 第 2 步：資料庫設定

```bash
# 建立資料庫
mysql -u root -p -e "CREATE DATABASE identity_v_voting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 導入 schema
cd database
mysql -u root -p identity_v_voting < schema.sql
```

### 第 3 步：環境配置

```bash
# 複製環境變數範本
cp .env.example .env

# 編輯 .env，填入：
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - DB_PASSWORD 等資料庫資訊
```

### 第 4 步：安裝依賴

```bash
cd backend
npm install
```

### 第 5 步：導入資料

```bash
# 在 backend 目錄中
node import-data.js
```

### 第 6 步：啟動伺服器

```bash
# 後端
cd backend
npm start
# 服務在 http://localhost:3001

# 前端（新的終端）
cd frontend
python -m http.server 8000
# 或使用 npx http-server
# 應用在 http://localhost:8000
```

## 驗證安裝

1. 訪問 `http://localhost:8000`
2. 點擊 Google 登入按鈕
3. 應該能看到首頁和角色列表

## 常見問題

### 連線失敗
- 確認兩個服務都在運行
- 檢查防火牆設定
- 驗證 API_URL 配置

### 資料庫錯誤
- 確認 MySQL 服務運行
- 驗證資料庫密碼
- 檢查字符編碼設置

### Google 登入不工作
- 驗證 Client ID/Secret
- 檢查授權域名設置
- 確認回調 URL 正確

## 下一步

參考 README.md 了解完整功能和 API 文檔。

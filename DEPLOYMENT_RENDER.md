# 使用 Render 公開部署後端

如果你想讓 GitHub Pages 網站 `https://datiekuai-cmyk.github.io/1/` 可以登入，必須把後端部署到公開網址，然後讓前端呼叫該公開網址。

## 1. 建立 Render 帳號

1. 前往 https://render.com
2. 註冊 / 登入
3. 連接你的 GitHub 帳號

## 2. 建立後端服務

1. 在 Render 儀表板點選 `New` → `Web Service`
2. 選擇你的 repo，然後選 `backend` 目錄作為部署目錄
3. 設定：
   - Name: `identity-v-voting-backend` 或你喜歡的名稱
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

## 3. 設定環境變數

部署前要在 Render 裡設定以下 env：

- `GOOGLE_CLIENT_ID` = 你在 Google Cloud Console 的 Client ID
- `GOOGLE_CLIENT_SECRET` = 你在 Google Cloud Console 的 Client Secret
- `GOOGLE_CALLBACK_URL` = `https://<你的 Render 網域>/api/auth/google/callback`
- `CLIENT_URL` = `https://datiekuai-cmyk.github.io`
- `JWT_SECRET` = 隨機字串，例如 `myjwtsecret123`（不要給別人看）
- `JWT_EXPIRY` = `7d`
- `SUPABASE_URL` = 你的 Supabase 專案 URL
- `SUPABASE_SERVICE_ROLE_KEY` = 你的 Supabase service role key

> 注意：這個後端目前使用 Supabase 儲存資料，必須提供 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`。

## 4. 部署並拿到公開網址

服務建立完成後，Render 會給你一個公開網址，例如：

```
https://identity-v-voting-backend.onrender.com
```

## 5. 改前端的 API_URL

把 `frontend/js/config.js` 裡的 `API_URL` 改成：

```js
API_URL: 'https://<你的 Render 網域>/api',
```

例如：

```js
API_URL: 'https://identity-v-voting-backend.onrender.com/api',
```

## 6. 更新 Google Cloud Console

在 Google Cloud Console 的 OAuth Client 設定中，「授權的重新導向 URI」要至少有：

- `https://<你的 Render 網域>/api/auth/google/callback`

已存在的 JavaScript 來源應該保留：

- `https://datiekuai-cmyk.github.io`

## 7. 將前端部署到 GitHub Pages

1. 提交 `frontend/js/config.js` 的修改
2. 推到 `main`
3. 等 GitHub Actions 將前端部署到 `gh-pages`

## 8. 測試

1. 開啟 `https://datiekuai-cmyk.github.io/1/`
2. 點 Google 登入
3. 若登入成功，表示整合完成

---

如果你想，我也可以直接幫你把 `frontend/js/config.js` 改成你公開後端網址，只要你把 Render 的網址貼給我。
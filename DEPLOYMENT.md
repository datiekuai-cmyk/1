# 部署指南

## 本地開發部署

### 快速開始

```bash
# 1. 配置環境
cp .env.example .env
# 編輯 .env 檔案

# 2. 後端設定
cd backend
npm install
node check-config.js  # 驗證配置
npm run import        # 導入資料
npm start             # 啟動伺服器

# 3. 前端設定
cd ../frontend
python -m http.server 8000
# 或
npx http-server
```

訪問 `http://localhost:8000`

## Docker 容器部署

### 前置要求
- Docker
- Docker Compose

### 部署步驟

```bash
# 1. 配置環境
cp .env.example .env
# 編輯 .env

# 2. 構建並啟動
docker-compose up -d

# 3. 初始化資料庫
docker-compose exec backend node import-data.js

# 4. 驗證服務
docker-compose ps
```

訪問 `http://localhost:8000`

### 常用命令

```bash
# 查看日誌
docker-compose logs -f backend
docker-compose logs -f mysql

# 停止服務
docker-compose stop

# 重啟服務
docker-compose restart

# 清除所有
docker-compose down -v
```

## 生產環境部署

### 服務器要求
- Linux 伺服器（Ubuntu 20.04+）
- Node.js 14+
- MySQL 8.0+
- Nginx
- SSL 證書（Let's Encrypt）

### 步驟

#### 1. 伺服器設定

```bash
# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 MySQL
sudo apt-get install -y mysql-server

# 安裝 Nginx
sudo apt-get install -y nginx

# 安裝 PM2
sudo npm install -g pm2
```

#### 2. 應用程式部署

```bash
# 複製程式碼
cd /var/www
git clone <repository-url> identity-v-voting
cd identity-v-voting

# 安裝依賴
cd backend
npm install --production

# 配置環境
cp .env.example .env
# 編輯 .env 為生產配置

# 初始化資料庫
mysql -u root -p identity_v_voting < ../database/schema.sql
node import-data.js
```

#### 3. PM2 進程管理

```bash
# 在後端目錄
pm2 start server.js --name "identity-v-voting"
pm2 save
pm2 startup

# 查看狀態
pm2 status
```

#### 4. Nginx 配置

```nginx
# /etc/nginx/sites-available/identity-v-voting
upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name voting.example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name voting.example.com;

    ssl_certificate /etc/letsencrypt/live/voting.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/voting.example.com/privkey.pem;

    # 前端
    location / {
        root /var/www/identity-v-voting/frontend;
        try_files $uri $uri/ /index.html;
    }

    # 後端 API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用配置：
```bash
sudo ln -s /etc/nginx/sites-available/identity-v-voting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL 證書

```bash
# 安裝 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 獲取證書
sudo certbot certonly --nginx -d voting.example.com

# 自動更新
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### 6. 監控和備份

```bash
# 設置定時備份
sudo crontab -e
# 添加：0 2 * * * mysqldump -u root -p<password> identity_v_voting > /backup/db_$(date +\%Y\%m\%d).sql

# 監控服務
pm2 logs
pm2 monit
```

## 常見問題

### CORS 問題
更新 `.env` 中的 `CLIENT_URL` 為正確的域名

### 資料庫連接失敗
檢查防火牆設定和資料庫權限

### SSL 證書問題
```bash
# 驗證證書
sudo certbot certificates

# 續期測試
sudo certbot renew --dry-run
```

## 性能優化

### 資料庫
```sql
-- 建立索引
CREATE INDEX idx_user_id ON votes(user_id);
CREATE INDEX idx_character_id ON votes(character_id);
```

### 後端
- 啟用 gzip 壓縮
- 實施緩存策略
- 使用連接池

### 前端
- 縮小 CSS/JS
- 懶加載圖片
- 使用 CDN

## 監控

### PM2 監控
```bash
# 查看實時監控
pm2 monit

# 生成報告
pm2 report
```

### Nginx 日誌
```bash
# 實時查看
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### MySQL 監控
```bash
# 查看連接
mysql> SHOW PROCESSLIST;

# 查看性能指標
mysql> SHOW STATUS;
```

## 升級指南

### 更新應用程式
```bash
cd /var/www/identity-v-voting
git pull
cd backend
npm install
pm2 restart identity-v-voting
```

### 資料庫升級
```bash
# 備份
mysqldump -u root -p identity_v_voting > backup.sql

# 執行遷移腳本
mysql -u root -p identity_v_voting < migration.sql
```

## 安全建議

- [ ] 定期更新依賴
- [ ] 使用強密碼
- [ ] 啟用 HTTPS
- [ ] 設置防火牆規則
- [ ] 定期備份資料庫
- [ ] 監控日誌
- [ ] 實施 DDoS 防護
- [ ] 使用環境變數管理敏感信息

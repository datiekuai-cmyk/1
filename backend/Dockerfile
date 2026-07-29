FROM node:22-alpine

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝依賴
RUN npm install --production

# 複製應用程式
COPY . .

# 暴露端口
EXPOSE 3001

# 啟動應用
CMD ["npm", "start"]

#!/usr/bin/env node

/**
 * 配置檢查腳本
 * 驗證所有必要的環境設定
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const checks = [];

function check(name, condition, message) {
  checks.push({
    name,
    pass: condition,
    message
  });
}

function printResults() {
  console.log('\n========== 配置檢查 ==========\n');
  
  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, pass, message }) => {
    const icon = pass ? '✅' : '❌';
    console.log(`${icon} ${name}`);
    if (!pass && message) {
      console.log(`   ${message}`);
    }
    if (pass) passed++;
    else failed++;
  });

  console.log(`\n結果: ${passed} 通過, ${failed} 失敗\n`);
  
  return failed === 0;
}

// 1. 檢查環境變數
check(
  'Google Client ID',
  !!process.env.GOOGLE_CLIENT_ID,
  '請在 .env 中設置 GOOGLE_CLIENT_ID'
);

check(
  'Google Client Secret',
  !!process.env.GOOGLE_CLIENT_SECRET,
  '請在 .env 中設置 GOOGLE_CLIENT_SECRET'
);

// 2. 檢查資料庫配置
check(
  '資料庫主機',
  !!process.env.DB_HOST,
  '請在 .env 中設置 DB_HOST'
);

check(
  '資料庫使用者',
  !!process.env.DB_USER,
  '請在 .env 中設置 DB_USER'
);

check(
  '資料庫名稱',
  !!process.env.DB_NAME,
  '請在 .env 中設置 DB_NAME'
);

// 3. 檢查 JWT 密鑰
check(
  'JWT 密鑰',
  !!process.env.JWT_SECRET,
  '請在 .env 中設置 JWT_SECRET'
);

// 4. 檢查文件結構
check(
  '前端文件存在',
  fs.existsSync(path.join(__dirname, '../frontend/index.html')),
  '前端 index.html 檔案遺失'
);

check(
  '後端 package.json 存在',
  fs.existsSync(path.join(__dirname, 'package.json')),
  '後端 package.json 檔案遺失'
);

check(
  '資料庫 schema 存在',
  fs.existsSync(path.join(__dirname, '../database/schema.sql')),
  '資料庫 schema.sql 檔案遺失'
);

check(
  '資料檔案存在',
  fs.existsSync(path.join(__dirname, '../data/characters.full.json')) &&
  fs.existsSync(path.join(__dirname, '../data/question-bank.json')),
  '資料檔案遺失（characters.full.json 或 question-bank.json）'
);

// 5. 檢查 Node.js 版本
const nodeVersion = parseInt(process.version.slice(1));
check(
  'Node.js 版本',
  nodeVersion >= 14,
  `需要 Node.js 14 以上版本，目前版本: ${process.version}`
);

// 輸出結果
const allPassed = printResults();

// 輸出建議
if (allPassed) {
  console.log('✅ 所有配置檢查通過！');
  console.log('\n接下來的步驟:');
  console.log('1. npm install          # 安裝依賴');
  console.log('2. node import-data.js  # 導入資料');
  console.log('3. npm start            # 啟動伺服器\n');
  process.exit(0);
} else {
  console.log('❌ 存在未通過的配置檢查，請修正上述錯誤。\n');
  process.exit(1);
}

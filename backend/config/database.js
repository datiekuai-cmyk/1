const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 配置缺失！請檢查 .env 文件');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 導出 Supabase 客戶端
module.exports = supabase;

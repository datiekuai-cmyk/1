// 配置常數
const CONFIG = {
  // API 端點
  API_URL: 'http://localhost:3001/api',
  GOOGLE_CLIENT_ID: '664772780261-qe8emglh1efae8p1ep57d42lq4tl5bdo.apps.googleusercontent.com',
  
  // 冷卻時間（分鐘）
  COOLDOWN_CORRECT: 30,
  COOLDOWN_INCORRECT: 10,
  
  // 題目限時（秒）
  QUESTION_TIME_LIMIT: 60,
  
  // 投票升級閾值
  EASY_TO_HARD_THRESHOLD: 5,
  HARD_QUESTION_PROBABILITY: 0.3,
  
  // 本地儲存鍵值
  STORAGE_TOKEN: 'auth_token',
  STORAGE_USER: 'user_info',
  STORAGE_CAMPS: 'camps_data'
};

function log(...args) {
  // no-op
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

// ??????
const CONFIG = {
  // API ???
  API_URL: 'https://identity-v-voting-backend.onrender.com/api',
  GOOGLE_CLIENT_ID: '664772780261-qe8emglh1efae8p1ep57d42lq4tl5bdo.apps.googleusercontent.com',
  
  // ????????????
  COOLDOWN_CORRECT: 30,
  COOLDOWN_INCORRECT: 10,
  
  // ???????????
  QUESTION_TIME_LIMIT: 60,
  
  // ??????????
  EASY_TO_HARD_THRESHOLD: 5,
  HARD_QUESTION_PROBABILITY: 0.3,
  
  // ??????????
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


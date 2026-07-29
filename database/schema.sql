-- 使用者表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_google_id (google_id)
);

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
  character_id VARCHAR(50) PRIMARY KEY,
  profession VARCHAR(50) NOT NULL,
  manor_name VARCHAR(255) NOT NULL,
  real_name VARCHAR(255),
  former_name VARCHAR(255),
  nickname VARCHAR(255),
  alias VARCHAR(255),
  camp VARCHAR(20) NOT NULL,
  birthday_or_anniversary VARCHAR(50),
  age VARCHAR(50),
  gender VARCHAR(10),
  likes VARCHAR(255),
  dislikes VARCHAR(255),
  representative_s_tier_costume TEXT,
  representative_a_tier_costume TEXT,
  abyss_s_or_a_costume TEXT,
  cn_release_date DATE,
  cn_voice_actor VARCHAR(255),
  experiment_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_camp (camp)
);

-- 題目表
CREATE TABLE IF NOT EXISTS questions (
  question_id VARCHAR(100) PRIMARY KEY,
  character_id VARCHAR(50) NOT NULL,
  profession VARCHAR(50),
  difficulty VARCHAR(20) NOT NULL,
  field_key VARCHAR(100),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(character_id),
  INDEX idx_character_id (character_id),
  INDEX idx_difficulty (difficulty)
);

-- 投票表
CREATE TABLE IF NOT EXISTS votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  character_id VARCHAR(50) NOT NULL,
  question_id VARCHAR(100),
  difficulty VARCHAR(20),
  is_valid TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (character_id) REFERENCES characters(character_id),
  INDEX idx_user_id (user_id),
  INDEX idx_character_id (character_id),
  INDEX idx_created_at (created_at)
);

-- 使用者冷卻時間表
CREATE TABLE IF NOT EXISTS user_cooldowns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  character_id VARCHAR(50) NOT NULL,
  cooldown_until DATETIME NOT NULL,
  cooldown_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_character (user_id, character_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (character_id) REFERENCES characters(character_id),
  INDEX idx_user_id (user_id),
  INDEX idx_cooldown_until (cooldown_until)
);

-- 使用者統計表
CREATE TABLE IF NOT EXISTS user_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'easy',
  total_votes INT DEFAULT 0,
  correct_votes INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

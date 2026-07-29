-- 資料導入腳本
-- 1. 先執行 schema.sql 建立表結構
-- 2. 再執行此腳本導入資料

-- 從 data/characters.full.json 導入角色資料
-- 注意：需要先準備 JSON 檔案，然後使用 Node.js 腳本或 MySQL LOAD DATA 導入

-- 示例 SQL （需要事先準備資料）
-- 此部分應該由 Node.js 腳本自動執行

-- 清空現有資料（開發用）
-- DELETE FROM characters;
-- DELETE FROM questions;
-- DELETE FROM votes;
-- DELETE FROM user_cooldowns;

-- 插入樣本角色資料
INSERT INTO characters (
  character_id, profession, manor_name, real_name, former_name, nickname, alias,
  camp, birthday_or_anniversary, age, gender, likes, dislikes,
  representative_s_tier_costume, representative_a_tier_costume, abyss_s_or_a_costume,
  cn_release_date, cn_voice_actor, experiment_code
) VALUES
('lucky_person', '幸運兒', '推演替身', '未知', '', '小幸', '',
 '求生者', '11月22日', '未知', '未知', '未知', '未知',
 '拉塔托斯克', '女僕裝、\"未知射線\"X', '',
 '2018-04-02', '李元韜', '未公開'),

('doctor', '醫生', '艾米麗·黛兒', '莉迪亞·瓊斯', '莉迪亞·瓊斯', '', '愛美麗',
 '求生者', '3月17日', '32', '女', '藥草、書', '郊狼',
 '司藥', '試運者、流螢', '痊癒、雨中曲、往昔',
 '2018-04-02', '武向彤', '4-0-4');

-- 注意：需要導入完整的角色資料
-- 可以編寫 Node.js 腳本讀取 characters.full.json 並插入資料

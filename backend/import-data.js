const fs = require('fs');
const path = require('path');
const supabase = require('./config/database');
require('dotenv').config();

function parseJsonValue(value) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

async function importData() {
  try {
    console.log('開始導入資料...');

    const charactersPath = path.join(__dirname, '../data/characters.full.json');
    const charactersData = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));

    for (const char of charactersData) {
      const { error } = await supabase
        .from('characters')
        .upsert({
          character_id: char.character_id,
          profession: char.profession,
          manor_name: char.manor_name,
          real_name: char.real_name,
          former_name: char.former_name || null,
          nickname: char.nickname || null,
          alias: char.alias || null,
          camp: char.camp,
          birthday_or_anniversary: char.birthday_or_anniversary || null,
          age: char.age || null,
          gender: char.gender || null,
          likes: char.likes || null,
          dislikes: char.dislikes || null,
          representative_s_tier_costume: char.representative_s_tier_costume || null,
          representative_a_tier_costume: char.representative_a_tier_costume || null,
          abyss_s_or_a_costume: char.abyss_s_or_a_costume || null,
          cn_release_date: char.cn_release_date || null,
          cn_voice_actor: char.cn_voice_actor || null,
          experiment_code: char.experiment_code || null,
          votes: char.votes || 0
        }, { onConflict: 'character_id' });

      if (error) {
        throw error;
      }
    }

    console.log(`✓ 已導入 ${charactersData.length} 個角色`);

    const questionsPath = path.join(__dirname, '../data/question-bank.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    console.log(`開始導入 ${questionsData.length} 個題目...`);

    for (let i = 0; i < questionsData.length; i++) {
      const question = questionsData[i];
      const optionsJson = parseJsonValue(question.options_json);
      const { error } = await supabase
        .from('questions')
        .upsert({
          question_id: question.question_id,
          character_id: question.character_id,
          profession: question.profession,
          difficulty: question.difficulty,
          field_key: question.field_key,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          options_json: optionsJson
        }, { onConflict: 'question_id' });

      if (error) {
        throw error;
      }

      if ((i + 1) % 50 === 0 || i === questionsData.length - 1) {
        console.log(`  已導入 ${i + 1}/${questionsData.length} 題`);
      }
    }

    console.log(`✓ 已導入 ${questionsData.length} 個題目`);
    console.log('✓ 資料導入完成！');
  } catch (error) {
    console.error('資料導入失敗:', error.message || error);
    process.exit(1);
  }
}

importData();

const express = require('express');
const supabase = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 取得隨機題目
router.get('/random/:characterId', verifyToken, async (req, res) => {
  try {
    const { characterId } = req.params;
    const { difficulty = 'easy' } = req.query;
    const userId = req.user.userId;
    
    // 獲取隨機題目
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('character_id', characterId)
      .eq('difficulty', difficulty);
    
    if (error) throw error;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: '沒有可用的題目' });
    }
    
    const question = questions[Math.floor(Math.random() * questions.length)];

    const parseOptions = (value) => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (parseError) {
          console.warn('無效的 options_json，回退為字串分割:', trimmed, parseError.message);
          if (trimmed.includes(',')) {
            return trimmed.split(',').map(item => item.trim()).filter(Boolean);
          }
          return trimmed ? [trimmed] : [];
        }
      }
      if (value != null) {
        return [value];
      }
      return [];
    };

    const options = parseOptions(question.options_json);

    res.json({
      question_id: question.question_id,
      question_text: question.question_text,
      options,
      time_limit: 60
    });
  } catch (error) {
    console.error('獲取題目失敗:', error);
    res.status(500).json({ error: '獲取題目失敗' });
  }
});

// 提交答案
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { questionId, characterId, selectedAnswer, timeUsed } = req.body;
    const userId = req.user.userId;
    
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('question_id', questionId);
    
    if (qError) throw qError;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: '題目不存在' });
    }
    
    const question = questions[0];
    const isCorrect = selectedAnswer === question.correct_answer;
    
    if (isCorrect) {
      // 記錄投票
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          user_id: userId,
          character_id: characterId,
          question_id: questionId,
          difficulty: question.difficulty,
          is_valid: true,
          created_at: new Date().toISOString()
        }]);
      
      if (voteError) throw voteError;
      
      // 更新冷卻時間 - 答對30分鐘
      const cooldownUntil = new Date();
      cooldownUntil.setMinutes(cooldownUntil.getMinutes() + 30);
      
      const { error: coolError } = await supabase
        .from('user_cooldowns')
        .upsert([{
          user_id: userId,
          character_id: characterId,
          cooldown_until: cooldownUntil.toISOString(),
          cooldown_type: 'correct'
        }], { onConflict: ['user_id', 'character_id'] });
      
      if (coolError) throw coolError;
    } else {
      // 更新冷卻時間 - 答錯10分鐘
      const cooldownUntil = new Date();
      cooldownUntil.setMinutes(cooldownUntil.getMinutes() + 10);
      
      const { error: coolError } = await supabase
        .from('user_cooldowns')
        .upsert([{
          user_id: userId,
          character_id: characterId,
          cooldown_until: cooldownUntil.toISOString(),
          cooldown_type: 'incorrect'
        }], { onConflict: ['user_id', 'character_id'] });
      
      if (coolError) throw coolError;
    }
    
    res.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      message: isCorrect ? '投票成功！' : '答案錯誤，請稍後再試'
    });
  } catch (error) {
    console.error('提交答案失敗:', error);
    res.status(500).json({ error: '提交答案失敗' });
  }
});

module.exports = router;

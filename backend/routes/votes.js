const express = require('express');
const supabase = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 記錄投票
router.post('/', verifyToken, async (req, res) => {
  try {
    const { characterId, questionId, isCorrect } = req.body;
    const userId = req.user.userId;
    
    if (isCorrect) {
      const { error } = await supabase
        .from('votes')
        .insert([{
          user_id: userId,
          character_id: characterId,
          question_id: questionId,
          is_valid: true,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('投票失敗:', error);
    res.status(500).json({ error: '投票失敗' });
  }
});

// 獲取用戶投票紀錄
router.get('/user/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const { data: votes, error } = await supabase
      .from('votes')
      .select('*, characters(manor_name, profession)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    res.json(votes || []);
  } catch (error) {
    console.error('獲取投票紀錄失敗:', error);
    res.status(500).json({ error: '獲取投票紀錄失敗' });
  }
});

module.exports = router;

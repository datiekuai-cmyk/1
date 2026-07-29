const express = require('express');
const supabase = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 檢查冷卻時間
router.get('/status/:characterId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const characterId = req.params.characterId;
    
    const { data: cooldowns, error } = await supabase
      .from('user_cooldowns')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .gt('cooldown_until', new Date().toISOString());
    
    if (error) throw error;
    
    if (cooldowns && cooldowns.length > 0) {
      const cooldown = cooldowns[0];
      const remainingTime = Math.ceil(
        (new Date(cooldown.cooldown_until) - new Date()) / 1000
      );
      
      res.json({
        inCooldown: true,
        remainingSeconds: remainingTime,
        cooldownType: cooldown.cooldown_type,
        cooldownUntil: cooldown.cooldown_until
      });
    } else {
      res.json({ inCooldown: false });
    }
  } catch (error) {
    console.error('檢查冷卻時間失敗:', error);
    res.status(500).json({ error: '檢查冷卻時間失敗' });
  }
});

module.exports = router;

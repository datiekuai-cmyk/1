const express = require('express');
const supabase = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

async function fetchVoteCountsForCharacters(characterIds) {
  if (!characterIds || characterIds.length === 0) {
    return {};
  }

  const { data: votes, error } = await supabase
    .from('votes')
    .select('character_id', { count: 'exact' })
    .eq('is_valid', true)
    .in('character_id', characterIds);

  if (error) throw error;

  return (votes || []).reduce((acc, row) => {
    acc[row.character_id] = (acc[row.character_id] || 0) + 1;
    return acc;
  }, {});
}

// 取得所有角色（按職業分類）
router.get('/', async (req, res) => {
  try {
    const { data: survivors, error: survivorError } = await supabase
      .from('characters')
      .select('*')
      .eq('camp', '求生者')
      .order('character_id');
    
    const { data: hunters, error: hunterError } = await supabase
      .from('characters')
      .select('*')
      .eq('camp', '監管者')
      .order('character_id');
    
    if (survivorError) throw survivorError;
    if (hunterError) throw hunterError;

    const characterIds = [
      ...(survivors || []).map(c => c.character_id),
      ...(hunters || []).map(c => c.character_id)
    ];
    const voteCounts = await fetchVoteCountsForCharacters(characterIds);
    
    for (let char of survivors || []) {
      char.vote_count = voteCounts[char.character_id] || 0;
    }
    for (let char of hunters || []) {
      char.vote_count = voteCounts[char.character_id] || 0;
    }
    
    res.json({
      survivors: survivors || [],
      hunters: hunters || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('獲取角色失敗:', error);
    res.status(500).json({ error: '獲取角色失敗' });
  }
});

// 取得單個角色詳情
router.get('/:characterId', async (req, res) => {
  try {
    const { data: characters, error } = await supabase
      .from('characters')
      .select('*')
      .eq('character_id', req.params.characterId);
    
    if (error) throw error;
    if (!characters || characters.length === 0) {
      return res.status(404).json({ error: '角色不存在' });
    }
    
    const character = characters[0];
    
    // 獲取投票數
    const { count, error: voteCountError } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('character_id', req.params.characterId)
      .eq('is_valid', true);
    
    if (voteCountError) throw voteCountError;
    character.vote_count = count || 0;
    
    res.json(character);
  } catch (error) {
    console.error('獲取角色失敗:', error);
    res.status(500).json({ error: '獲取角色失敗' });
  }
});

// 角色排名
router.get('/rank/:camp', async (req, res) => {
  try {
    const { data: characters, error } = await supabase
      .from('characters')
      .select('character_id, manor_name, camp')
      .eq('camp', req.params.camp !== 'all' ? req.params.camp : undefined);
    
    if (error) throw error;
    
    const characterIds = (characters || []).map(c => c.character_id);
    const voteCounts = await fetchVoteCountsForCharacters(characterIds);

    const results = (characters || []).map(char => ({
      character_id: char.character_id,
      manor_name: char.manor_name,
      camp: char.camp,
      vote_count: voteCounts[char.character_id] || 0
    }));

    results.sort((a, b) => b.vote_count - a.vote_count);

    res.json(results.map((r, index) => ({ ...r, rank: index + 1 })));
  } catch (error) {
    console.error('獲取排名失敗:', error);
    res.status(500).json({ error: '獲取排名失敗' });
  }
});

module.exports = router;

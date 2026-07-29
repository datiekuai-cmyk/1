const express = require('express');
const supabase = require('../config/database');

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

// 獲取排行榜 - 全角色
router.get('/all', async (req, res) => {
  try {
    const { data: characters, error } = await supabase
      .from('characters')
      .select('character_id, manor_name, profession, camp');
    
    if (error) throw error;
    
    const characterIds = (characters || []).map(c => c.character_id);
    const voteCounts = await fetchVoteCountsForCharacters(characterIds);

    const rankings = (characters || []).map(char => ({
      character_id: char.character_id,
      manor_name: char.manor_name,
      profession: char.profession,
      camp: char.camp,
      vote_count: voteCounts[char.character_id] || 0
    }));
    
    rankings.sort((a, b) => b.vote_count - a.vote_count);
    
    res.json(rankings.map((r, index) => ({ ...r, rank: index + 1 })));
  } catch (error) {
    console.error('獲取排行榜失敗:', error);
    res.status(500).json({ error: '獲取排行榜失敗' });
  }
});

// 獲取排行榜 - 求生者
router.get('/survivor', async (req, res) => {
  try {
    const { data: characters, error } = await supabase
      .from('characters')
      .select('character_id, manor_name, profession')
      .eq('camp', '求生者');
    
    if (error) throw error;
    
    const characterIds = (characters || []).map(c => c.character_id);
    const voteCounts = await fetchVoteCountsForCharacters(characterIds);

    const rankings = (characters || []).map(char => ({
      character_id: char.character_id,
      manor_name: char.manor_name,
      profession: char.profession,
      vote_count: voteCounts[char.character_id] || 0
    }));
    
    rankings.sort((a, b) => b.vote_count - a.vote_count);
    
    res.json(rankings.map((r, index) => ({ ...r, rank: index + 1 })));
  } catch (error) {
    console.error('獲取排行榜失敗:', error);
    res.status(500).json({ error: '獲取排行榜失敗' });
  }
});

// 獲取排行榜 - 監管者
router.get('/hunter', async (req, res) => {
  try {
    const { data: characters, error } = await supabase
      .from('characters')
      .select('character_id, manor_name, profession')
      .eq('camp', '監管者');
    
    if (error) throw error;
    
    const characterIds = (characters || []).map(c => c.character_id);
    const voteCounts = await fetchVoteCountsForCharacters(characterIds);

    const rankings = (characters || []).map(char => ({
      character_id: char.character_id,
      manor_name: char.manor_name,
      profession: char.profession,
      vote_count: voteCounts[char.character_id] || 0
    }));
    
    rankings.sort((a, b) => b.vote_count - a.vote_count);
    
    res.json(rankings.map((r, index) => ({ ...r, rank: index + 1 })));
  } catch (error) {
    console.error('獲取排行榜失敗:', error);
    res.status(500).json({ error: '獲取排行榜失敗' });
  }
});

module.exports = router;

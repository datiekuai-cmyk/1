const express = require('express');
const router = express.Router();
const { loadCharactersData, normalizeCamp, sortCharacterRankings } = require('./utils');

const findCharacterById = (data, characterId) => {
  if (!characterId) return null;
  const normalized = String(characterId).trim().toLowerCase();
  return [...(data.survivors || []), ...(data.hunters || [])].find((character) => {
    return String(character.character_id || '').toLowerCase() === normalized;
  });
};

router.get('/', (req, res) => {
  const data = loadCharactersData();
  res.json(data);
});

router.get('/rank/:camp', (req, res) => {
  const data = loadCharactersData();
  const campKey = normalizeCamp(req.params.camp);
  if (!campKey) {
    return res.status(400).json({ error: 'invalid camp' });
  }

  const survivors = sortCharacterRankings(data.survivors || []);
  const hunters = sortCharacterRankings(data.hunters || []);

  if (campKey === 'all') {
    return res.json([...survivors, ...hunters].sort((a, b) => {
      const votesA = Number(a.vote_count ?? a.votes ?? 0);
      const votesB = Number(b.vote_count ?? b.votes ?? 0);
      if (votesB !== votesA) return votesB - votesA;
      return String(a.profession || '').localeCompare(String(b.profession || ''), 'zh-Hant');
    }));
  }

  res.json(campKey === 'survivors' ? survivors : hunters);
});

router.get('/:characterId', (req, res) => {
  const data = loadCharactersData();
  const character = findCharacterById(data, req.params.characterId);
  if (!character) {
    return res.status(404).json({ error: 'character not found' });
  }
  res.json(character);
});

module.exports = router;

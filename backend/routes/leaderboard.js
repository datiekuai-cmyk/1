const express = require('express');
const router = express.Router();
const { loadCharactersData, sortCharacterRankings } = require('./utils');

router.get('/all', (req, res) => {
  const data = loadCharactersData();
  const survivorRanks = sortCharacterRankings(data.survivors || []).map((item, index) => ({
    ...item,
    rank: index + 1,
    camp: 'survivor'
  }));
  const hunterRanks = sortCharacterRankings(data.hunters || []).map((item, index) => ({
    ...item,
    rank: index + 1,
    camp: 'hunter'
  }));
  const all = [...survivorRanks, ...hunterRanks].sort((a, b) => {
    const votesA = Number(a.vote_count ?? a.votes ?? 0);
    const votesB = Number(b.vote_count ?? b.votes ?? 0);
    if (votesB !== votesA) return votesB - votesA;
    return String(a.profession || '').localeCompare(String(b.profession || ''), 'zh-Hant');
  });
  res.json(all);
});

module.exports = router;

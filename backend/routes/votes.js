const express = require('express');
const router = express.Router();
const {
  loadCharactersData,
  saveCharactersData,
  loadVoteRecords,
  saveVoteRecords,
  loadCooldownRecords,
  saveCooldownRecords,
  getUserFromRequest
} = require('./utils');

const getUser = (req) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return null;
  }
  return user;
};

const incrementVoteCount = (data, characterId) => {
  const normalized = String(characterId).trim().toLowerCase();
  const candidate = [...(data.survivors || []), ...(data.hunters || [])].find((character) => {
    return String(character.character_id || '').toLowerCase() === normalized;
  });
  if (!candidate) return false;
  candidate.vote_count = Number(candidate.vote_count ?? candidate.votes ?? 0) + 1;
  return true;
};

router.post('/', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication required' });
  }

  const { characterId, questionId, isCorrect } = req.body || {};
  if (!characterId || !questionId || typeof isCorrect !== 'boolean') {
    return res.status(400).json({ error: 'missing required fields' });
  }

  const records = loadVoteRecords();
  const record = {
    userId: user.userId,
    characterId,
    questionId,
    isCorrect,
    createdAt: new Date().toISOString()
  };

  records.push(record);
  saveVoteRecords(records);

  if (isCorrect) {
    const characters = loadCharactersData();
    if (incrementVoteCount(characters, characterId)) {
      saveCharactersData(characters);
    }
  }

  const cooldowns = loadCooldownRecords();
  const cooldownSeconds = Number(process.env.COOLDOWN_CORRECT || (isCorrect ? 30 : 10));
  cooldowns[user.userId] = {
    expiresAt: Date.now() + cooldownSeconds * 1000,
    cooldownSeconds
  };
  saveCooldownRecords(cooldowns);

  res.status(204).end();
});

router.get('/user/history', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication required' });
  }

  const records = loadVoteRecords();
  const history = (records || [])
    .filter((item) => item.userId === user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(history);
});

module.exports = router;

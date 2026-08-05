const express = require('express');
const router = express.Router();
const {
  loadQuestionBank,
  loadVoteRecords,
  saveVoteRecords,
  loadCharactersData,
  saveCharactersData,
  loadCooldownRecords,
  saveCooldownRecords,
  getUserFromRequest
} = require('./utils');

const parseOptions = (item) => {
  if (!item || typeof item !== 'object') return [];
  const raw = item.options_json || item.options || '[]';
  if (Array.isArray(raw)) return raw;

  try {
    return JSON.parse(raw);
  } catch (err) {
    return String(raw).replace(/^[\[]|[\]]$/g, '').split(',').map((value) => value.trim()).filter(Boolean);
  }
};

const incrementVoteCount = (data, characterId) => {
  const normalized = String(characterId).trim().toLowerCase();
  const candidate = [...(data.survivors || []), ...(data.hunters || [])].find((character) => {
    return String(character.character_id || '').toLowerCase() === normalized;
  });
  if (!candidate) {
    return false;
  }
  candidate.vote_count = Number(candidate.vote_count ?? candidate.votes ?? 0) + 1;
  return true;
};

router.get('/random/:characterId', (req, res) => {
  const characterId = req.params.characterId;
  const difficulty = String(req.query.difficulty || 'easy').trim().toLowerCase();
  const bank = loadQuestionBank();

  const candidates = bank.filter((item) => {
    return String(item.character_id || '').toLowerCase() === String(characterId || '').toLowerCase()
      && String(item.difficulty || 'easy').toLowerCase() === difficulty;
  });

  if (!candidates.length) {
    return res.status(404).json({ error: 'no questions found for character' });
  }

  const question = candidates[Math.floor(Math.random() * candidates.length)];
  res.json({
    question_id: question.question_id,
    character_id: question.character_id,
    profession: question.profession,
    difficulty: question.difficulty,
    question_text: question.question_text,
    options: parseOptions(question),
    field_key: question.field_key
  });
});

router.post('/submit', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication required' });
  }

  const { questionId, characterId, selectedAnswer, timeUsed } = req.body || {};
  if (!questionId || !characterId || selectedAnswer == null) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  const bank = loadQuestionBank();
  const question = bank.find((item) => String(item.question_id || '') === String(questionId));
  if (!question) {
    return res.status(404).json({ error: 'question not found' });
  }

  const correctAnswer = String(question.correct_answer || '');
  const isCorrect = String(selectedAnswer || '') === correctAnswer;
  const message = isCorrect ? '回答正確，投票已記錄。' : '回答錯誤，未能獲得投票。';

  const records = loadVoteRecords();
  records.push({
    userId: user.userId,
    characterId,
    questionId,
    selectedAnswer: String(selectedAnswer),
    correctAnswer,
    isCorrect,
    timeUsed: typeof timeUsed === 'number' ? timeUsed : Number(timeUsed) || 0,
    createdAt: new Date().toISOString()
  });
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

  res.json({
    isCorrect,
    correctAnswer,
    message,
    characterId,
    questionId,
    timeUsed: typeof timeUsed === 'number' ? timeUsed : Number(timeUsed) || 0
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { loadCooldownRecords, getUserFromRequest } = require('./utils');

router.get('/status/:characterId', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.json({ inCooldown: false, remainingSeconds: 0 });
  }

  const cooldowns = loadCooldownRecords();
  const record = cooldowns[user.userId];
  if (!record || typeof record.expiresAt !== 'number') {
    return res.json({ inCooldown: false, remainingSeconds: 0 });
  }

  const remainingMs = record.expiresAt - Date.now();
  if (remainingMs <= 0) {
    return res.json({ inCooldown: false, remainingSeconds: 0 });
  }

  return res.json({ inCooldown: true, remainingSeconds: Math.ceil(remainingMs / 1000) });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { parseJwtPayload, getUserFromRequest } = require('./utils');

router.post('/google/callback', (req, res) => {
  const token = req.body && req.body.token;
  if (!token) {
    return res.status(400).json({ error: 'missing token' });
  }

  const payload = parseJwtPayload(token);
  if (!payload || !payload.sub) {
    return res.status(400).json({ error: 'invalid token payload' });
  }

  const user = {
    userId: payload.sub,
    name: payload.name || payload.email || payload.sub,
    email: payload.email || null,
    picture: payload.picture || null,
    token
  };

  res.json(user);
});

router.get('/verify', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'missing or invalid authorization token' });
  }
  res.json({ user });
});

router.post('/logout', (req, res) => {
  res.status(204).end();
});

module.exports = router;

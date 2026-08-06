const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_DIR = path.resolve(REPO_ROOT, 'backend');
const STORAGE_DIR = path.resolve(BACKEND_DIR, 'storage');
const CHARACTERS_PATH = path.resolve(REPO_ROOT, 'backend_characters.json');
const QUESTIONS_PATH = path.resolve(REPO_ROOT, 'data', 'question-bank.json');
const VOTES_PATH = path.join(STORAGE_DIR, 'votes.json');
const COOLDOWNS_PATH = path.join(STORAGE_DIR, 'cooldowns.json');

const ensureStorageDirectory = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

const readJson = (filePath, fallback = null) => {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  ensureStorageDirectory();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
};

const loadCharactersData = () => {
  const data = readJson(CHARACTERS_PATH, { survivors: [], hunters: [] });
  data.survivors = Array.isArray(data.survivors) ? data.survivors : [];
  data.hunters = Array.isArray(data.hunters) ? data.hunters : [];
  return data;
};

const saveCharactersData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid characters data');
  }
  return writeJson(CHARACTERS_PATH, data);
};

const loadQuestionBank = () => {
  const data = readJson(QUESTIONS_PATH, []);
  return Array.isArray(data) ? data : [];
};

const loadVoteRecords = () => {
  return readJson(VOTES_PATH, []);
};

const saveVoteRecords = (records) => {
  return writeJson(VOTES_PATH, records || []);
};

const loadCooldownRecords = () => {
  return readJson(COOLDOWNS_PATH, {});
};

const saveCooldownRecords = (records) => {
  return writeJson(COOLDOWNS_PATH, records || {});
};

const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1];
  let padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  padded += '='.repeat((4 - (padded.length % 4)) % 4);
  try {
    const buffer = Buffer.from(padded, 'base64');
    return JSON.parse(buffer.toString('utf8'));
  } catch (err) {
    return null;
  }
};

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }
  const payload = parseJwtPayload(match[1]);
  if (!payload || !payload.sub) {
    return null;
  }
  return {
    userId: payload.sub,
    name: payload.name || payload.email || payload.sub,
    email: payload.email || null,
    picture: payload.picture || null
  };
};

const normalizeCamp = (campInput) => {
  const camp = String(campInput || '').trim().toLowerCase();
  if (camp === 'all' || camp === '全部') return 'all';
  if (camp === 'survivor' || camp === 'survivors' || camp === '求生者') return 'survivors';
  if (camp === 'hunter' || camp === 'hunters' || camp === '監管者') return 'hunters';
  return null;
};

const sortCharacterRankings = (characters) => {
  return [...characters].sort((a, b) => {
    const votesA = Number(a.vote_count ?? a.votes ?? 0);
    const votesB = Number(b.vote_count ?? b.votes ?? 0);
    if (votesB !== votesA) return votesB - votesA;
    return String(a.profession || '').localeCompare(String(b.profession || ''), 'zh-Hant');
  });
};

module.exports = {
  loadCharactersData,
  saveCharactersData,
  loadQuestionBank,
  loadVoteRecords,
  saveVoteRecords,
  loadCooldownRecords,
  saveCooldownRecords,
  parseJwtPayload,
  getUserFromRequest,
  normalizeCamp,
  sortCharacterRankings
};

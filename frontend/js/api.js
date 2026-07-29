// API 通訊模組
const API = {
  // 通用 fetch 方法
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_URL}${endpoint}`;
    const token = localStorage.getItem(CONFIG.STORAGE_TOKEN);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      error(`API 請求失敗: ${endpoint}`, err);
      throw err;
    }
  },

  // 認證
  auth: {
    verify() {
      return API.request('/auth/verify');
    },
    logout() {
      return API.request('/auth/logout', { method: 'POST' });
    },
    googleCallback(payload) {
      const body = typeof payload === 'string'
        ? { token: payload }
        : payload;

      return API.request('/auth/google/callback', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }
  },

  // 角色相關
  characters: {
    _cache: null,
    async getAll(force = false) {
      if (!force && API.characters._cache) {
        return API.characters._cache;
      }
      const data = await API.request('/characters');
      API.characters._cache = data;
      return data;
    },
    async getDetail(characterId) {
      if (API.characters._cache) {
        const cachedCharacters = [
          ...(API.characters._cache.survivors || []),
          ...(API.characters._cache.hunters || [])
        ];
        const cached = cachedCharacters.find(c => c.character_id === characterId);
        if (cached) {
          return cached;
        }
      }
      return API.request(`/characters/${characterId}`);
    },
    getRank(camp = 'all') {
      return API.request(`/characters/rank/${camp}`);
    },
    clearCache() {
      API.characters._cache = null;
    }
  },

  // 題目相關
  questions: {
    getRandom(characterId, difficulty = 'easy') {
      return API.request(`/questions/random/${characterId}?difficulty=${difficulty}`);
    },
    submit(questionId, characterId, selectedAnswer, timeUsed) {
      return API.request('/questions/submit', {
        method: 'POST',
        body: JSON.stringify({
          questionId,
          characterId,
          selectedAnswer,
          timeUsed
        })
      });
    }
  },

  // 投票相關
  votes: {
    record(characterId, questionId, isCorrect) {
      return API.request('/votes', {
        method: 'POST',
        body: JSON.stringify({
          characterId,
          questionId,
          isCorrect
        })
      });
    },
    getHistory() {
      return API.request('/votes/user/history');
    }
  },

  // 排行榜
  leaderboard: {
    _cache: {},
    async getAll(force = false) {
      if (!force && API.leaderboard._cache.all) {
        return API.leaderboard._cache.all;
      }
      const data = await API.request('/leaderboard/all');
      API.leaderboard._cache.all = data;
      return data;
    },
    async getSurvivors(force = false) {
      if (!force && API.leaderboard._cache.survivor) {
        return API.leaderboard._cache.survivor;
      }
      if (!force && API.leaderboard._cache.all) {
        const data = API.leaderboard._cache.all.filter(item => item.camp === '求生者');
        API.leaderboard._cache.survivor = data;
        return data;
      }
      const data = await API.request('/leaderboard/survivor');
      API.leaderboard._cache.survivor = data;
      return data;
    },
    async getHunters(force = false) {
      if (!force && API.leaderboard._cache.hunter) {
        return API.leaderboard._cache.hunter;
      }
      if (!force && API.leaderboard._cache.all) {
        const data = API.leaderboard._cache.all.filter(item => item.camp === '監管者');
        API.leaderboard._cache.hunter = data;
        return data;
      }
      const data = await API.request('/leaderboard/hunter');
      API.leaderboard._cache.hunter = data;
      return data;
    },
    clearCache() {
      API.leaderboard._cache = {};
    }
  },

  // 冷卻時間
  cooldown: {
    getStatus(characterId) {
      return API.request(`/cooldown/status/${characterId}`);
    }
  },

  // 資訊
  getInfo() {
    return API.request('/info');
  }
};

// API ??璅∠?
const API = {
  // ? fetch ?寞?
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_URL}${endpoint}`;
    const token = localStorage.getItem(CONFIG.STORAGE_TOKEN);
    
    const headers = {
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body != null && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
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
      error(`API 隢?憭望?: ${endpoint}`, err);
      throw err;
    }
  },

  // 隤?
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

  async loadLocalCharacters() {
    if (API._localCharacterData) {
      return API._localCharacterData;
    }

    try {
      const response = await fetch('backend_characters.json');
      if (!response.ok) {
        throw new Error(`Local character data failed: ${response.status}`);
      }
      API._localCharacterData = await response.json();
      return API._localCharacterData;
    } catch (err) {
      error('載入本地角色資料失敗', err);
      throw err;
    }
  },

  // 閫?賊?
  characters: {
    _cache: null,
    async getAll(force = false) {
      if (!force && API.characters._cache) {
        return API.characters._cache;
      }

      try {
        const data = await API.request('/characters');
        API.characters._cache = data;
        return data;
      } catch (err) {
        const data = await API.loadLocalCharacters();
        API.characters._cache = data;
        return data;
      }
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

  // 憿?賊?
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

  // ?巨?賊?
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

  // ??璁?
  leaderboard: {
    _cache: {},
    async getFallbackFromCharacters() {
      try {
        const data = await API.characters.getAll();
        const buildList = (campName, campValue) => {
          const source = (data[campName] || []).map((char, index) => ({
            character_id: char.character_id,
            manor_name: char.manor_name,
            profession: char.profession,
            camp: campValue,
            vote_count: char.vote_count || 0,
            fallback: true,
            rank: index + 1
          }));

          return source.sort((a, b) => {
            const voteDiff = (b.vote_count || 0) - (a.vote_count || 0);
            if (voteDiff !== 0) return voteDiff;
            return (a.profession || '').localeCompare(b.profession || '', 'zh-Hant');
          });
        };

        const survivor = buildList('survivors', 'survivor');
        const hunter = buildList('hunters', 'hunter');
        const all = [...survivor, ...hunter].sort((a, b) => {
          const voteDiff = (b.vote_count || 0) - (a.vote_count || 0);
          if (voteDiff !== 0) return voteDiff;
          return (a.profession || '').localeCompare(b.profession || '', 'zh-Hant');
        });

        return { all, survivor, hunter };
      } catch (err) {
        return { all: [], survivor: [], hunter: [] };
      }
    },
    async getAll(force = false) {
      if (!force && API.leaderboard._cache.all) {
        return API.leaderboard._cache.all;
      }

      try {
        const data = await API.request('/leaderboard/all');
        API.leaderboard._cache.all = data;
        return data;
      } catch (err) {
        const fallback = await API.leaderboard.getFallbackFromCharacters();
        API.leaderboard._cache.all = fallback.all;
        API.leaderboard._cache.survivor = fallback.survivor;
        API.leaderboard._cache.hunter = fallback.hunter;
        return fallback.all;
      }
    },
    async getSurvivors(force = false) {
      if (!force && API.leaderboard._cache.survivor) {
        return API.leaderboard._cache.survivor;
      }
      const rankings = await API.leaderboard.getAll(force);
      const data = rankings.filter(item => item.camp === 'survivor');
      API.leaderboard._cache.survivor = data;
      return data;
    },
    async getHunters(force = false) {
      if (!force && API.leaderboard._cache.hunter) {
        return API.leaderboard._cache.hunter;
      }
      const rankings = await API.leaderboard.getAll(force);
      const data = rankings.filter(item => item.camp === 'hunter');
      API.leaderboard._cache.hunter = data;
      return data;
    },
    clearCache() {
      API.leaderboard._cache = {};
    }
  },

  // ?瑕??
  cooldown: {
    getStatus(characterId) {
      return API.request(`/cooldown/status/${characterId}`);
    }
  },

  // 鞈?
  getInfo() {
    return API.request('/info');
  }
};


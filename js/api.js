// API ??璅∠?
const API = {
  // ? fetch ?寞?
  async request(endpoint, options = {}) {
    const { silent = false, ...fetchOptions } = options;
    const url = `${CONFIG.API_URL}${endpoint}`;
    const token = localStorage.getItem(CONFIG.STORAGE_TOKEN);
    
    const headers = {
      ...fetchOptions.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fetchOptions.body != null && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers
      });

      // 如果不是 2xx，嘗試讀取回應內容以協助除錯
      if (!response.ok) {
        let bodyText = '';
        try { bodyText = await response.text(); } catch (e) { /* ignore */ }
        const err = new Error(`HTTP ${response.status}: ${bodyText ? bodyText.slice(0, 1000) : ''}`);
        err.status = response.status;
        err.body = bodyText;
        if (!silent) {
          error(`API 回傳錯誤 ${endpoint}`, err);
        }
        throw err;
      }

      // 204 No Content -> 回傳 null
      if (response.status === 204) return null;

      const contentType = (response.headers.get && response.headers.get('content-type')) || '';

      // 預期 JSON 回應時，嘗試解析；解析失敗時回退為純文字
      if (contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (parseErr) {
          // 解析失敗時回退為 text 再嘗試 JSON.parse（若可能）
          try {
            const txt = await response.text();
            try { return JSON.parse(txt); } catch (_) { return txt; }
          } catch (e) {
            error(`API 解析 JSON 失敗: ${endpoint}`, parseErr);
            throw parseErr;
          }
        }
      }

      // 非 JSON 回應，回傳純文字內容
      try {
        return await response.text();
      } catch (e) {
        error(`API 讀取回應失敗: ${endpoint}`, e);
        throw e;
      }
    } catch (err) {
      if (!silent) {
        error(`API 請求失敗: ${endpoint}`, err);
      }
      throw err;
    }
  },

  _cache: {
    characters: null,
    leaderboard: null
  },
  _source: {
    characters: 'unknown',
    leaderboard: 'unknown'
  },
  _cacheKeys: {
    characters: 'cache_characters_v1',
    leaderboard: 'cache_leaderboard_v1'
  },
  _setSource(type, source) {
    API._source[type] = source;
  },
  getDataSourceStatus() {
    return {
      ...API._source
    };
  },
  _loadCache(type) {
    try {
      const raw = localStorage.getItem(API._cacheKeys[type]);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  _saveCache(type, data) {
    try {
      localStorage.setItem(API._cacheKeys[type], JSON.stringify(data));
    } catch (e) {
      // ignore
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
        const data = await API.request('/characters', { silent: true });
        API.characters._cache = data;
        API._saveCache('characters', data);
        API._setSource('characters', 'remote');
        return data;
      } catch (err) {
        const cachedData = API._loadCache('characters');
        if (cachedData) {
          API.characters._cache = cachedData;
          API._setSource('characters', 'cache');
          return cachedData;
        }

        const data = await API.loadLocalCharacters();
        API.characters._cache = data;
        API._setSource('characters', 'static');
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
        const fallbackSource = API._source.characters === 'remote'
          ? 'derived'
          : API._source.characters;

        const buildList = (campName, campValue) => {
          const source = (data[campName] || []).map((char, index) => ({
            character_id: char.character_id,
            manor_name: char.manor_name,
            profession: char.profession,
            camp: campValue,
            vote_count: char.vote_count ?? char.votes ?? 0,
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

        return { all, survivor, hunter, source: fallbackSource };
      } catch (err) {
        return { all: [], survivor: [], hunter: [], source: 'static' };
      }
    },
    async getAll(force = false) {
      if (!force && API.leaderboard._cache.all) {
        return API.leaderboard._cache.all;
      }

      try {
        const data = await API.request('/leaderboard/all', { silent: true });
        API.leaderboard._cache.all = data;
        API._saveCache('leaderboard', data);
        API._setSource('leaderboard', 'remote');
        return data;
      } catch (err) {
        const cachedData = API._loadCache('leaderboard');
        if (cachedData) {
          API.leaderboard._cache.all = cachedData;
          API._setSource('leaderboard', 'cache');
          return cachedData;
        }

        const fallback = await API.leaderboard.getFallbackFromCharacters();
        API.leaderboard._cache.all = fallback.all;
        API.leaderboard._cache.survivor = fallback.survivor;
        API.leaderboard._cache.hunter = fallback.hunter;
        API._setSource('leaderboard', fallback.source || 'static');
        return fallback.all;
      }
    },
    async getSurvivors(force = false) {
      if (!force && API.leaderboard._cache.survivor) {
        return API.leaderboard._cache.survivor;
      }
      const rankings = await API.leaderboard.getAll(force);
      const data = rankings.filter(item => {
        const camp = String(item.camp || '').toLowerCase();
        return camp === 'survivor' || camp === '求生者';
      });
      API.leaderboard._cache.survivor = data;
      return data;
    },
    async getHunters(force = false) {
      if (!force && API.leaderboard._cache.hunter) {
        return API.leaderboard._cache.hunter;
      }
      const rankings = await API.leaderboard.getAll(force);
      const data = rankings.filter(item => {
        const camp = String(item.camp || '').toLowerCase();
        return camp === 'hunter' || camp === '監管者';
      });
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


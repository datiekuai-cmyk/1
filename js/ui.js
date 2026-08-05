// UI 蝞∠?璅∠?
const UI = {
  currentView: null,
  currentCharacter: null,
  currentQuestion: null,
  currentCamp: null,
  votingTimer: null,
  votingTimeRemaining: 0,

  switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });

    const view = document.getElementById(`${viewName}-view`);
    if (view) {
      view.classList.remove('hidden');
      this.currentView = viewName;

      if (viewName === 'home') {
        this.initHomeView();
      } else if (viewName === 'leaderboard') {
        this.loadLeaderboard('all');
      }
    }

    this.updateStatusBanner();
  },

  updateUserInfo(name) {
    document.getElementById('user-name').textContent = name || '';
  },

  updateStatusBanner() {
    const banner = document.getElementById('status-banner');
    if (!banner) return;

    const status = API.getDataSourceStatus();
    const messages = [];

    if (status.characters && status.characters !== 'remote' && status.characters !== 'unknown') {
      if (status.characters === 'cache') {
        messages.push('目前使用本地快取角色資料');
      } else if (status.characters === 'static') {
        messages.push('目前使用靜態備援角色資料');
      }
    }

    if (status.leaderboard && status.leaderboard !== 'remote' && status.leaderboard !== 'unknown') {
      if (status.leaderboard === 'cache') {
        messages.push('目前使用本地快取排行榜資料');
      } else if (status.leaderboard === 'derived') {
        messages.push('目前使用後端角色資料推算排行榜');
      } else if (status.leaderboard === 'static') {
        messages.push('目前使用靜態備援排行榜資料');
      }
    }

    if (messages.length > 0) {
      banner.textContent = `注意：${messages.join('，')}。資料可能不是最新的。`;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  },

  getCharacterImagePath(character) {
    if (!character) return '';

    const map = window.CHARACTER_IMAGE_MAP || {};
    const characterId = character.character_id;
    if (characterId && map[characterId]) {
      return `${CONFIG.API_URL}/photo?name=${encodeURIComponent(map[characterId])}`;
    }

    const sanitize = (value) => {
      if (!value) return '';
      return String(value)
        .replace(/[??'`\\/]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const buildCandidates = () => {
      const names = [
        character.profession,
        character.manor_name,
        character.alias,
        character.real_name,
        characterId
      ].filter(Boolean);

      const candidates = [];
      names.forEach(rawName => {
        const name = sanitize(rawName);
        if (!name) return;
        candidates.push(name);
        candidates.push(`${name}.png`);
        candidates.push(`${name}.jpg`);
      });

      if (characterId) {
        candidates.push(characterId);
        candidates.push(`${characterId}.png`);
        candidates.push(`${characterId}.jpg`);
      }

      return candidates;
    };

    const candidates = buildCandidates();
    for (const candidate of candidates) {
      if (candidate.endsWith('.png') || candidate.endsWith('.jpg')) {
        // ??敺垢隞??????嚗??蝡舫????芸??怠???皞?
        return `${CONFIG.API_URL}/photo?name=${encodeURIComponent(candidate)}`;
      }
    }

    return `${CONFIG.API_URL}/photo?name=${encodeURIComponent((characterId || 'default') + '.png')}`;
  },

  async initHomeView() {
    try {
      const info = await API.getInfo();
      document.getElementById('data-update-date').textContent = info.lastUpdate;
      this.loadLeaderboardPreview('all');
    } catch (err) {
      error('?????仃??', err);
    }
  },

  async loadLeaderboardPreview(rankType = 'all') {
    try {
      let rankings;
      switch (rankType) {
        case 'survivor':
          rankings = await API.leaderboard.getSurvivors();
          break;
        case 'hunter':
          rankings = await API.leaderboard.getHunters();
          break;
        default:
          rankings = await API.leaderboard.getAll();
      }

      const container = document.getElementById('leaderboard-container');
      container.innerHTML = '';

      if (!rankings || rankings.length === 0) {
        container.innerHTML = '<div class="empty-message">目前沒有排名或載入失敗。請檢查後端或瀏覽器主控台（Console）錯誤。</div>';
        return;
      }

      rankings.slice(0, 10).forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'leaderboard-item';
        const votes = item.vote_count ?? item.votes ?? 0;
        element.innerHTML = `
          <div class="leaderboard-rank">#${index + 1}</div>
          <div class="leaderboard-name">${item.profession}</div>
          <div class="leaderboard-subname">${item.manor_name}</div>
          <div class="leaderboard-votes">${votes} 票</div>
        `;
        container.appendChild(element);
      });
      this.updateStatusBanner();
    } catch (err) {
      error('載入排行榜預覽失敗', err);
    }
  },

  async loadLeaderboard(rankType = 'all') {
    try {
      let rankings;
      switch (rankType) {
        case 'survivor':
          rankings = await API.leaderboard.getSurvivors();
          break;
        case 'hunter':
          rankings = await API.leaderboard.getHunters();
          break;
        default:
          rankings = await API.leaderboard.getAll();
      }

      const container = document.getElementById('full-leaderboard');
      container.innerHTML = '';

      if (!rankings || rankings.length === 0) {
        container.innerHTML = '<div class="empty-message">目前沒有排名或載入失敗。請檢查後端或瀏覽器主控台（Console）錯誤。</div>';
        return;
      }

      rankings.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'ranking-item';
        const votes = item.vote_count ?? item.votes ?? 0;
        element.innerHTML = `
          <div class="rank-badge">#${index + 1}</div>
          <div>
            <div class="rank-name">${item.profession}</div>
            <div class="rank-subname">${item.manor_name}</div>
          </div>
          <div class="rank-votes">${votes}</div>
        `;
        container.appendChild(element);
      });
      this.updateStatusBanner();
    } catch (err) {
      error('????璁仃??', err);
    }
  },

  async loadCharacterList(camp) {
    try {
      const data = await API.characters.getAll();
      const characters = camp === 'survivor' ? data.survivors : data.hunters;

      const title = camp === 'survivor' ? '求生者' : '監管者';
      document.getElementById('character-list-title').textContent = title;

      const grid = document.getElementById('characters-grid');
      grid.innerHTML = '';

      characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-card-info only-info">
              <div class="character-card-name">${char.profession}</div>
              <div class="character-card-subname">${char.manor_name}</div>
            </div>
          `;

        card.addEventListener('click', () => {
          this.loadCharacterDetail(char.character_id);
        });

        grid.appendChild(card);
      });

      this.switchView('character-list');
      this.updateStatusBanner();
    } catch (err) {
      error('載入角色列表失敗', err);
    }
  },

  async loadCharacterDetail(characterId) {
    try {
      const character = await API.characters.getDetail(characterId);
      this.currentCharacter = character;

      document.getElementById('character-detail-title').textContent = character.manor_name;
      document.getElementById('detail-manor-name').textContent = character.manor_name;
      document.getElementById('detail-profession').textContent = character.profession;
      document.getElementById('detail-camp').textContent = character.camp;
      document.getElementById('detail-votes').textContent = character.vote_count ?? character.votes ?? 0;
      document.getElementById('detail-rank').textContent = character.rank ? `#${character.rank}` : '暫無排名';

      const img = document.getElementById('character-img');
      // set placeholder while probing for actual image
      img.style.display = '';
      img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="100%" height="100%" fill="#444"/></svg>';

      // async probe helper
      const probeImageUrl = async (url) => {
        try {
          const resp = await fetch(url, { method: 'GET' });
          if (resp.ok && resp.headers.get('content-type') && resp.headers.get('content-type').startsWith('image')) {
            return url;
          }
        } catch (e) {
          // ignore
        }
        return null;
      };

      // build candidates with local cache and prefer static gh-pages assets
      const cacheKey = 'characterImageCache_v1';
      const cache = (() => {
        try { return JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch(e){ return {}; }
      })();
      if (character.character_id && cache[character.character_id]) {
        img.src = cache[character.character_id];
      }

      const candidates = [];
      const map = window.CHARACTER_IMAGE_MAP || {};
      const baseStatic = '角色照片/';
      if (character.character_id && map[character.character_id]) {
        const filename = map[character.character_id];
        candidates.push(`${baseStatic}${encodeURIComponent(filename)}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(filename)}`);
      }

      const sanitize = (v) => v ? String(v).replace(/["'`\\]/g, '').trim() : '';
      const names = [character.profession, character.manor_name, character.alias, character.real_name, character.character_id].map(sanitize).filter(Boolean);
      names.forEach(n => {
        candidates.push(`${baseStatic}${encodeURIComponent(n)}`);
        candidates.push(`${baseStatic}${encodeURIComponent(n + '.png')}`);
        candidates.push(`${baseStatic}${encodeURIComponent(n + '.jpg')}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(n)}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(n + '.png')}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(n + '.jpg')}`);
      });

      if (character.character_id) {
        candidates.push(`${baseStatic}${encodeURIComponent(character.character_id + '.png')}`);
        candidates.push(`${baseStatic}${encodeURIComponent(character.character_id + '.jpg')}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(character.character_id + '.png')}`);
        candidates.push(`${CONFIG.API_URL}/photo?name=${encodeURIComponent(character.character_id + '.jpg')}`);
      }

      (async () => {
        for (const c of candidates) {
          const ok = await probeImageUrl(c);
          if (ok) {
            img.src = ok;
            try {
              cache[character.character_id] = ok;
              localStorage.setItem(cacheKey, JSON.stringify(cache));
            } catch (e) {}
            return;
          }
        }
        img.style.display = 'none';
      })();

      this.checkAndUpdateCooldown();
      this.switchView('character-detail');
      this.updateStatusBanner();
    } catch (err) {
      error('??閫閰單?憭望?:', err);
    }
  },

  async checkAndUpdateCooldown() {
    try {
      const cooldown = await API.cooldown.getStatus(this.currentCharacter.character_id);
      const btn = document.getElementById('vote-btn');

      if (cooldown.inCooldown) {
        btn.disabled = true;
        btn.textContent = `冷卻中 ${cooldown.remainingSeconds}s`;

        let remaining = cooldown.remainingSeconds;
        const interval = setInterval(() => {
          remaining--;
          btn.textContent = `冷卻中 ${remaining}s`;

          if (remaining <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            btn.textContent = '投票給此角色';
          }
        }, 1000);
      } else {
        btn.disabled = false;
        btn.textContent = '投票給此角色';
      }
    } catch (err) {
      error('檢查冷卻狀態失敗', err);
    }
  },

  async startVoting() {
    try {
      const difficulty = this.getCurrentDifficulty();
      this.currentQuestion = await API.questions.getRandom(
        this.currentCharacter.character_id,
        difficulty
      );

      document.getElementById('question-text').textContent = this.currentQuestion.question_text;

      const optionsContainer = document.getElementById('options-container');
      optionsContainer.innerHTML = '';

      const options = this.currentQuestion.options || [];
      options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => this.submitAnswer(option));
        optionsContainer.appendChild(btn);
      });

      this.startTimer();
      this.switchView('voting');
    } catch (err) {
      error('???巨憭望?:', err);
    }
  },

  getCurrentDifficulty() {
    return 'easy';
  },

  startTimer() {
    this.votingTimeRemaining = CONFIG.QUESTION_TIME_LIMIT;
    const timerElement = document.getElementById('timer');

    if (this.votingTimer) {
      clearInterval(this.votingTimer);
    }

    this.votingTimer = setInterval(() => {
      this.votingTimeRemaining--;
      timerElement.textContent = this.votingTimeRemaining;

      if (this.votingTimeRemaining <= 10) {
        timerElement.classList.add('danger');
      } else if (this.votingTimeRemaining <= 20) {
        timerElement.classList.add('warning');
      }

      if (this.votingTimeRemaining <= 0) {
        clearInterval(this.votingTimer);
        this.handleTimeUp();
      }
    }, 1000);
  },

  handleTimeUp() {
    this.showResult(false, '時間到', '時間到，答題結束', '');
  },

  async submitAnswer(selectedAnswer) {
    try {
      clearInterval(this.votingTimer);

      const result = await API.questions.submit(
        this.currentQuestion.question_id,
        this.currentCharacter.character_id,
        selectedAnswer,
        CONFIG.QUESTION_TIME_LIMIT - this.votingTimeRemaining
      );

      if (result.isCorrect) {
        API.leaderboard.clearCache();
        API.characters.clearCache();
      }

      const options = document.querySelectorAll('.option-btn');
      options.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === result.correctAnswer) {
          btn.classList.add('correct');
        } else if (btn.textContent === selectedAnswer && !result.isCorrect) {
          btn.classList.add('incorrect');
        }
      });

      this.showResult(
        result.isCorrect,
        result.isCorrect ? '回答正確' : '回答錯誤',
        result.message,
        result.correctAnswer
      );
    } catch (err) {
      error('提交答案時發生錯誤', err);
    }
  },

  showResult(isCorrect, title, message, correctAnswer = '') {
    const resultContainer = document.getElementById('result-container');
    const resultTitle = document.getElementById('result-title');
    const resultMsg = document.getElementById('result-message');
    const resultDetail = document.getElementById('result-detail');

    resultTitle.textContent = title;
    resultTitle.style.color = isCorrect ? 'var(--success-color)' : 'var(--error-color)';
    resultMsg.textContent = message;
    resultDetail.textContent = isCorrect ? '' : `正確答案: ${correctAnswer}`;

    resultContainer.classList.remove('hidden');
  },

  async continueAfterVoting() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.add('hidden');

    try {
      await this.checkAndUpdateCooldown();
      if (this.currentCharacter && this.currentCharacter.character_id) {
        await this.loadCharacterDetail(this.currentCharacter.character_id);
        return;
      }
    } catch (err) {
      error('?湔?瑕??憭望?:', err);
    }

    this.switchView('character-detail');
  }
};


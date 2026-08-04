// 銝餅??函?撘?
const App = {
  async init() {
    log('初始化應用...');
    
    // ????Google Sign-In
    await Auth.initGoogleSignIn();
    
    // 蝬?鈭辣????
    App.bindEventListeners();
    
    // 瑼Ｘ?餃???
    await Auth.checkLoginStatus();

    // ???閫??銵?鞈?嚗?撠脣?巨隞?辣??
    App.prefetchData();
  },

  bindEventListeners() {
    // ????
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const camp = e.currentTarget.dataset.camp;
        const campMap = { 'survivor': 'survivor', 'hunter': 'hunter' };
        UI.currentCamp = campMap[camp];
        UI.loadCharacterList(camp);
      });
    });

    // 餈???
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const backTo = e.currentTarget.dataset.back;
        UI.switchView(backTo);
      });
    });

    // ?餃??
    document.getElementById('logout-btn').addEventListener('click', () => {
      Auth.logout();
    });

    // ???巨??
    document.getElementById('vote-btn').addEventListener('click', async () => {
      if (!document.getElementById('vote-btn').disabled) {
        await UI.startVoting();
      }
    });

    // ?巨敺匱蝥???
    document.getElementById('next-btn').addEventListener('click', () => {
      UI.continueAfterVoting();
    });

    // ??璁?蝐?
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tabType = e.target.dataset.tab;
        const rankMap = {
          'all-rank': 'all',
          'survivor-rank': 'survivor',
          'hunter-rank': 'hunter'
        };
        UI.loadLeaderboardPreview(rankMap[tabType]);
      });
    });

    // 摰??璁?蝐?
    document.querySelectorAll('.leaderboard-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.leaderboard-tab-btn').forEach(b => 
          b.classList.remove('active')
        );
        e.target.classList.add('active');
        const rankType = e.target.dataset.rankType;
        UI.loadLeaderboard(rankType);
      });
    });

    // ?亦?摰??璁??
    document.querySelector('.view-all-btn').addEventListener('click', (e) => {
      e.preventDefault();
      UI.switchView('leaderboard');
    });

    // ?瑕??摰???
    document.getElementById('cooldown-done-btn').addEventListener('click', () => {
      UI.switchView('character-detail');
    });
  },

  async prefetchData() {
    API.characters.getAll().catch(err => log('預取角色資料失敗', err));
    API.leaderboard.getAll().catch(err => log('預取排行榜失敗', err));
  }
};

// ??DOM ??摰??????函?撘?
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});


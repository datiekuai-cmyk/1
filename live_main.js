// 主應用程式
const App = {
  async init() {
    log('初始化應用程式...');
    
    // 初始化 Google Sign-In
    await Auth.initGoogleSignIn();
    
    // 綁定事件監聽器
    App.bindEventListeners();
    
    // 檢查登入狀態
    await Auth.checkLoginStatus();

    // 背景預載角色與排行榜資料，減少進入投票介面的延遲
    App.prefetchData();
  },

  bindEventListeners() {
    // 分類按鈕
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const camp = e.currentTarget.dataset.camp;
        const campMap = { 'survivor': 'survivor', 'hunter': 'hunter' };
        UI.currentCamp = campMap[camp];
        UI.loadCharacterList(camp);
      });
    });

    // 返回按鈕
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const backTo = e.currentTarget.dataset.back;
        UI.switchView(backTo);
      });
    });

    // 登出按鈕
    document.getElementById('logout-btn').addEventListener('click', () => {
      Auth.logout();
    });

    // 開始投票按鈕
    document.getElementById('vote-btn').addEventListener('click', async () => {
      if (!document.getElementById('vote-btn').disabled) {
        await UI.startVoting();
      }
    });

    // 投票後繼續按鈕
    document.getElementById('next-btn').addEventListener('click', () => {
      UI.continueAfterVoting();
    });

    // 排行榜標籤
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

    // 完整排行榜標籤
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

    // 查看完整排行榜連結
    document.querySelector('.view-all-btn').addEventListener('click', (e) => {
      e.preventDefault();
      UI.switchView('leaderboard');
    });

    // 冷卻時間完成按鈕
    document.getElementById('cooldown-done-btn').addEventListener('click', () => {
      UI.switchView('character-detail');
    });
  },

  async prefetchData() {
    API.characters.getAll().catch(err => log('預載角色資訊失敗', err));
    API.leaderboard.getAll().catch(err => log('預載排行榜失敗', err));
  }
};

// 當 DOM 加載完成時啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

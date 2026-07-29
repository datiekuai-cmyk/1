// 認證模組
const Auth = {
  currentUser: null,
  isLoggedIn: false,

  // 等待 Google SDK 加載
  async waitForGoogleSDK() {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve();
        return;
      }
      
      const checkGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkGoogle);
          resolve();
        }
      }, 100);
      
      // 最多等 5 秒
      setTimeout(() => {
        clearInterval(checkGoogle);
        resolve();
      }, 5000);
    });
  },

  // 初始化 Google Sign-In
  async initGoogleSignIn() {
    await Auth.waitForGoogleSDK();
    
    if (typeof google === 'undefined' || !google.accounts) {
      error('Google SDK 未加載，使用開發登入模式');
      return;
    }
    
    try {
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: Auth.handleGoogleResponse
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'dark', size: 'large' }
      );
    } catch (err) {
      error('Google Sign-In 初始化失敗，使用開發登入模式:', err);
    }
  },

  // 處理 Google 登入回應
  async handleGoogleResponse(response) {
    const idToken = response && response.credential;
    if (!idToken) {
      error('Google 回傳無有效 credential');
      return;
    }

    try {
      // 儘量透過後端驗證 ID token（生產環境推薦）
      const data = await API.auth.googleCallback(idToken);

      // 儲存令牌和用戶信息（以後端回傳為準）
      localStorage.setItem(CONFIG.STORAGE_TOKEN, data.token);
      localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: data.email,
        picture: data.picture
      }));

      Auth.currentUser = data;
      Auth.isLoggedIn = true;

      log('登入成功 (server verified):', data);
      UI.switchView('home');
    } catch (err) {
      // 若後端不可用或發生錯誤，嘗試 client-side fallback（僅供 demo / 測試）
      try {
        const parseJwt = (token) => {
          const base64Url = (token.split('.')[1] || '');
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
        };

        const payload = parseJwt(idToken);
        const user = {
          userId: payload.sub,
          name: payload.name || payload.email,
          email: payload.email,
          picture: payload.picture
        };

        // 儲存 token 與 user（注意：此方法在生產環境不安全，僅供展示）
        localStorage.setItem(CONFIG.STORAGE_TOKEN, idToken);
        localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(user));
        Auth.currentUser = user;
        Auth.isLoggedIn = true;

        log('登入成功 (client fallback):', user);
        UI.switchView('home');
      } catch (e2) {
        error('Google 登入失敗（server 與 client fallback 均失敗）:', e2, err);
        UI.switchView('login');
      }
    }
  },

  // 檢查登入狀態
  async checkLoginStatus() {
    const token = localStorage.getItem(CONFIG.STORAGE_TOKEN);
    const userStr = localStorage.getItem(CONFIG.STORAGE_USER);
    
    if (!token) {
      Auth.isLoggedIn = false;
      UI.switchView('login');
      return;
    }
    
    try {
      const verified = await API.auth.verify();
      Auth.currentUser = verified.user;
      Auth.isLoggedIn = true;
      
      if (userStr) {
        const user = JSON.parse(userStr);
        UI.updateUserInfo(user.name);
      }
      
      UI.switchView('home');
    } catch (err) {
      localStorage.removeItem(CONFIG.STORAGE_TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_USER);
      Auth.isLoggedIn = false;
      UI.switchView('login');
    }
  },

  // 登出
  async logout() {
    try {
      await API.auth.logout();
      localStorage.removeItem(CONFIG.STORAGE_TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_USER);
      Auth.currentUser = null;
      Auth.isLoggedIn = false;
      UI.switchView('login');
    } catch (err) {
      error('登出失敗:', err);
    }
  }
};

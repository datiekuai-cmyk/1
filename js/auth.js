// 隤?璅∠?
const Auth = {
  currentUser: null,
  isLoggedIn: false,

  // 蝑? Google SDK ??
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
      
      // ?憭? 5 蝘?
      setTimeout(() => {
        clearInterval(checkGoogle);
        resolve();
      }, 5000);
    });
  },

  // ????Google Sign-In
  async initGoogleSignIn() {
    await Auth.waitForGoogleSDK();
    
    if (typeof google === 'undefined' || !google.accounts) {
      error('Google SDK ?芸?頛?雿輻??餃璅∪?');
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
      error('Google Sign-In ???仃??雿輻??餃璅∪?:', err);
    }
  },

  // ?? Google ?餃??
  async handleGoogleResponse(response) {
    const idToken = response && response.credential;
    if (!idToken) {
      error('Google ??⊥???credential');
      return;
    }

    try {
      // ????敺垢撽? ID token嚗??Ｙ憓?佗?
      const data = await API.auth.googleCallback(idToken);

      // ?脣?隞斤???嗡縑?荔?隞亙?蝡臬??喟皞?
      localStorage.setItem(CONFIG.STORAGE_TOKEN, data.token);
      localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: data.email,
        picture: data.picture
      }));

      Auth.currentUser = data;
      Auth.isLoggedIn = true;

      log('?餃?? (server verified):', data);
      UI.switchView('home');
    } catch (err) {
      // ?亙?蝡臭??舐??隤歹??岫 client-side fallback嚗?靘?demo / 皜祈岫嚗?
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

        // ?脣? token ??user嚗釣??甇斗瘜??啣?銝??剁???撅內嚗?
        localStorage.setItem(CONFIG.STORAGE_TOKEN, idToken);
        localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(user));
        Auth.currentUser = user;
        Auth.isLoggedIn = true;

        log('?餃?? (client fallback):', user);
        UI.switchView('home');
      } catch (e2) {
        error('Google ?餃憭望?嚗erver ??client fallback ?仃??:', e2, err);
        UI.switchView('login');
      }
    }
  },

  // 瑼Ｘ?餃???
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

  // ?餃
  async logout() {
    try {
      await API.auth.logout();
      localStorage.removeItem(CONFIG.STORAGE_TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_USER);
      Auth.currentUser = null;
      Auth.isLoggedIn = false;
      UI.switchView('login');
    } catch (err) {
      error('?餃憭望?:', err);
    }
  }
};


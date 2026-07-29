const express = require('express');
const jwt = require('jsonwebtoken');
const googleClient = require('../config/auth');
const supabase = require('../config/database');

const router = express.Router();

// Google 登入回調
router.post('/google/callback', async (req, res) => {
  try {
    const { token, credential } = req.body;
    const idToken = token || credential;
    if (!idToken) {
      return res.status(400).json({ error: '缺少 Google token' });
    }
    
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // 檢查或建立使用者
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId);
    
    if (selectError) throw selectError;
    
    let userId;
    if (users && users.length > 0) {
      userId = users[0].id;
    } else {
      // 建立新使用者
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            google_id: googleId,
            email,
            name,
            avatar: picture
          }
        ])
        .select();
      
      if (insertError) throw insertError;
      userId = newUser[0].id;
    }
    
    // 生成 JWT
    const jwtToken = jwt.sign(
      { userId, email, googleId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    
    res.json({ token: jwtToken, userId, name, email, picture });
  } catch (error) {
    console.error('Google 驗證失敗:', error);
    res.status(401).json({ error: '驗證失敗' });
  }
});

// 驗證 JWT
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授權' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: '無效的權杖' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.json({ message: '已登出' });
});

module.exports = router;

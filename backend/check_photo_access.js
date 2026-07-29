const fs = require('fs');
const path = require('path');
const PHOTO_PATH = path.join(__dirname, '../角色照片');
const testFile = '杂技演员.png';
const full = path.join(PHOTO_PATH, testFile);
console.log('PHOTO_PATH:', PHOTO_PATH);
console.log('Testing file:', full);
console.log('existsSync:', fs.existsSync(full));
try {
  const s = fs.statSync(full);
  console.log('size:', s.size);
} catch (e) {
  console.error('stat error:', e && e.message);
}

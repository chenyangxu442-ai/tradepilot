// 给打包后的 TradePilot.exe 注入自定义图标（electron-builder signAndEditExecutable=false 时不写 exe 图标）
// 用法：node scripts/set-icon.js
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const exe = path.join(root, 'release', 'win-unpacked', 'TradePilot.exe');
const ico = path.join(root, 'build', 'icon.ico');
const rcedit = path.join(__dirname, 'rcedit-x64.exe');

try {
  execFileSync(rcedit, [exe, '--set-icon', ico], { stdio: 'inherit' });
  console.log('✓ 图标已注入:', exe);
} catch (err) {
  console.error('图标注入失败:', err.message);
  process.exit(1);
}

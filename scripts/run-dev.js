const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('🕉️  MAHAKAL CLASSES – Launching Full-Stack (No Docker)');
console.log('📡 Backend: http://localhost:5000');
console.log('🌐 Web App: http://localhost:3000');
console.log('========================================================\n');

// 1. Spawn Backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true,
});

// 2. Spawn Web Frontend
const web = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'web'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n[Mahakal Classes] Stopping servers...');
  try {
    backend.kill();
  } catch (e) {}
  try {
    web.kill();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

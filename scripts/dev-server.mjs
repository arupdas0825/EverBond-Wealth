import { spawn } from 'child_process';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const tsxCli = path.resolve(rootDir, 'node_modules/tsx/dist/cli.mjs');
const viteCli = path.resolve(rootDir, 'node_modules/vite/bin/vite.js');

function isPortActive(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    s.on('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  console.log('\x1b[36m[EverBond]\x1b[0m Starting Development Environment...');

  const backendAlreadyRunning = await isPortActive(5000);
  let serverProcess = null;

  if (backendAlreadyRunning) {
    console.log('\x1b[32m[EverBond]\x1b[0m Backend API is already running on port 5000.');
  } else {
    console.log('\x1b[36m[EverBond]\x1b[0m Launching Backend Server on port 5000...');
    serverProcess = spawn(process.execPath, [tsxCli, 'server/index.ts'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env },
    });

    serverProcess.on('exit', (code) => {
      if (code && code !== 0 && code !== 130) {
        console.warn(`\x1b[33m[EverBond Backend]\x1b[0m Process exited with code ${code}`);
      }
      serverProcess = null;
    });
  }

  console.log('\x1b[36m[EverBond]\x1b[0m Launching Vite Dev Server on port 5173...\n');
  const viteProcess = spawn(process.execPath, [viteCli, ...process.argv.slice(2)], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env },
  });

  function cleanup() {
    if (serverProcess && !serverProcess.killed) {
      try {
        if (isWin) {
          spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t']);
        } else {
          serverProcess.kill('SIGTERM');
        }
      } catch (_) {
        serverProcess.kill();
      }
    }
    if (viteProcess && !viteProcess.killed) {
      try {
        if (isWin) {
          spawn('taskkill', ['/pid', viteProcess.pid.toString(), '/f', '/t']);
        } else {
          viteProcess.kill('SIGTERM');
        }
      } catch (_) {
        viteProcess.kill();
      }
    }
  }

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  viteProcess.on('exit', (code) => {
    cleanup();
    process.exit(code || 0);
  });
}

main();

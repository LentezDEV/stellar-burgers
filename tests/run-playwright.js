const http = require('http');
const { spawn } = require('child_process');

const serverUrl = 'http://127.0.0.1:4000/';

const waitForServer = (timeout = 120000) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      const request = http.get(serverUrl, (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (Date.now() - startedAt > timeout) {
          reject(new Error(`Timed out waiting for ${serverUrl}`));
          return;
        }

        setTimeout(check, 500);
      });
    };

    check();
  });

const run = (command, args, options = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });

    child.on('exit', (code) => resolve(code || 0));
  });

const stopServer = (server) =>
  new Promise((resolve) => {
    if (server.exitCode !== null || server.killed) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      server.kill('SIGKILL');
      resolve();
    }, 5000);

    server.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    server.kill('SIGTERM');
  });

(async () => {
  const server = spawn(process.execPath, ['./tests/playwright-dev-server.js'], {
    stdio: 'inherit'
  });

  try {
    await waitForServer();
    const code = await run(process.execPath, [
      './node_modules/@playwright/test/cli.js',
      'test'
    ]);
    await stopServer(server);
    process.exit(code);
  } catch (error) {
    console.error(error);
    await stopServer(server);
    process.exit(1);
  }
})();

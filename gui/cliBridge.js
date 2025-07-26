/**
 * Launch the frozen CLI binary from the GUI.
 * Adjust exePath if the binary lives elsewhere.
 */

const { spawn } = require('child_process');
const path = require('path');

const exePath = path.join(__dirname, '../../bin/operate_runner.exe'); // update if needed

exports.runCli = function runCli(args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(exePath, args, { stdio: 'inherit' });

    proc.once('error', reject);
    proc.once('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`CLI exited with code ${code}`));
    });
  });
};

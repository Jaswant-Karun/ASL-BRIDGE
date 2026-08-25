import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const scriptPath = path.join(rootDir, 'backend', 'scripts', 'transcribe_whisper.py');

export async function transcribe(buffer, originalName = 'recording.webm') {
  const tempPath = path.join(os.tmpdir(), `asl-whisper-${Date.now()}-${path.basename(originalName)}`);
  try {
    await fs.writeFile(tempPath, buffer);
    const { stdout } = await execFileAsync('python', [scriptPath, '--audio', tempPath], { cwd: rootDir, timeout: 120000, windowsHide: true });
    return JSON.parse(stdout);
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

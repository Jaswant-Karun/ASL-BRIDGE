import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const modelPath = path.join(rootDir, 'backend', 'models', 'asl-knn.joblib');
const trainerPath = path.join(rootDir, 'backend', 'scripts', 'train_asl_model.py');

export async function predictGesture(buffer, originalName = 'gesture.jpg') {
  const tempPath = path.join(os.tmpdir(), `asl-gesture-${Date.now()}-${path.basename(originalName)}`);
  try {
    await fs.writeFile(tempPath, buffer);
    const { stdout } = await execFileAsync('python', [trainerPath, '--output', modelPath, '--predict', tempPath], {
      cwd: rootDir,
      timeout: 30000,
      windowsHide: true
    });
    return JSON.parse(stdout);
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}
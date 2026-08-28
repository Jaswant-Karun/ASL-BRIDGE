/**
 * localModelService.js
 *
 * Fast path: forwards gesture images to the persistent Python prediction server
 * (predict_server.py) via a single loopback HTTP call — model stays loaded in RAM,
 * so each prediction takes ~5–20 ms instead of 500–2000 ms.
 *
 * Fallback path: if the Flask server is not running the service automatically
 * falls back to spawning a Python subprocess (original behaviour), so the app
 * keeps working without requiring predict_server.py to be started first.
 *
 * Configuration (via environment variables / .env):
 *   ASL_PREDICT_URL         – base URL of the Flask server  (default: http://127.0.0.1:5001)
 *   ASL_PREDICT_TIMEOUT_MS  – per-request timeout in ms     (default: 3000)
 */

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

const PREDICT_BASE_URL = process.env.ASL_PREDICT_URL || 'http://127.0.0.1:5001';
const PREDICT_TIMEOUT_MS = Number(process.env.ASL_PREDICT_TIMEOUT_MS ?? 3000);

// Track whether the Flask server is reachable so we stop hammering it after the
// first failed attempt and go straight to the subprocess fallback.
let _flaskReachable = true;
let _flaskCheckTimer = null;

function _scheduleFlaskRetry() {
  // Re-check the Flask server every 10 seconds.
  if (_flaskCheckTimer) return;
  _flaskCheckTimer = setTimeout(async () => {
    _flaskCheckTimer = null;
    try {
      const res = await fetch(`${PREDICT_BASE_URL}/health`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        _flaskReachable = true;
        console.log('[localModelService] Flask prediction server is back online — switching to fast path.');
      } else {
        _scheduleFlaskRetry();
      }
    } catch {
      _scheduleFlaskRetry();
    }
  }, 10_000);
}

// ---------------------------------------------------------------------------
// Fast path — Flask server
// ---------------------------------------------------------------------------
async function _predictViaFlask(buffer, originalName) {
  const form = new FormData();
  form.append('image', new Blob([buffer], { type: 'image/jpeg' }), originalName);

  const response = await fetch(`${PREDICT_BASE_URL}/predict`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(PREDICT_TIMEOUT_MS),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.error || `Flask server returned HTTP ${response.status}`);
  return json;
}

// ---------------------------------------------------------------------------
// Fallback — Python subprocess (original behaviour)
// ---------------------------------------------------------------------------
async function _predictViaSubprocess(buffer, originalName) {
  const tempPath = path.join(os.tmpdir(), `asl-gesture-${Date.now()}-${path.basename(originalName)}`);
  try {
    await fs.writeFile(tempPath, buffer);
    const { stdout } = await execFileAsync(
      'python',
      [trainerPath, '--output', modelPath, '--predict', tempPath],
      { cwd: rootDir, timeout: 30_000, windowsHide: true }
    );
    return JSON.parse(stdout);
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function predictGesture(buffer, originalName = 'gesture.jpg') {
  if (_flaskReachable) {
    try {
      const result = await _predictViaFlask(buffer, originalName);
      return result;
    } catch (err) {
      // Connection refused / timeout → Flask server isn't running.
      const isNetworkError =
        err.name === 'TimeoutError' ||
        err.cause?.code === 'ECONNREFUSED' ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('fetch failed');

      if (isNetworkError) {
        console.warn(
          `[localModelService] Flask server unreachable (${err.message}). ` +
          'Falling back to subprocess. Start predict_server.py for faster predictions.'
        );
        _flaskReachable = false;
        _scheduleFlaskRetry();
        // Fall through to subprocess below.
      } else {
        // Server is running but returned an application error — propagate it.
        throw err;
      }
    }
  }

  // Subprocess fallback.
  return _predictViaSubprocess(buffer, originalName);
}

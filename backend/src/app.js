import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import aslRoutes from './routes/aslRoutes.js';
import animatediffRoutes from './routes/animatediffRoutes.js';
import speechRoutes from './routes/speechRoutes.js';
import presentationRoutes from './routes/presentationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.resolve(__dirname, '../../Dataset/American');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Static file serving for Dataset/American
app.use('/dataset', express.static(datasetPath));

// 2. Dynamic Character Gesture Image Streamer (Resolves exact filenames like E1.jpg, M110.jpg, hand1_p...jpeg)
app.get('/dataset-image/:char', (request, response) => {
  try {
    const rawChar = String(request.params.char || 'a').toLowerCase().replace(/[^a-z0-9]/g, '');
    const char = rawChar || 'a';
    const sampleIdx = Math.max(0, parseInt(request.query.sample, 10) || 0);

    const charDir = path.join(datasetPath, char);
    if (!fs.existsSync(charDir)) {
      return response.status(404).json({ error: `Character ${char} not found in dataset.` });
    }

    const files = fs.readdirSync(charDir).filter((fn) => /\.(jpe?g|png)$/i.test(fn));
    if (files.length === 0) {
      return response.status(404).json({ error: `No images in dataset for ${char}.` });
    }

    const clean = files.filter((fn) => !fn.includes('copy'));
    const list = clean.length > 0 ? clean : files;
    const targetFile = list[sampleIdx % list.length] || list[0] || files[0];

    return response.sendFile(path.join(charDir, targetFile));
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/asl/animatediff', animatediffRoutes);
app.use('/api/asl', aslRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/presentation', presentationRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;



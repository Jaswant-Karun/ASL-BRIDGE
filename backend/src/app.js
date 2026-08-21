import cors from 'cors';
import express from 'express';
import aslRoutes from './routes/aslRoutes.js';
import speechRoutes from './routes/speechRoutes.js';
import presentationRoutes from './routes/presentationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/asl', aslRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/presentation', presentationRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;

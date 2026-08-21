import { Router } from 'express';
import { transcribeSpeech } from '../controllers/speechController.js';

const router = Router();
router.post('/transcribe', transcribeSpeech);
export default router;

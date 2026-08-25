import { Router } from 'express';
import { transcribeSpeech } from '../controllers/speechController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.post('/transcribe', upload.single('audio'), transcribeSpeech);
export default router;

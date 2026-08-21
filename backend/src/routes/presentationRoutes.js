import { Router } from 'express';
import { processPresentation } from '../controllers/presentationController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.post('/process', upload.single('presentation'), processPresentation);
export default router;

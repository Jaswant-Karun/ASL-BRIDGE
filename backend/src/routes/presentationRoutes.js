import { Router } from 'express';
import { processPresentation } from '../controllers/presentationController.js';

const router = Router();
router.post('/process', processPresentation);
export default router;

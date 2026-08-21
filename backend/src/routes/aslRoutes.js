import { Router } from 'express';
import { getSigns, mapSigns, translateText } from '../controllers/aslController.js';

const router = Router();
router.post('/translate', translateText);
router.post('/map', mapSigns);
router.get('/signs', getSigns);
export default router;

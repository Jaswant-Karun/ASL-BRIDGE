import { Router } from 'express';
import { getSigns, mapSigns, translateText, synthesizeMotion } from '../controllers/aslController.js';

const router = Router();
router.post('/translate', translateText);
router.post('/map', mapSigns);
router.post('/motion', synthesizeMotion);
router.get('/signs', getSigns);
export default router;


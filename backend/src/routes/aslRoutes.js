import { Router } from 'express';
import {
  getSigns,
  mapSigns,
  translateText,
  synthesizeMotion,
  getDatasetLibrary
} from '../controllers/aslController.js';

const router = Router();
router.post('/translate', translateText);
router.post('/map', mapSigns);
router.post('/motion', synthesizeMotion);
router.get('/signs', getSigns);
router.get('/dataset', getDatasetLibrary);

export default router;



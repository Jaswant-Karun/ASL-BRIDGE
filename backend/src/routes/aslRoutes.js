import { Router } from 'express';
import {
  getSigns,
  mapSigns,
  translateText,
  synthesizeMotion,
  getDatasetLibrary,
  predictDatasetGesture
} from '../controllers/aslController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.post('/translate', translateText);
router.post('/map', mapSigns);
router.post('/motion', synthesizeMotion);
router.post('/predict', upload.single('image'), predictDatasetGesture);
router.get('/signs', getSigns);
router.get('/dataset', getDatasetLibrary);

export default router;



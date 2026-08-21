import { Router } from 'express';
import {
  getAvatars,
  getSignLibrary,
  generateAvatarVideo,
  stitchVideo,
  getJobStatus
} from '../controllers/animatediffController.js';

const router = Router();

router.get('/avatars', getAvatars);
router.get('/library', getSignLibrary);
router.post('/generate', generateAvatarVideo);
router.post('/stitch', stitchVideo);
router.get('/status/:jobId', getJobStatus);

export default router;

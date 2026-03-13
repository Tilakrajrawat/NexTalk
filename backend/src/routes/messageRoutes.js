import { Router } from 'express';
import {
  getDMs,
  getRoomMessages,
  sendMessage,
  uploadAttachment,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = Router();

router.use(authMiddleware);
router.get('/dm/:userId', getDMs);
router.get('/:roomId', getRoomMessages);
router.post('/', sendMessage);
router.post('/upload', upload.single('file'), uploadAttachment);

export default router;

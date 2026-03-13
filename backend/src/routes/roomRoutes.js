import { Router } from 'express';
import { createRoom, getRooms, joinRoom, leaveRoom } from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getRooms);
router.post('/', createRoom);
router.post('/:id/join', joinRoom);
router.post('/:id/leave', leaveRoom);

export default router;

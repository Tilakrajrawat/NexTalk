import { Router } from 'express';
import { getUserById, searchUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/search', searchUsers);
router.get('/:id', getUserById);

export default router;

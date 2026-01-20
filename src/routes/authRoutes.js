import { Router } from 'express';
import { loginWithFirebase, getAllUsers, getCurrentUser, approveUser, deleteUser } from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public
router.post('/login', loginWithFirebase);

// Authenticated (any logged-in user)
router.get('/me', verifyToken, getCurrentUser);

// Admin only
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.put('/users/:id/approve', verifyToken, isAdmin, approveUser);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

export default router;

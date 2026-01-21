import { Router } from 'express';
import { createCar, getCars, getUserCars, getAllCarsAdmin, updateCarStatus } from '../controllers/carController.js';
import { verifyToken, isAdmin, isApproved } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public
router.get('/', getCars);

// User Protected (requires approval)
router.post('/', verifyToken, isApproved, upload.array('images', 10), createCar);
router.get('/my-listings', verifyToken, isApproved, getUserCars);

// Admin Protected
router.get('/admin', verifyToken, isAdmin, getAllCarsAdmin);
router.put('/admin/:id/status', verifyToken, isAdmin, updateCarStatus);

export default router;

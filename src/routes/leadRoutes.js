import express from 'express';
import { createLead, getLeads } from '../controllers/leadController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to submit a lead
router.post('/', createLead);

// Admin route to view all leads
router.get('/', verifyToken, isAdmin, getLeads);

export default router;

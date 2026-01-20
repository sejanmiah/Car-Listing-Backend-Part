import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadToStorage } from '../services/storageService.js';
import pool from '../config/db.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, email, phone, name, picture, role, approved, secondary_phone, country, city, address, emergency_contact_name, emergency_contact_phone, company_name, created_at FROM users WHERE id = ?', 
            [req.user.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Update user profile picture
router.post('/profile/picture', verifyToken, upload.single('picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload image to storage
        const imageUrl = await uploadToStorage(req.file.buffer, req.file.originalname);

        // Update user's picture in database
        await pool.query('UPDATE users SET picture = ? WHERE id = ?', [imageUrl, req.user.id]);

        res.json({ message: 'Profile picture updated successfully', picture: imageUrl });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'Failed to update profile picture' });
    }
});

// Update user profile (name, etc.)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { 
            name, phone, secondary_phone, country, city, address, 
            emergency_contact_name, emergency_contact_phone, company_name 
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const query = `
            UPDATE users SET 
            name = ?, phone = ?, secondary_phone = ?, country = ?, city = ?, 
            address = ?, emergency_contact_name = ?, emergency_contact_phone = ?, company_name = ? 
            WHERE id = ?
        `;

        await pool.query(query, [
            name, phone || null, secondary_phone || null, country || null, city || null, 
            address || null, emergency_contact_name || null, emergency_contact_phone || null, company_name || null, 
            req.user.id
        ]);

        const [rows] = await pool.query(
            'SELECT id, email, phone, name, picture, role, approved, secondary_phone, country, city, address, emergency_contact_name, emergency_contact_phone, company_name FROM users WHERE id = ?', 
            [req.user.id]
        );
        
        res.json({ message: 'Profile updated successfully', user: rows[0] });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

export default router;

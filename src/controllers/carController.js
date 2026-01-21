import pool from '../config/db.js';
import { uploadToStorage } from '../services/storageService.js';
import { createNotification, notifyAdmins } from '../utils/notificationUtils.js';

export const createCar = async (req, res) => {
    try {
        const { title, brand, model, year, price, description } = req.body;
        const userId = req.user.id;
        const files = req.files;

        if (!title || !brand || !model || !year || !price) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const imageUrls = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await uploadToStorage(file.buffer, file.originalname, file.mimetype);
                imageUrls.push(url);
            }
        }

        const query = `
            INSERT INTO cars (user_id, title, brand, model, year, price, description, images, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const [result] = await pool.query(query, [
            userId,
            title, 
            brand, 
            model, 
            year, 
            price, 
            description || '', 
            JSON.stringify(imageUrls)
        ]);

        res.status(201).json({ message: 'Car listing created successfully', carId: result.insertId });

        // Notify Admins
        await notifyAdmins('New Car Listing', `User submitted a new car listing: ${year} ${brand} ${model}`, 'car', result.insertId);
    } catch (error) {
        console.error("❌ Error creating car:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: error.message || 'Failed to create listing' });
    }
};

export const getCars = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cars WHERE status = "approved" ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cars' });
    }
};

export const getUserCars = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM cars WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user cars' });
    }
};

export const getAllCarsAdmin = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT c.*, u.email as user_email FROM cars c JOIN users u ON c.user_id = u.id ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin cars' });
    }
};

export const updateCarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
             res.status(400).json({ message: 'Invalid status' });
             return;
        }

        await pool.query('UPDATE cars SET status = ? WHERE id = ?', [status, id]);
        
        // Notify User
        const [car] = await pool.query('SELECT title, user_id FROM cars WHERE id = ?', [id]);
        if (car.length > 0) {
            const title = status === 'approved' ? 'Car Listing Approved' : 'Car Listing Rejected';
            const message = status === 'approved' 
                ? `Your listing "${car[0].title}" has been approved and is now live.`
                : `Your listing "${car[0].title}" has been rejected.`;
            await createNotification(car[0].user_id, title, message, status === 'approved' ? 'success' : 'error', id);
        }

        res.json({ message: `Car status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating car status' });
    }
};

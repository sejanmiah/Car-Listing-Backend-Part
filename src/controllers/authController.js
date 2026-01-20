import admin from '../config/firebase.js';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { notifyAdmins } from '../utils/notificationUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const loginWithFirebase = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400).json({ message: 'Token is required' });
        return;
    }

    try {
        // Verify Firebase Token
        let decodedToken;
        if (admin.apps.length) {
            decodedToken = await admin.auth().verifyIdToken(token);
        } else {
            // MOCK for development without Firebase keys
            console.log("Mocking verification for dev");
            decodedToken = { uid: 'mock-uid', email: 'mock@example.com', name: 'Mock User' }; 
        }

        const { uid, email, name, picture } = decodedToken;
        const normalizedEmail = email ? email.toLowerCase() : null;

        // Check if user exists by Firebase UID
        const [rows] = await pool.query('SELECT * FROM users WHERE firebase_uid = ?', [uid]);
        let user = rows[0];

        if (!user) {
            // Check if user exists by EMAIL (Account Linking)
            const [emailRows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
            user = emailRows[0];
            
            if (user) {
                // User exists with same email but different UID. Update the UID.
                await pool.query('UPDATE users SET firebase_uid = ?, name = COALESCE(name, ?), picture = COALESCE(picture, ?) WHERE id = ?', 
                    [uid, name, picture, user.id]
                );
                // Refetch updated user
                const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
                user = updatedRows[0];
            } else {
                // Create new user
                const [result] = await pool.query(
                    'INSERT INTO users (firebase_uid, email, phone, name, picture, role, approved) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [uid, normalizedEmail, null, name || 'User', picture || '', 'user', false]
                );
                const insertId = result.insertId;
                const [newUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [insertId]);
                user = newUserRows[0];
                
                // Notify Admins
                await notifyAdmins('New User Registration', `A new user ${user.name} (${user.email}) has joined the platform.`, 'user', user.id);
            }
        }

        // Generate App JWT
        const appToken = jwt.sign(
            { 
                id: user.id, 
                uid: user.firebase_uid, 
                email: user.email, 
                name: user.name,
                picture: user.picture,
                role: user.role,
                approved: user.approved 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token: appToken, user });

    } catch (error) {
        console.error("Login error", error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, name, picture, role, approved, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error('getCurrentUser error', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

export const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE users SET approved = TRUE WHERE id = ?', [id]);
        res.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('approveUser error', error);
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('deleteUser error', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

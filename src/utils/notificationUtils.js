import pool from '../config/db.js';

export const createNotification = async (userId, title, message, type = 'info', relatedId = null) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
            [userId, title, message, type, relatedId]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export const notifyAdmins = async (title, message, type = 'info', relatedId = null) => {
    try {
        const [admins] = await pool.query('SELECT id FROM users WHERE role = ?', ['admin']);
        if (admins.length === 0) return;

        const values = admins.map(admin => [admin.id, title, message, type, relatedId]);
        
        // Bulk insert
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES ?',
            [values]
        );
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

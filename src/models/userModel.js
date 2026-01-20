import pool from '../config/db.js';

export const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        picture VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        approved BOOLEAN DEFAULT FALSE,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    try {
        await pool.query(query);
        console.log("Users table created or already exists.");
    } catch (error) {
        console.error("Error creating users table:", error);
    }
};

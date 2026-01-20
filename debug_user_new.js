
import pool from './src/config/db.js';
import fs from 'fs';

async function checkUser() {
    try {
        const [rows] = await pool.query('SELECT id, email, picture FROM users WHERE email = ?', ['sejankhan931@gmail.com']);
        const userData = JSON.stringify(rows[0], null, 2);
        fs.writeFileSync('user_debug.txt', userData);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUser();

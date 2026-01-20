
import pool from './src/config/db.js';

async function checkUser() {
    try {
        const [rows] = await pool.query('SELECT id, email, picture FROM users WHERE email = ?', ['sejankhan931@gmail.com']);
        console.log('User Data:', rows[0]);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUser();

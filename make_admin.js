
import pool from './src/config/db.js';

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: node make_admin.js <email>');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        await pool.query('UPDATE users SET role = ?, approved = ? WHERE email = ?', ['admin', true, email]);
        
        console.log(`Success! User ${email} is now an ADMIN and APPROVED.`);
    } catch (error) {
        console.error('Error promoting user:', error);
    } finally {
        await pool.end();
        process.exit();
    }
};

promoteUser();

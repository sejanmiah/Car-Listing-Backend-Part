// setAdmin.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const email = 'vivecodewithwithsejan@gmail.com';

async function setAdmin() {
  const pool = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_listing_db',
  });

  const [result] = await pool.execute(
    "UPDATE users SET role = 'admin' WHERE email = ?",
    [email]
  );
  console.log('Rows affected:', result.affectedRows);
  const [rows] = await pool.execute('SELECT email, role FROM users WHERE email = ?', [email]);
  console.log('Updated user:', rows[0]);
  await pool.end();
}

setAdmin().catch(err => {
  console.error('Error:', err);
});

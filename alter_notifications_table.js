import pool from './src/config/db.js';

const alterNotificationsTable = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database...');

    // Add related_id column if it doesn't exist
    try {
        await connection.query(`ALTER TABLE notifications ADD COLUMN related_id INT DEFAULT NULL AFTER type`);
        console.log('Added related_id column successfully.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('related_id column already exists.');
        } else {
            throw e;
        }
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error altering notifications table:', error);
    process.exit(1);
  }
};

alterNotificationsTable();

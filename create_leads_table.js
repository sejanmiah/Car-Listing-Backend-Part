import pool from './src/config/db.js';

const createLeadsTable = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        car_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        -- FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE -- Optional: verify if cars table exists and constraint is desired
      )
    `);

    console.log('Leads table created/verified successfully.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error creating leads table:', error);
    process.exit(1);
  }
};

createLeadsTable();

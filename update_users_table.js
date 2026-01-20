
import pool from './src/config/db.js';

async function migrate() {
    try {
        const columnsToAdd = [
            'secondary_phone VARCHAR(20)',
            'country VARCHAR(100)',
            'city VARCHAR(100)',
            'address TEXT',
            'emergency_contact_name VARCHAR(255)',
            'emergency_contact_phone VARCHAR(20)',
            'company_name VARCHAR(255)'
        ];

        for (const col of columnsToAdd) {
            try {
                // Try to add each column. If it exists, it will fail, which is fine.
                // Or better, check if exists via INFORMATION_SCHEMA, but just ALTER IGNORE (not supported in mysql 8 properly) or catch error
                await pool.query(`ALTER TABLE users ADD COLUMN ${col}`);
                console.log(`Added column: ${col.split(' ')[0]}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${col.split(' ')[0]}`);
                } else {
                    console.error(`Error adding column ${col}:`, error);
                }
            }
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

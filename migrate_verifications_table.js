import pool from './src/config/db.js';

const migrateVerificationsTable = async () => {
    try {
        console.log("Migrating email_verifications table...");
        
        // Add phone column
        try {
            await pool.query(`ALTER TABLE email_verifications ADD COLUMN phone VARCHAR(20)`);
            console.log("✅ Added 'phone' column.");
        } catch (e) {
            if (!e.message.includes("Duplicate column")) console.error(e.message);
        }

        // Make email nullable
        try {
            await pool.query(`ALTER TABLE email_verifications MODIFY COLUMN email VARCHAR(255) NULL`);
            console.log("✅ Modified 'email' to be nullable.");
        } catch (e) {
            console.error(e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error migrating table:", error);
        process.exit(1);
    }
};

migrateVerificationsTable();

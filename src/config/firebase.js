import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const serviceAccount = JSON.parse(
        readFileSync(join(__dirname, '../../serviceAccountKey.json'), 'utf8')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'car-listing-7021a.firebasestorage.app'
    });
    
    console.log("✅ Firebase Admin initialized with Service Account");
} catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
}

export default admin;

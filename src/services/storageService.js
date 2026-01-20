import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload to local filesystem instead of Firebase Storage
export const uploadToStorage = async (fileBuffer, originalName) => {
    try {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileExtension = path.extname(originalName);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Write file to disk
        writeFileSync(filePath, fileBuffer);

        // Return URL path (will be served by Express static middleware)
        const publicUrl = `/uploads/${uniqueFilename}`;
        
        console.log(`✅ Image saved locally: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('Error saving image locally:', error);
        throw new Error('Failed to save image');
    }
};

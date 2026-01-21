import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your service account key file
const KEYFILEPATH = path.join(__dirname, '../../serviceAccountKey.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// The Folder ID - make sure this folder is shared with the service account
const FOLDER_ID = '12oNBAExgAKouTpL5hSYQGFi4O2wu2bpm';

export const uploadToStorage = async (fileBuffer, originalName, mimeType) => {
    try {
        const stream = Readable.from(fileBuffer);

        const response = await drive.files.create({
            requestBody: {
                name: originalName,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: mimeType || 'application/octet-stream',
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;
        console.log(`✅ File uploaded to Drive. ID: ${fileId}`);

        // Make the file public so it can be viewed in the app
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Return a direct link that can be used in <img> tags
        return `https://drive.google.com/uc?export=view&id=${fileId}`;

    } catch (error) {
        console.error('❌ Error uploading to Google Drive:', error.message);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('Google Drive Error Details:', JSON.stringify(error.response.data, null, 2));
            console.error('Status Code:', error.response.status);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        
        // Provide helpful error message
        if (error.code === 403 && error.message.includes('storage')) {
            console.error('\n⚠️  The Google Drive folder needs to be shared with the service account.');
            console.error('Service account email: firebase-adminsdk-fbsvc@car-listing-7021a.iam.gserviceaccount.com');
            console.error('Please share folder ID:', FOLDER_ID);
        }
        
        throw new Error(`Failed to upload image to Drive: ${error.message}`);
    }
};


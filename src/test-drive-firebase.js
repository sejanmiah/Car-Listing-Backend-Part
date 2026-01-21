import admin from './config/firebase.js'; // This initializes admin
import { google } from 'googleapis';
import { Readable } from 'stream';

const FOLDER_ID = '12oNBAExgAKouTpL5hSYQGFi4O2wu2bpm';

async function testUpload() {
    console.log('START_TEST_FIREBASE_JWT');
    
    try {
        // Reuse the credential from Firebase Admin (which is working)
        // This gets us a valid Access Token for Google APIs
        const tokenResponse = await admin.app().options.credential.getAccessToken();
        const accessToken = tokenResponse.access_token;

        console.log('Got Access Token via Firebase Admin!');
        // console.log('Token:', accessToken.substring(0, 20) + '...');

        // Create a dummy OAuth2 client to carry the token
        const authClient = new google.auth.OAuth2();
        authClient.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: authClient });
        
        console.log('Attempting upload...');
        const stream = Readable.from(['Hello World. Test file via Firebase.']);
        const response = await drive.files.create({
            requestBody: {
                name: 'test-upload-firebase.txt',
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: 'text/plain',
                body: stream,
            },
            fields: 'id',
        });

        console.log('SUCCESS_UPLOAD');
        console.log('ID:', response.data.id);

    } catch (error) {
        console.log('ERROR_UPLOAD');
        console.log('Message:', error.message);
        if (error.response && error.response.data) {
            console.log('Response Error Description:', JSON.stringify(error.response.data));
        }
    }
}

testUpload();

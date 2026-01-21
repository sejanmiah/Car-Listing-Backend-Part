import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Readable } from 'stream';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYFILEPATH = path.join(__dirname, '../serviceAccountKey.json');
const FOLDER_ID = '12oNBAExgAKouTpL5hSYQGFi4O2wu2bpm';

async function testUpload() {
    console.log('START_TEST_MANUAL_JWT');
    
    try {
        const keyFileContent = fs.readFileSync(KEYFILEPATH, 'utf8');
        const keyData = JSON.parse(keyFileContent);
        
        let privateKey = keyData.private_key;
        if (privateKey.indexOf('\n') === -1 && privateKey.indexOf('\\n') !== -1) {
            console.log('⚠️ Detected literal \\n characters. Fixing key format...');
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        console.log('Key Email:', keyData.client_email);
        console.log('Key Private Key Length:', privateKey.length);

        const jwtClient = new google.auth.JWT({
            email: keyData.client_email,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        console.log('Attempting to authorize...');
        await jwtClient.authorize();
        console.log('Auth Successful!');

        const drive = google.drive({ version: 'v3', auth: jwtClient });
        
        console.log('Attempting upload...');
        const stream = Readable.from(['Hello World. Test file.']);
        const response = await drive.files.create({
            requestBody: {
                name: 'test-upload-manual.txt',
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

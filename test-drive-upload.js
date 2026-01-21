import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYFILEPATH = path.join(__dirname, 'serviceAccountKey.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = '12oNBAExgAKouTpL5hSYQGFi4O2wu2bpm';

async function testDriveUpload() {
    try {
        console.log('🔍 Testing Google Drive authentication...');
        console.log('📁 Key file path:', KEYFILEPATH);
        
        // Initialize Google Auth
        const auth = new google.auth.GoogleAuth({
            keyFile: KEYFILEPATH,
            scopes: SCOPES,
        });

        console.log('✅ Auth object created');

        const drive = google.drive({ version: 'v3', auth });
        console.log('✅ Drive client created');

        // Test: Create a simple text file
        const testContent = 'This is a test file from the car listing app';
        const stream = Readable.from(Buffer.from(testContent));

        console.log('📤 Uploading test file...');
        
        const response = await drive.files.create({
            requestBody: {
                name: `test-${Date.now()}.txt`,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: 'text/plain',
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;
        console.log(`✅ File uploaded successfully! ID: ${fileId}`);

        // Make the file public
        console.log('🔓 Making file public...');
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log('✅ File is now public');
        console.log('🔗 File URL:', `https://lh3.googleusercontent.com/d/${fileId}`);
        console.log('🔗 Web View Link:', response.data.webViewLink);

        console.log('\n✅ All tests passed! Google Drive integration is working.');

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
            console.error('Status Code:', error.response.status);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
    }
}

testDriveUpload();

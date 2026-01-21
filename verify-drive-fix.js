import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYFILEPATH = path.join(__dirname, 'serviceAccountKey.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The shared folder ID
const FOLDER_ID = '12oNBAExgAKouTpL5hSYQGFi4O2wu2bpm';

async function testDriveFix() {
    try {
        console.log('🔍 Testing Google Drive Permissions...');
        
        const auth = new google.auth.GoogleAuth({
            keyFile: KEYFILEPATH,
            scopes: SCOPES,
        });

        const drive = google.drive({ version: 'v3', auth });
        
        // 1. Check if we can list the folder (verifies read access)
        console.log('📂 Checking access to folder:', FOLDER_ID);
        try {
            const folder = await drive.files.get({
                fileId: FOLDER_ID,
                fields: 'name, capabilities, webViewLink'
            });
            console.log('✅ Folder found:', folder.data.name);
            console.log('   Can edit:', folder.data.capabilities.canEdit);
            console.log('   Can add children:', folder.data.capabilities.canAddChildren);
            
            if (!folder.data.capabilities.canAddChildren) {
                console.error('❌ Error: Service account cannot add files to this folder. Please make it an "Editor".');
                return;
            }
        } catch (e) {
            console.error('❌ Failed to access folder. Is it shared with the service account?');
            console.error('   Email:', 'firebase-adminsdk-fbsvc@car-listing-7021a.iam.gserviceaccount.com');
            console.error(e.message);
            return;
        }

        // 2. Try to verify upload
        console.log('📤 Attempting verification upload...');
        const testContent = 'Verification file - permission check passed!';
        const stream = Readable.from(Buffer.from(testContent));

        const response = await drive.files.create({
            requestBody: {
                name: `verify-permissions-${Date.now()}.txt`,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: 'text/plain',
                body: stream,
            },
            fields: 'id, webViewLink',
        });

        console.log('✅ Upload Successful!');
        console.log('   File ID:', response.data.id);
        console.log('   Link:', response.data.webViewLink);

        // 3. Make public (standard flow)
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        console.log('✅ Permissions updated to Public');
        console.log('\n🎉 SUCCESS! The Google Drive integration works correctly now.');

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        if (error.response) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDriveFix();

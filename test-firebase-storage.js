import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYFILEPATH = path.join(__dirname, 'serviceAccountKey.json');

async function testFirebaseStorage() {
    try {
        console.log('🔍 Testing Firebase Storage...');
        console.log('📁 Key file path:', KEYFILEPATH);
        
        // Initialize Firebase Admin
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(KEYFILEPATH),
                storageBucket: 'car-listing-7021a.appspot.com'
            });
        }

        console.log('✅ Firebase Admin initialized');

        const bucket = admin.storage().bucket();
        console.log('✅ Storage bucket:', bucket.name);
        console.log('📍 Bucket exists:', await bucket.exists());

        // Test: Create a simple text file
        const testContent = Buffer.from('This is a test file from the car listing app');
        const fileName = `test/test-${Date.now()}.txt`;
        
        const file = bucket.file(fileName);

        console.log('📤 Uploading test file...');
        
        // Use a simpler upload method
        await file.save(testContent, {
            metadata: {
                contentType: 'text/plain',
            },
            resumable: false, // Disable resumable upload for small files
        });

        // Make it public
        await file.makePublic();

        console.log(`✅ File uploaded successfully: ${fileName}`);

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log('🔗 Public URL:', publicUrl);

        console.log('\n✅ All tests passed! Firebase Storage integration is working.');

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error('Error stack:', error.stack);
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        
        if (error.message.includes('does not have storage.buckets.get')) {
            console.error('\n⚠️  Firebase Storage is not enabled for this project.');
            console.error('Please enable Firebase Storage in the Firebase Console:');
            console.error('https://console.firebase.google.com/project/car-listing-7021a/storage');
        }
    }
}

testFirebaseStorage();

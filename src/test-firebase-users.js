import admin from './config/firebase.js';

async function testFirebase() {
    console.log('START_TEST_FIREBASE_USERS');
    try {
        const listUsersResult = await admin.auth().listUsers(1);
        console.log('SUCCESS_FIREBASE_USERS');
        console.log('User count:', listUsersResult.users.length);
    } catch (error) {
        console.log('ERROR_FIREBASE_USERS');
        console.log('Message:', error.message);
        if (error.code) {
             console.log('Code:', error.code);
        }
    }
}

testFirebase();

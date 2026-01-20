
import http from 'http';

const url = 'http://localhost:5000/uploads/6d8576f6-e7a9-42f2-8715-b502e8d6f1c1.jpg';

http.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    if (res.statusCode === 200) {
        console.log('Image is accessible');
    } else {
        console.log('Failed to access image');
    }
}).on('error', (e) => {
    console.error(e);
});

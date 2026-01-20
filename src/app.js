import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads')); // Serve uploaded images

app.use('/api/auth', authRoutes);
import { sendVerificationCode, verifyEmailCode } from './controllers/verificationController.js';
app.post('/api/auth/send-code', sendVerificationCode);
app.post('/api/auth/verify-code', verifyEmailCode);

app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Car Listing API is running');
});

export default app;

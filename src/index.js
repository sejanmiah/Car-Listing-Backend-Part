import './timeFix.js'; // Fix "Future Token" error MUST BE FIRST
import app from './app.js';
import dotenv from 'dotenv';
import { createUserTable } from './models/userModel.js';
import { createCarTable } from './models/carModel.js';
import leadRoutes from './routes/leadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use('/api/leads', leadRoutes);
app.use('/api/notifications', notificationRoutes);

const startServer = async () => {
    try {
        await createUserTable();
        await createCarTable();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`[Server] Active Time: ${new Date().toISOString()}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
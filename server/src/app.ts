import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import referenceRoutes from './routes/reference.routes';
import ticketRoutes from './routes/ticket.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import staffRoutes from './routes/staff.routes';

dotenv.config();

export const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', referenceRoutes);
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', staffRoutes);
app.use('/api', ticketRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

export default app;

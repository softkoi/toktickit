import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import referenceRoutes from './routes/reference.routes';
import ticketRoutes from './routes/ticket.routes';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', referenceRoutes);
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

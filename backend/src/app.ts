import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN, // allow requests from this origin
    credentials: true, // allow cookies to be sent with requests
  }),
);

// health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes imports
import authRoutes from './modules/auth/auth.route';

// Rotutes
app.use('/api/v1/auth', authRoutes);

export default app;

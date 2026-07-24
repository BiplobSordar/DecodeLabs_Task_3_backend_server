import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit';

// Import using index.js (clean import)
import { authRoutes } from './modules/auth/index.js';
import userRoutes from './modules/users/user.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import teamRoutes from './modules/teams/team.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';


import { errorResponse } from './utils/response.js';
import { authConfig } from './config/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cookieParser()); //  Required for reading cookies
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, //  Allow credentials (cookies)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: authConfig.rateLimit.windowMs,
  max: authConfig.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);app.get("/cpu-test", (req, res) => {
    const end = Date.now() + 10000;

    while (Date.now() < end) {
        Math.random();
    }

    res.send("done");
});


// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// app.use((req, res, next) => {
//   console.log(req.ip, req.method, req.originalUrl);
//   next();
// });
// Routes - Using authRoutes from index.js
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});


// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  errorResponse(
    res,
    err.message || 'Internal server error',
    err.status || 500
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
});

export default app;

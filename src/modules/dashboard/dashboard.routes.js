import express from 'express';
import DashboardController from './dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { hasPermission } from '../middlewares/permission.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard endpoints
router.get(
  '/stats',
  DashboardController.getStats
);

router.get(
  '/recent-tasks',
  DashboardController.getRecentTasks
);

router.get(
  '/recent-activity',
  DashboardController.getRecentActivity
);

// User-specific stats (for profile)
router.get(
  '/user-stats',
  DashboardController.getUserStats
);

// Team performance (for managers/admins)
router.get(
  '/team-performance',
  hasPermission('view_reports'),
  DashboardController.getTeamPerformance
);

export default router;
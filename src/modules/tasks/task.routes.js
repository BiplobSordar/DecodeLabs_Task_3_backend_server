import express from 'express';
import TaskController from './task.controller.js';
import { 
 validateCreateTask, 
  validateUpdateTask, 
  validateTaskId,
  validateTaskStatus,
  validateTaskAssignment,
  validateTaskFilters
} from './task.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { hasPermission } from '../middlewares/permission.middleware.js';







const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  validateTaskFilters,
  hasPermission('view_tasks'),
  TaskController.getAllTasks
);

router.get(
  '/stats',
  hasPermission('view_reports'),
  TaskController.getTaskStats
);

router.get(
  '/team-distribution',
  hasPermission('view_reports'),
  TaskController.getTeamTaskDistribution
);

router.get(
  '/team/:teamId',
  validateTaskId,
  hasPermission('view_tasks'),
  TaskController.getTasksByTeam
);

router.get(
  '/user/:userId',
  validateTaskId,
  hasPermission('view_tasks'),
  TaskController.getTasksByUser
);

router.get(
  '/my-tasks',
  TaskController.getTasksByUser
);

router.get(
  '/:id',
  validateTaskId,
  hasPermission('view_tasks'),
  TaskController.getTaskById
);

router.post(
  '/',
  validateCreateTask,
  hasPermission('create_task'),
  TaskController.createTask
);

router.put(
  '/:id',
  validateTaskId,
  validateUpdateTask,
  hasPermission('update_task'),
  TaskController.updateTask
);

router.patch(
  '/:id/status',
  validateTaskId,
  validateTaskStatus,
  hasPermission('update_task'),
  TaskController.updateTaskStatus
);

router.patch(
  '/:id/assign',
  validateTaskId,
  validateTaskAssignment,
  hasPermission('assign_task'),
  TaskController.assignTask
);

router.delete(
  '/:id',
  validateTaskId,
  hasPermission('delete_task'),
  TaskController.deleteTask
);

export default router;
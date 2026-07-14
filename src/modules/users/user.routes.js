import express from 'express';
import UserController from './user.controller.js';
import { 
  validateCreateUser, 
  validateUpdateUser, 
  validateUserId 
} from './user.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { hasPermission } from '../middlewares/permission.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User management routes
router.get(
  '/',
  hasPermission('view_users'),
  UserController.getAllUsers
);

router.get(
  '/stats',
  hasPermission('view_reports'),
  UserController.getUserStats
);

router.get(
  '/roles',
  hasPermission('view_users'),
  UserController.getAllRoles
);

router.get(
  '/:id',
  validateUserId,
  hasPermission('view_users'),
  UserController.getUserById
);

router.post(
  '/',
  validateCreateUser,
  hasPermission('create_user'),
  UserController.createUser
);

router.put(
  '/:id',
  validateUserId,
  validateUpdateUser,
  hasPermission('update_user'),
  UserController.updateUser
);

router.delete(
  '/:id',
  validateUserId,
  hasPermission('delete_user'),
  UserController.deleteUser
);

router.patch(
  '/:id/status',
  validateUserId,
  hasPermission('update_user'),
  UserController.updateUserStatus
);

router.patch(
  '/:id/role',
  validateUserId,
  hasPermission('manage_roles'),
  UserController.assignRole
);

router.post(
  '/bulk/role',
  hasPermission('manage_roles'),
  UserController.bulkAssignRole
);

export default router;
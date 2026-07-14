import express from 'express';
import TeamController from './team.controller.js';
import { 
  validateCreateTeam, 
  validateUpdateTeam, 
  validateTeamId,
  validateAddMember
} from './team.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { hasPermission } from '../middlewares/permission.middleware.js';

const router = express.Router();

// All team routes require authentication
router.use(authenticate);

// Team management routes
router.get(
  '/',
  hasPermission('view_teams'),
  TeamController.getAllTeams
);

router.get(
  '/stats',
  hasPermission('view_reports'),
  TeamController.getTeamStats
);

router.get(
  '/user/:userId',
  hasPermission('view_teams'),
  TeamController.getTeamsForUser
);

router.get(
  '/my-teams',
  TeamController.getTeamsForUser
);

router.get(
  '/:id',
  validateTeamId,
  hasPermission('view_teams'),
  TeamController.getTeamById
);

router.get(
  '/:id/members',
  validateTeamId,
  hasPermission('view_teams'),
  TeamController.getTeamMembers
);

router.post(
  '/',
  validateCreateTeam,
  hasPermission('create_team'),
  TeamController.createTeam
);

router.put(
  '/:id',
  validateTeamId,
  validateUpdateTeam,
  hasPermission('update_team'),
  TeamController.updateTeam
);

router.delete(
  '/:id',
  validateTeamId,
  hasPermission('delete_team'),
  TeamController.deleteTeam
);

// Member management
router.post(
  '/:id/members',
  validateTeamId,
  validateAddMember,
  hasPermission('update_team'),
  TeamController.addMember
);

router.post(
  '/:id/members/bulk',
  validateTeamId,
  hasPermission('update_team'),
  TeamController.bulkAddMembers
);

router.delete(
  '/:id/members/:userId',
  validateTeamId,
  hasPermission('update_team'),
  TeamController.removeMember
);

export default router;
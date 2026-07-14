import TeamService from './team.service.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';
import { MESSAGES } from '../../constants/messages.js';

class TeamController {
  // Get all teams with pagination
  async getAllTeams(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await TeamService.getAllTeams(page, limit, search);

      return paginateResponse(
        res,
        result.teams,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        MESSAGES.TEAM.FETCHED
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // Get team by ID
  async getTeamById(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const team = await TeamService.getTeamById(teamId);

      return successResponse(res, team, MESSAGES.TEAM.FETCHED);
    } catch (error) {
      if (error.message === MESSAGES.TEAM.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // Get team members
  async getTeamMembers(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const members = await TeamService.getTeamMembers(teamId);

      return successResponse(res, members, 'Team members fetched successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // Get teams for a user
  async getTeamsForUser(req, res) {
    try {
      const userId = parseInt(req.params.userId) || req.user.userId;
      const teams = await TeamService.getTeamsForUser(userId);

      return successResponse(res, teams, 'User teams fetched successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // Create new team
  async createTeam(req, res) {
    try {
      const teamData = req.body;
      const team = await TeamService.createTeam(teamData);

      return successResponse(res, team, MESSAGES.TEAM.CREATED, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Update team
  async updateTeam(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const updateData = req.body;
      
      const team = await TeamService.updateTeam(teamId, updateData);

      return successResponse(res, team, MESSAGES.TEAM.UPDATED);
    } catch (error) {
      if (error.message === MESSAGES.TEAM.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  // Delete team
  async deleteTeam(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const hardDelete = req.query.permanent === 'true';
      
      const result = await TeamService.deleteTeam(teamId, hardDelete);

      return successResponse(
        res,
        result,
        hardDelete ? 'Team permanently deleted' : MESSAGES.TEAM.DELETED
      );
    } catch (error) {
      if (error.message === MESSAGES.TEAM.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // Add member to team
  async addMember(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const { user_id } = req.body;

      if (!user_id) {
        return errorResponse(res, 'User ID is required', 400);
      }

      const members = await TeamService.addMember(teamId, parseInt(user_id));

      return successResponse(res, members, MESSAGES.TEAM.USER_ADDED);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Remove member from team
  async removeMember(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      const members = await TeamService.removeMember(teamId, userId);

      return successResponse(res, members, MESSAGES.TEAM.USER_REMOVED);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Bulk add members
  async bulkAddMembers(req, res) {
    try {
      const teamId = parseInt(req.params.id);
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return errorResponse(res, 'User IDs are required', 400);
      }

      const results = await TeamService.bulkAddMembers(teamId, user_ids);

      return successResponse(res, results, 'Bulk member addition completed');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Get team statistics
  async getTeamStats(req, res) {
    try {
      const stats = await TeamService.getTeamStats();

      return successResponse(res, stats, 'Team statistics fetched successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default new TeamController();
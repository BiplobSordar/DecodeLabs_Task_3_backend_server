import UserService from './user.service.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';
import { MESSAGES } from '../../constants/messages.js';

class UserController {
  // Get all users with pagination
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await UserService.getAllUsers(page, limit, search);

      return paginateResponse(
        res,
        result.users,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        MESSAGES.USER.FETCHED
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        500,
        error.message
      );
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserService.getUserById(userId);

      return successResponse(
        res,
        user,
        MESSAGES.USER.FETCHED
      );
    } catch (error) {
      if (error.message === MESSAGES.USER.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const userData = req.body;
      const user = await UserService.createUser(userData);

      return successResponse(
        res,
        user,
        MESSAGES.USER.CREATED,
        201
      );
    } catch (error) {
      if (error.message === MESSAGES.AUTH.USER_ALREADY_EXISTS) {
        return errorResponse(res, error.message, 409);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const user = await UserService.updateUser(userId, updateData);

      return successResponse(
        res,
        user,
        MESSAGES.USER.UPDATED
      );
    } catch (error) {
      if (error.message === MESSAGES.USER.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  // Delete user (soft delete)
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const hardDelete = req.query.permanent === 'true';
      
      const result = await UserService.deleteUser(userId, hardDelete);

      return successResponse(
        res,
        result,
        hardDelete ? 'User permanently deleted' : MESSAGES.USER.DELETED
      );
    } catch (error) {
      if (error.message === MESSAGES.USER.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // Get all roles
  async getAllRoles(req, res) {
    try {
      const roles = await UserService.getAllRoles();

      return successResponse(
        res,
        roles,
        'Roles fetched successfully'
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  // Assign role to user
  async assignRole(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { role_id } = req.body;
      const assignedBy = req.user.userId;

      if (!role_id) {
        return errorResponse(res, 'Role ID is required', 400);
      }

      const user = await UserService.assignRole(userId, role_id, assignedBy);

      return successResponse(
        res,
        user,
        'Role assigned successfully'
      );
    } catch (error) {
      if (error.message === MESSAGES.USER.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  // Bulk assign roles
  async bulkAssignRole(req, res) {
    try {
      const { user_ids, role_id } = req.body;
      const assignedBy = req.user.userId;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return errorResponse(res, 'User IDs are required', 400);
      }

      if (!role_id) {
        return errorResponse(res, 'Role ID is required', 400);
      }

      const results = await UserService.bulkAssignRole(user_ids, role_id, assignedBy);

      return successResponse(
        res,
        results,
        'Bulk role assignment completed'
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Update user status
  async updateUserStatus(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { is_active } = req.body;

      if (is_active === undefined) {
        return errorResponse(res, 'is_active is required', 400);
      }

      const user = await UserService.updateUserStatus(userId, is_active);

      return successResponse(
        res,
        user,
        `User ${is_active ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      if (error.message === MESSAGES.USER.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      return successResponse(
        res,
        stats,
        'User statistics fetched successfully'
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default new UserController();
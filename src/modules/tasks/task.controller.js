import TaskService from './task.service.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';
import { MESSAGES } from '../../constants/messages.js';



class TaskController {
  async getAllTasks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = {
        search: req.query.search || '',
        status: req.query.status || '',
        priority: req.query.priority || '',
        team_id: req.query.team_id ? parseInt(req.query.team_id) : null,
        assigned_to: req.query.assigned_to ? parseInt(req.query.assigned_to) : null,
        due_date_from: req.query.due_date_from || '',
        due_date_to: req.query.due_date_to || ''
      };

      const result = await TaskService.getAllTasks(page, limit, filters);

      return paginateResponse(
        res,
        result.tasks,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        MESSAGES.TASK.FETCHED
      );
    } catch (error) {
      console.error('Get all tasks error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTasksByTeam(req, res) {
    try {
      const teamId = parseInt(req.params.teamId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await TaskService.getTasksByTeam(teamId, page, limit);

      return paginateResponse(
        res,
        result.tasks,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        MESSAGES.TASK.FETCHED
      );
    } catch (error) {
      console.error('Get tasks by team error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTasksByUser(req, res) {
    try {
      let userId;
      if (req.params.userId) {
        userId = parseInt(req.params.userId);
      } else {
        userId = req.user.userId;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await TaskService.getTasksByUser(userId, page, limit);

      return paginateResponse(
        res,
        result.tasks,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        MESSAGES.TASK.FETCHED
      );
    } catch (error) {
      console.error('Get tasks by user error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTaskById(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const task = await TaskService.getTaskById(taskId);

      return successResponse(res, task, MESSAGES.TASK.FETCHED);
    } catch (error) {
      if (error.message === MESSAGES.TASK.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      console.error('Get task by ID error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async createTask(req, res) {
    try {
      const taskData = {
        ...req.body,
        created_by: req.user.userId
      };
      
      const task = await TaskService.createTask(taskData);

      return successResponse(res, task, MESSAGES.TASK.CREATED, 201);
    } catch (error) {
      console.error('Create task error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async updateTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = req.body;
      
      const task = await TaskService.updateTask(taskId, updateData);

      return successResponse(res, task, MESSAGES.TASK.UPDATED);
    } catch (error) {
      if (error.message === MESSAGES.TASK.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      console.error('Update task error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async updateTaskStatus(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const task = await TaskService.updateTaskStatus(taskId, status);

      return successResponse(res, task, 'Task status updated successfully');
    } catch (error) {
      if (error.message === MESSAGES.TASK.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      console.error('Update task status error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async assignTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { user_id } = req.body;

      if (!user_id) {
        return errorResponse(res, 'User ID is required', 400);
      }

      const task = await TaskService.assignTask(taskId, parseInt(user_id));

      return successResponse(res, task, MESSAGES.TASK.ASSIGNED);
    } catch (error) {
      if (error.message === MESSAGES.TASK.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      console.error('Assign task error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const hardDelete = req.query.permanent === 'true';
      
      const result = await TaskService.deleteTask(taskId, hardDelete);

      return successResponse(
        res,
        result,
        hardDelete ? 'Task permanently deleted' : MESSAGES.TASK.DELETED
      );
    } catch (error) {
      if (error.message === MESSAGES.TASK.NOT_FOUND) {
        return errorResponse(res, error.message, 404);
      }
      console.error('Delete task error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTaskStats(req, res) {
    try {
      const teamId = req.query.team_id ? parseInt(req.query.team_id) : null;
      const stats = await TaskService.getTaskStats(teamId);

      return successResponse(res, stats, 'Task statistics fetched successfully');
    } catch (error) {
      console.error('Get task stats error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTeamTaskDistribution(req, res) {
    try {
      const distribution = await TaskService.getTeamTaskDistribution();

      return successResponse(res, distribution, 'Team task distribution fetched successfully');
    } catch (error) {
      console.error('Get team task distribution error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default new TaskController();
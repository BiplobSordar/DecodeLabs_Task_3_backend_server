import DashboardService from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class DashboardController {
  // Get dashboard statistics
  async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await DashboardService.getStats(userId);
      
      return successResponse(
        res,
        stats,
        'Dashboard stats fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return errorResponse(
        res,
        'Failed to fetch dashboard stats',
        500,
        error.message
      );
    }
  }

  // Get recent tasks
  async getRecentTasks(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 5;
      const tasks = await DashboardService.getRecentTasks(userId, limit);
      
      return successResponse(
        res,
        tasks,
        'Recent tasks fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
      return errorResponse(
        res,
        'Failed to fetch recent tasks',
        500,
        error.message
      );
    }
  }

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 5;
      const activity = await DashboardService.getRecentActivity(userId, limit);
      
      return successResponse(
        res,
        activity,
        'Recent activity fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return errorResponse(
        res,
        'Failed to fetch recent activity',
        500,
        error.message
      );
    }
  }

  // Get user-specific stats
  async getUserStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await DashboardService.getUserStats(userId);
      
      return successResponse(
        res,
        stats,
        'User stats fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return errorResponse(
        res,
        'Failed to fetch user stats',
        500,
        error.message
      );
    }
  }

  // Get team performance
  async getTeamPerformance(req, res) {
    try {
      const userId = req.user.userId;
      const performance = await DashboardService.getTeamPerformance(userId);
      
      return successResponse(
        res,
        performance,
        'Team performance fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return errorResponse(
        res,
        'Failed to fetch team performance',
        500,
        error.message
      );
    }
  }
}

export default new DashboardController();
import pool from '../../config/db.js';
import { errorResponse } from '../../utils/response.js';
import { MESSAGES } from '../../constants/messages.js';

export const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return errorResponse(res, MESSAGES.AUTH.UNAUTHORIZED, 401);
      }

      const query = `
        SELECT EXISTS (
          SELECT 1
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = $1
          AND r.permissions @> $2::jsonb
        ) AS has_permission
      `;

      const result = await pool.query(query, [userId, JSON.stringify([permission])]);
      
      if (!result.rows[0].has_permission) {
        return errorResponse(res, MESSAGES.AUTH.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      return errorResponse(
        res,
        'Error checking permissions',
        500,
        error.message
      );
    }
  };
};

export const hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return errorResponse(res, MESSAGES.AUTH.UNAUTHORIZED, 401);
      }

      const query = `
        SELECT EXISTS (
          SELECT 1
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = $1
          AND (
            ${permissions.map((_, i) => `r.permissions @> $${i + 2}::jsonb`).join(' OR ')}
          )
        ) AS has_permission
      `;

      const params = [userId, ...permissions.map(p => JSON.stringify([p]))];
      const result = await pool.query(query, params);
      
      if (!result.rows[0].has_permission) {
        return errorResponse(res, MESSAGES.AUTH.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      return errorResponse(
        res,
        'Error checking permissions',
        500,
        error.message
      );
    }
  };
};
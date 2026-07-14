import pool from '../../config/db.js';
import { hashPassword } from '../../utils/bcrypt.js';
import { MESSAGES } from '../../constants/messages.js';

class UserService {
  // Get all users with pagination
  async getAllUsers(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    // Get users with their roles and teams
    const query = `
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name,
        u.is_active, u.last_login, u.created_at,
        r.id as role_id, r.name as role_name, r.permissions,
        ARRAY_AGG(DISTINCT t.name) as teams,
        ARRAY_AGG(DISTINCT t.id) as team_ids
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN team_users tu ON u.id = tu.user_id
      LEFT JOIN teams t ON tu.team_id = t.id
      WHERE 
        u.username ILIKE $3 OR 
        u.email ILIKE $3 OR 
        u.first_name ILIKE $3 OR 
        u.last_name ILIKE $3
      GROUP BY u.id, r.id, r.name, r.permissions
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    // Count total users
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE 
        u.username ILIKE $1 OR 
        u.email ILIKE $1 OR 
        u.first_name ILIKE $1 OR 
        u.last_name ILIKE $1
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset, searchPattern]),
      pool.query(countQuery, [searchPattern])
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Get user by ID with full details
  async getUserById(userId) {
    const query = `
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name,
        u.is_active, u.last_login, u.created_at, u.updated_at,
        r.id as role_id, r.name as role_name, r.permissions,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'team_lead_id', t.team_lead_id,
            'is_active', t.is_active
          )) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as teams
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN team_users tu ON u.id = tu.user_id
      LEFT JOIN teams t ON tu.team_id = t.id
      WHERE u.id = $1
      GROUP BY u.id, r.id, r.name, r.permissions
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    return result.rows[0];
  }

  // Get user by email or username
  async getUserByEmailOrUsername(identifier) {
    const query = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = $1 OR u.username = $1
    `;

    const result = await pool.query(query, [identifier]);
    return result.rows[0] || null;
  }

  // Create new user
  async createUser(userData) {
    const { 
      username, 
      email, 
      password, 
      first_name, 
      last_name, 
      role_id,
      is_active = true 
    } = userData;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error(MESSAGES.AUTH.USER_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create user
      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, first_name, last_name, is_active, created_at`,
        [username, email, hashedPassword, first_name, last_name, is_active]
      );

      const user = result.rows[0];

      // Assign role if provided
      if (role_id) {
        await client.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [user.id, role_id]
        );
      }

      await client.query('COMMIT');

      // Get user with role
      return await this.getUserById(user.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    const { 
      username, 
      email, 
      first_name, 
      last_name, 
      is_active,
      role_id 
    } = updateData;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update user
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (username !== undefined) {
        updateFields.push(`username = $${paramCount}`);
        values.push(username);
        paramCount++;
      }
      if (email !== undefined) {
        updateFields.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
      }
      if (first_name !== undefined) {
        updateFields.push(`first_name = $${paramCount}`);
        values.push(first_name);
        paramCount++;
      }
      if (last_name !== undefined) {
        updateFields.push(`last_name = $${paramCount}`);
        values.push(last_name);
        paramCount++;
      }
      if (is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount}`);
        values.push(is_active);
        paramCount++;
      }

      // Always update updated_at
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length > 0) {
        values.push(userId);
        const query = `
          UPDATE users 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING id, username, email, first_name, last_name, is_active, updated_at
        `;
        await client.query(query, values);
      }

      // Update role if provided
      if (role_id !== undefined) {
        await client.query(
          'DELETE FROM user_roles WHERE user_id = $1',
          [userId]
        );
        
        if (role_id) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
            [userId, role_id]
          );
        }
      }

      await client.query('COMMIT');

      // Return updated user
      return await this.getUserById(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete user (soft delete or hard delete)
  async deleteUser(userId, hardDelete = false) {
    if (hardDelete) {
      // Hard delete - remove completely
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(MESSAGES.USER.NOT_FOUND);
      }
      
      return { deleted: true };
    } else {
      // Soft delete - deactivate
      const result = await pool.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(MESSAGES.USER.NOT_FOUND);
      }
      
      return { deactivated: true };
    }
  }

  // Get all roles (for dropdown)
  async getAllRoles() {
    const result = await pool.query(
      'SELECT id, name, description FROM roles ORDER BY name'
    );
    return result.rows;
  }

  // Assign role to user
  async assignRole(userId, roleId, assignedBy) {
    // Check if user exists
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    // Check if role exists
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [roleId]
    );
    if (roleResult.rows.length === 0) {
      throw new Error('Role not found');
    }

    // Assign role
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET 
         role_id = $2,
         assigned_by = $3,
         assigned_at = CURRENT_TIMESTAMP`,
      [userId, roleId, assignedBy]
    );

    return await this.getUserById(userId);
  }

  // Bulk assign roles to users
  async bulkAssignRole(userIds, roleId, assignedBy) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await this.assignRole(userId, roleId, assignedBy);
        results.push({ userId, success: true, user });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(userId, isActive) {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    return await this.getUserById(userId);
  }

  // Get user statistics
  async getUserStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_30_days,
        COUNT(DISTINCT r.name) as total_roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
    `);

    // Get users by role
    const roleStats = await pool.query(`
      SELECT 
        r.name as role_name,
        COUNT(ur.user_id) as user_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.id, r.name
      ORDER BY user_count DESC
    `);

    return {
      ...stats.rows[0],
      role_distribution: roleStats.rows
    };
  }
}

export default new UserService();
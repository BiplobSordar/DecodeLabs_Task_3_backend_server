import pool from '../../config/db.js';
import { MESSAGES } from '../../constants/messages.js';




class TaskService {
  // Get all tasks with pagination and filters
  async getAllTasks(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const { search, status, priority, team_id, assigned_to, due_date_from, due_date_to } = filters;

    let query = `
      SELECT 
        ta.id, ta.title, ta.description, ta.status, ta.priority,
        ta.due_date, ta.completed_at, ta.created_at, ta.updated_at,
        t.id as team_id, t.name as team_name,
        assigned.id as assigned_to_id, 
        assigned.first_name || ' ' || assigned.last_name as assigned_to_name,
        created_by.id as created_by_id,
        created_by.first_name || ' ' || created_by.last_name as created_by_name
      FROM tasks ta
      LEFT JOIN teams t ON ta.team_id = t.id
      LEFT JOIN users assigned ON ta.assigned_to = assigned.id
      LEFT JOIN users created_by ON ta.created_by = created_by.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    // Add filters with proper type casting
    if (search) {
      query += ` AND (ta.title ILIKE $${paramCount} OR ta.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND ta.status = $${paramCount}::text`;
      queryParams.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND ta.priority = $${paramCount}::text`;
      queryParams.push(priority);
      paramCount++;
    }

    if (team_id) {
      query += ` AND ta.team_id = $${paramCount}`;
      queryParams.push(parseInt(team_id));
      paramCount++;
    }

    if (assigned_to) {
      query += ` AND ta.assigned_to = $${paramCount}`;
      queryParams.push(parseInt(assigned_to));
      paramCount++;
    }

    if (due_date_from) {
      query += ` AND ta.due_date >= $${paramCount}::timestamptz`;
      queryParams.push(due_date_from);
      paramCount++;
    }

    if (due_date_to) {
      query += ` AND ta.due_date <= $${paramCount}::timestamptz`;
      queryParams.push(due_date_to);
      paramCount++;
    }

    // Count query with same filters
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tasks ta
      WHERE 1=1
    `;
    
    let countParamCount = 1;
    if (search) {
      countQuery += ` AND (ta.title ILIKE $${countParamCount} OR ta.description ILIKE $${countParamCount})`;
      countParamCount++;
    }
    if (status) {
      countQuery += ` AND ta.status = $${countParamCount}::text`;
      countParamCount++;
    }
    if (priority) {
      countQuery += ` AND ta.priority = $${countParamCount}::text`;
      countParamCount++;
    }
    if (team_id) {
      countQuery += ` AND ta.team_id = $${countParamCount}`;
      countParamCount++;
    }
    if (assigned_to) {
      countQuery += ` AND ta.assigned_to = $${countParamCount}`;
      countParamCount++;
    }
    if (due_date_from) {
      countQuery += ` AND ta.due_date >= $${countParamCount}::timestamptz`;
      countParamCount++;
    }
    if (due_date_to) {
      countQuery += ` AND ta.due_date <= $${countParamCount}::timestamptz`;
      countParamCount++;
    }

    query += ` ORDER BY ta.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const [tasksResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    return {
      tasks: tasksResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Get tasks by team
  async getTasksByTeam(teamId, page = 1, limit = 10) {
    return this.getAllTasks(page, limit, { team_id: teamId });
  }

  // Get tasks by user
  async getTasksByUser(userId, page = 1, limit = 10) {
    return this.getAllTasks(page, limit, { assigned_to: userId });
  }

  // Get task by ID
  async getTaskById(taskId) {
    const query = `
      SELECT 
        ta.id, ta.title, ta.description, ta.status, ta.priority,
        ta.due_date, ta.completed_at, ta.created_at, ta.updated_at,
        t.id as team_id, t.name as team_name,
        assigned.id as assigned_to_id, 
        assigned.first_name || ' ' || assigned.last_name as assigned_to_name,
        assigned.email as assigned_to_email,
        created_by.id as created_by_id,
        created_by.first_name || ' ' || created_by.last_name as created_by_name
      FROM tasks ta
      LEFT JOIN teams t ON ta.team_id = t.id
      LEFT JOIN users assigned ON ta.assigned_to = assigned.id
      LEFT JOIN users created_by ON ta.created_by = created_by.id
      WHERE ta.id = $1
    `;

    const result = await pool.query(query, [taskId]);

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.TASK.NOT_FOUND);
    }

    return result.rows[0];
  }

  // Create new task
  async createTask(taskData) {
    const { 
      title, 
      description, 
      team_id, 
      assigned_to, 
      created_by, 
      priority = 'medium', 
      due_date,
      status = 'pending'
    } = taskData;

    const teamId = (team_id && team_id !== '') ? parseInt(team_id) : null;
    const assignedTo = (assigned_to && assigned_to !== '') ? parseInt(assigned_to) : null;

    // Check if team exists
    if (teamId) {
      const teamCheck = await pool.query(
        'SELECT id FROM teams WHERE id = $1 AND is_active = true',
        [teamId]
      );
      if (teamCheck.rows.length === 0) {
        throw new Error('Team not found or inactive');
      }
    }

    // Check if assigned user exists and is active
    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [assignedTo]
      );
      if (userCheck.rows.length === 0) {
        throw new Error('Assigned user not found or inactive');
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, team_id, assigned_to, created_by, priority, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6::text, $7::timestamptz, $8::text)
       RETURNING id`,
      [title, description || null, teamId, assignedTo, created_by, priority, due_date || null, status]
    );

    return await this.getTaskById(result.rows[0].id);
  }

  // Update task
  async updateTask(taskId, updateData) {
    const { 
      title, 
      description, 
      team_id, 
      assigned_to, 
      priority, 
      due_date,
      status 
    } = updateData;

    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rows.length === 0) {
      throw new Error(MESSAGES.TASK.NOT_FOUND);
    }

    const teamId = (team_id && team_id !== '') ? parseInt(team_id) : null;
    const assignedTo = (assigned_to && assigned_to !== '') ? parseInt(assigned_to) : null;

    if (teamId) {
      const teamCheck = await pool.query(
        'SELECT id FROM teams WHERE id = $1 AND is_active = true',
        [teamId]
      );
      if (teamCheck.rows.length === 0) {
        throw new Error('Team not found or inactive');
      }
    }

    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [assignedTo]
      );
      if (userCheck.rows.length === 0) {
        throw new Error('Assigned user not found or inactive');
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description || null);
      paramCount++;
    }
    if (team_id !== undefined) {
      updateFields.push(`team_id = $${paramCount}`);
      values.push(teamId);
      paramCount++;
    }
    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCount}`);
      values.push(assignedTo);
      paramCount++;
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount}::text`);
      values.push(priority);
      paramCount++;
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount}::timestamptz`);
      values.push(due_date || null);
      paramCount++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}::text`);
      values.push(status);
      if (status === 'completed') {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
      } else {
        updateFields.push(`completed_at = NULL`);
      }
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length > 0) {
      values.push(taskId);
      await pool.query(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }

    return await this.getTaskById(taskId);
  }

  // Update task status - FIXED
  async updateTaskStatus(taskId, status) {
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rows.length === 0) {
      throw new Error(MESSAGES.TASK.NOT_FOUND);
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1::text, 
           completed_at = CASE WHEN $1::text = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id`,
      [status, taskId]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to update task status');
    }

    return await this.getTaskById(taskId);
  }

  // Assign task
  async assignTask(taskId, userId) {
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rows.length === 0) {
      throw new Error(MESSAGES.TASK.NOT_FOUND);
    }

    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );
    if (userCheck.rows.length === 0) {
      throw new Error('User not found or inactive');
    }

    await pool.query(
      'UPDATE tasks SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [userId, taskId]
    );

    return await this.getTaskById(taskId);
  }

  // Delete task
  async deleteTask(taskId, hardDelete = false) {
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rows.length === 0) {
      throw new Error(MESSAGES.TASK.NOT_FOUND);
    }

    if (hardDelete) {
      await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      return { deleted: true };
    } else {
      await pool.query(
        'UPDATE tasks SET status = $1::text, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', taskId]
      );
      return { cancelled: true };
    }
  }

  // Get task statistics
  async getTaskStats(teamId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_priority
      FROM tasks
    `;

    const params = [];
    if (teamId) {
      query += ` WHERE team_id = $1`;
      params.push(parseInt(teamId));
    }

    const result = await pool.query(query, params);
    return result.rows[0] || {
      total_tasks: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      low_priority: 0,
      medium_priority: 0,
      high_priority: 0,
      critical_priority: 0
    };
  }

  // Get team task distribution
  async getTeamTaskDistribution() {
    const result = await pool.query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(ta.id) as total_tasks,
        COUNT(CASE WHEN ta.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN ta.status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN ta.status = 'in_progress' THEN 1 END) as in_progress
      FROM teams t
      LEFT JOIN tasks ta ON t.id = ta.team_id
      WHERE t.is_active = true
      GROUP BY t.id, t.name
      ORDER BY total_tasks DESC
    `);

    return result.rows;
  }
}

export default new TaskService();
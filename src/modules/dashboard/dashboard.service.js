import pool from '../../config/db.js';

class DashboardService {
  // Get dashboard statistics
  async getStats(userId) {
    // Get user role to determine what stats to show
    const userRole = await pool.query(
      `SELECT r.name as role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    );

    const role = userRole.rows[0]?.role_name || 'viewer';

    let statsQuery = '';
    let queryParams = [];

    // Admin - can see everything
    if (role === 'admin') {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT t.id) as total_teams,
          COUNT(DISTINCT ta.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.id END) as pending_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.id END) as in_progress_tasks
        FROM users u
        CROSS JOIN teams t
        CROSS JOIN tasks ta
      `;
      queryParams = [];
    } 
    // Manager - can see stats for their teams
    else if (role === 'manager') {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT t.id) as total_teams,
          COUNT(DISTINCT ta.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.id END) as pending_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.id END) as in_progress_tasks
        FROM teams t
        LEFT JOIN tasks ta ON t.id = ta.team_id
        CROSS JOIN users u
        WHERE t.team_lead_id = $1 OR t.id IN (
          SELECT team_id FROM team_users WHERE user_id = $1
        )
      `;
      queryParams = [userId];
    } 
    // Regular user - can see stats from their teams
    else {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT t.id) as total_teams,
          COUNT(DISTINCT ta.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.id END) as pending_tasks,
          COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.id END) as in_progress_tasks
        FROM team_users tu
        LEFT JOIN teams t ON tu.team_id = t.id
        LEFT JOIN tasks ta ON t.id = ta.team_id
        CROSS JOIN users u
        WHERE tu.user_id = $1
      `;
      queryParams = [userId];
    }

    const statsResult = await pool.query(statsQuery, queryParams);
    return statsResult.rows[0] || {
      total_users: 0,
      total_teams: 0,
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0
    };
  }

  // Get recent tasks
  async getRecentTasks(userId, limit = 5) {
    const userRole = await pool.query(
      `SELECT r.name as role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    );

    const role = userRole.rows[0]?.role_name || 'viewer';

    let query = '';
    let queryParams = [];

    // Admin - see all recent tasks
    if (role === 'admin') {
      query = `
        SELECT 
          ta.id,
          ta.title,
          ta.description,
          ta.status,
          ta.priority,
          ta.due_date,
          ta.created_at,
          t.name as team_name,
          u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
          u_created.first_name || ' ' || u_created.last_name as created_by_name
        FROM tasks ta
        LEFT JOIN teams t ON ta.team_id = t.id
        LEFT JOIN users u_assigned ON ta.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON ta.created_by = u_created.id
        ORDER BY ta.created_at DESC
        LIMIT $1
      `;
      queryParams = [limit];
    } 
    // Manager - see tasks from their teams
    else if (role === 'manager') {
      query = `
        SELECT 
          ta.id,
          ta.title,
          ta.description,
          ta.status,
          ta.priority,
          ta.due_date,
          ta.created_at,
          t.name as team_name,
          u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
          u_created.first_name || ' ' || u_created.last_name as created_by_name
        FROM tasks ta
        LEFT JOIN teams t ON ta.team_id = t.id
        LEFT JOIN users u_assigned ON ta.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON ta.created_by = u_created.id
        WHERE t.team_lead_id = $1 OR t.id IN (
          SELECT team_id FROM team_users WHERE user_id = $1
        )
        ORDER BY ta.created_at DESC
        LIMIT $2
      `;
      queryParams = [userId, limit];
    } 
    // Regular user - see tasks assigned to them or from their teams
    else {
      query = `
        SELECT 
          ta.id,
          ta.title,
          ta.description,
          ta.status,
          ta.priority,
          ta.due_date,
          ta.created_at,
          t.name as team_name,
          u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
          u_created.first_name || ' ' || u_created.last_name as created_by_name
        FROM tasks ta
        LEFT JOIN teams t ON ta.team_id = t.id
        LEFT JOIN users u_assigned ON ta.assigned_to = u_assigned.id
        LEFT JOIN users u_created ON ta.created_by = u_created.id
        WHERE ta.assigned_to = $1 OR t.id IN (
          SELECT team_id FROM team_users WHERE user_id = $1
        )
        ORDER BY ta.created_at DESC
        LIMIT $2
      `;
      queryParams = [userId, limit];
    }

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  // Get recent activity
 async getRecentActivity(userId, limit = 5) {
  const userRole = await pool.query(
    `SELECT r.name as role_name
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = $1`,
    [userId]
  );

  const role = userRole.rows[0]?.role_name || 'viewer';

  let query = '';
  let queryParams = [];

  // Admin - see all activity
  if (role === 'admin') {
    query = `
      (
        SELECT 
          'user_login' as type,
          u.id as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          u.last_login as created_at,
          'User ' || u.first_name || ' logged in' as message
        FROM users u
        WHERE u.last_login IS NOT NULL
        ORDER BY u.last_login DESC
        LIMIT $1
      )
      UNION ALL
      (
        SELECT 
          'task_created' as type,
          ta.created_by as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.created_at,
          'Task "' || ta.title || '" created' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.created_by = u.id
        ORDER BY ta.created_at DESC
        LIMIT $1
      )
      UNION ALL
      (
        SELECT 
          'task_completed' as type,
          ta.assigned_to as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.completed_at as created_at,
          'Task "' || ta.title || '" completed' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.assigned_to = u.id
        WHERE ta.status = 'completed' AND ta.completed_at IS NOT NULL
        ORDER BY ta.completed_at DESC
        LIMIT $1
      )
      ORDER BY created_at DESC
      LIMIT $2
    `;
    queryParams = [limit, limit];
  } 
  // Manager - see activity from their teams
  else if (role === 'manager') {
    query = `
      (
        SELECT 
          'user_login' as type,
          u.id as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          u.last_login as created_at,
          'User ' || u.first_name || ' logged in' as message
        FROM users u
        WHERE u.last_login IS NOT NULL
        ORDER BY u.last_login DESC
        LIMIT $1
      )
      UNION ALL
      (
        SELECT 
          'task_created' as type,
          ta.created_by as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.created_at,
          'Task "' || ta.title || '" created' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.created_by = u.id
        WHERE ta.team_id IN (
          SELECT team_id FROM team_users WHERE user_id = $1
        )
        ORDER BY ta.created_at DESC
        LIMIT $2
      )
      UNION ALL
      (
        SELECT 
          'task_completed' as type,
          ta.assigned_to as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.completed_at as created_at,
          'Task "' || ta.title || '" completed' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.assigned_to = u.id
        WHERE ta.status = 'completed' 
          AND ta.completed_at IS NOT NULL
          AND ta.team_id IN (
            SELECT team_id FROM team_users WHERE user_id = $1
          )
        ORDER BY ta.completed_at DESC
        LIMIT $2
      )
      ORDER BY created_at DESC
      LIMIT $3
    `;
    queryParams = [userId, limit, limit];
  } 
  // Regular user - see their own activity
  else {
    query = `
      (
        SELECT 
          'user_login' as type,
          u.id as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          u.last_login as created_at,
          'User ' || u.first_name || ' logged in' as message
        FROM users u
        WHERE u.id = $1 AND u.last_login IS NOT NULL
      )
      UNION ALL
      (
        SELECT 
          'task_created' as type,
          ta.created_by as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.created_at,
          'Task "' || ta.title || '" created' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.created_by = u.id
        WHERE ta.created_by = $1
        ORDER BY ta.created_at DESC
        LIMIT $2
      )
      UNION ALL
      (
        SELECT 
          'task_completed' as type,
          ta.assigned_to as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ta.completed_at as created_at,
          'Task "' || ta.title || '" completed' as message
        FROM tasks ta
        LEFT JOIN users u ON ta.assigned_to = u.id
        WHERE ta.assigned_to = $1 
          AND ta.status = 'completed' 
          AND ta.completed_at IS NOT NULL
        ORDER BY ta.completed_at DESC
        LIMIT $2
      )
      ORDER BY created_at DESC
      LIMIT $3
    `;
    queryParams = [userId, limit, limit];
  }

  const result = await pool.query(query, queryParams);
  return result.rows;
}

  // Get user-specific stats (for profile)
  async getUserStats(userId) {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT ta.id) as assigned_tasks,
        COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.id END) as in_progress_tasks,
        COUNT(DISTINCT t.id) as team_count
      FROM users u
      LEFT JOIN tasks ta ON u.id = ta.assigned_to
      LEFT JOIN team_users tu ON u.id = tu.user_id
      LEFT JOIN teams t ON tu.team_id = t.id
      WHERE u.id = $1
    `, [userId]);

    return result.rows[0] || {
      assigned_tasks: 0,
      completed_tasks: 0,
      in_progress_tasks: 0,
      team_count: 0
    };
  }

  // Get team performance stats (for managers)
  async getTeamPerformance(userId) {
    const result = await pool.query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(DISTINCT tu.user_id) as member_count,
        COUNT(DISTINCT ta.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
        ROUND(
          (COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END)::decimal / 
          NULLIF(COUNT(DISTINCT ta.id), 0) * 100), 2
        ) as completion_rate
      FROM teams t
      LEFT JOIN team_users tu ON t.id = tu.team_id
      LEFT JOIN tasks ta ON t.id = ta.team_id
      WHERE t.team_lead_id = $1 OR t.id IN (
        SELECT team_id FROM team_users WHERE user_id = $1
      )
      GROUP BY t.id, t.name
      ORDER BY completion_rate DESC NULLS LAST
    `, [userId]);

    return result.rows;
  }
}

export default new DashboardService();
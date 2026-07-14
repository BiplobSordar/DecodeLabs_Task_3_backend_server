import pool from '../../config/db.js';
import { MESSAGES } from '../../constants/messages.js';

class TeamService {
  // Get all teams with pagination
  async getAllTeams(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    const query = `
      SELECT 
        t.id, t.name, t.description, t.team_lead_id, t.is_active,
        t.created_at, t.updated_at,
        u.first_name || ' ' || u.last_name as team_lead_name,
        COUNT(DISTINCT tu.user_id) as member_count,
        COUNT(DISTINCT ta.id) as task_count,
        COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks
      FROM teams t
      LEFT JOIN users u ON t.team_lead_id = u.id
      LEFT JOIN team_users tu ON t.id = tu.team_id
      LEFT JOIN tasks ta ON t.id = ta.team_id
      WHERE 
        t.name ILIKE $3 OR 
        t.description ILIKE $3
      GROUP BY t.id, u.first_name, u.last_name
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM teams t
      WHERE 
        t.name ILIKE $1 OR 
        t.description ILIKE $1
    `;

    const [teamsResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset, searchPattern]),
      pool.query(countQuery, [searchPattern])
    ]);

    return {
      teams: teamsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Get team by ID with full details
  async getTeamById(teamId) {
    const query = `
      SELECT 
        t.id, t.name, t.description, t.team_lead_id, t.is_active,
        t.created_at, t.updated_at,
        u.first_name || ' ' || u.last_name as team_lead_name,
        u.email as team_lead_email,
        COUNT(DISTINCT tu.user_id) as member_count,
        COUNT(DISTINCT ta.id) as task_count,
        COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.id END) as in_progress_tasks
      FROM teams t
      LEFT JOIN users u ON t.team_lead_id = u.id
      LEFT JOIN team_users tu ON t.id = tu.team_id
      LEFT JOIN tasks ta ON t.id = ta.team_id
      WHERE t.id = $1
      GROUP BY t.id, u.first_name, u.last_name, u.email
    `;

    const result = await pool.query(query, [teamId]);

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.TEAM.NOT_FOUND);
    }

    return result.rows[0];
  }

  // Get team members
  async getTeamMembers(teamId) {
    const query = `
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name,
        u.is_active, u.last_login,
        r.name as role_name,
        tu.joined_at
      FROM team_users tu
      LEFT JOIN users u ON tu.user_id = u.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE tu.team_id = $1
      ORDER BY tu.joined_at ASC
    `;

    const result = await pool.query(query, [teamId]);
    return result.rows;
  }

  // Get teams for a user
  async getTeamsForUser(userId) {
    const query = `
      SELECT 
        t.id, t.name, t.description, t.team_lead_id, t.is_active,
        u.first_name || ' ' || u.last_name as team_lead_name,
        tu.joined_at,
        COUNT(DISTINCT ta.id) as task_count
      FROM team_users tu
      LEFT JOIN teams t ON tu.team_id = t.id
      LEFT JOIN users u ON t.team_lead_id = u.id
      LEFT JOIN tasks ta ON t.id = ta.team_id
      WHERE tu.user_id = $1
      GROUP BY t.id, u.first_name, u.last_name, tu.joined_at
      ORDER BY t.name
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
  // Create new team
  async createTeam(teamData) {
    const { name, description, team_lead_id, is_active = true } = teamData;

    // Check if team name exists
    const existingTeam = await pool.query(
      'SELECT id FROM teams WHERE name = $1',
      [name]
    );

    if (existingTeam.rows.length > 0) {
      throw new Error('Team name already exists');
    }

    // ✅ Handle team_lead_id properly - convert empty string to null
    let leadId = null;
    if (team_lead_id !== undefined && team_lead_id !== null && team_lead_id !== '') {
      leadId = parseInt(team_lead_id);
      if (!isNaN(leadId) && leadId > 0) {
        // Check if team lead exists
        const userCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND is_active = true',
          [leadId]
        );
        if (userCheck.rows.length === 0) {
          throw new Error('Team lead not found or inactive');
        }
      } else {
        leadId = null;
      }
    }

    const result = await pool.query(
      `INSERT INTO teams (name, description, team_lead_id, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, team_lead_id, is_active, created_at`,
      [name, description, leadId, is_active]
    );

    const team = result.rows[0];

    // Add team lead as member if specified
    if (leadId) {
      await pool.query(
        'INSERT INTO team_users (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [team.id, leadId]
      );
    }

    return await this.getTeamById(team.id);
  }
// Update team
async updateTeam(teamId, updateData) {
  const { name, description, team_lead_id, is_active } = updateData;

  // Check if team exists
  const teamCheck = await pool.query(
    'SELECT id FROM teams WHERE id = $1',
    [teamId]
  );
  if (teamCheck.rows.length === 0) {
    throw new Error(MESSAGES.TEAM.NOT_FOUND);
  }

  // Check team name uniqueness
  if (name) {
    const nameCheck = await pool.query(
      'SELECT id FROM teams WHERE name = $1 AND id != $2',
      [name, teamId]
    );
    if (nameCheck.rows.length > 0) {
      throw new Error('Team name already exists');
    }
  }

  // ✅ Handle team_lead_id properly
  let leadId = null;
  if (team_lead_id !== undefined && team_lead_id !== null && team_lead_id !== '') {
    leadId = parseInt(team_lead_id);
    if (!isNaN(leadId) && leadId > 0) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [leadId]
      );
      if (userCheck.rows.length === 0) {
        throw new Error('Team lead not found or inactive');
      }
    } else {
      leadId = null;
    }
  }

  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (description !== undefined) {
    updateFields.push(`description = $${paramCount}`);
    values.push(description);
    paramCount++;
  }
  if (team_lead_id !== undefined) {
    updateFields.push(`team_lead_id = $${paramCount}`);
    values.push(leadId);
    paramCount++;
  }
  if (is_active !== undefined) {
    updateFields.push(`is_active = $${paramCount}`);
    values.push(is_active);
    paramCount++;
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updateFields.length > 0) {
    values.push(teamId);
    await pool.query(
      `UPDATE teams SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }

  // If team lead changed, ensure they're added as member
  if (leadId) {
    await pool.query(
      'INSERT INTO team_users (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [teamId, leadId]
    );
  }

  return await this.getTeamById(teamId);
}

  // Delete team (soft delete)
  async deleteTeam(teamId, hardDelete = false) {
    // Check if team exists
    const teamCheck = await pool.query(
      'SELECT id FROM teams WHERE id = $1',
      [teamId]
    );
    if (teamCheck.rows.length === 0) {
      throw new Error(MESSAGES.TEAM.NOT_FOUND);
    }

    if (hardDelete) {
      // Hard delete - remove completely
      await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
      return { deleted: true };
    } else {
      // Soft delete - deactivate
      await pool.query(
        'UPDATE teams SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [teamId]
      );
      return { deactivated: true };
    }
  }

  // Add member to team
  async addMember(teamId, userId) {
    // Check team exists and is active
    const teamCheck = await pool.query(
      'SELECT id, is_active FROM teams WHERE id = $1',
      [teamId]
    );
    if (teamCheck.rows.length === 0) {
      throw new Error(MESSAGES.TEAM.NOT_FOUND);
    }
    if (!teamCheck.rows[0].is_active) {
      throw new Error('Cannot add members to inactive team');
    }

    // Check user exists and is active
    const userCheck = await pool.query(
      'SELECT id, is_active FROM users WHERE id = $1',
      [userId]
    );
    if (userCheck.rows.length === 0) {
      throw new Error('User not found');
    }
    if (!userCheck.rows[0].is_active) {
      throw new Error('Cannot add inactive user to team');
    }

    // Add member
    await pool.query(
      'INSERT INTO team_users (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [teamId, userId]
    );

    return await this.getTeamMembers(teamId);
  }

  // Remove member from team
  async removeMember(teamId, userId) {
    // Check if user is team lead
    const teamCheck = await pool.query(
      'SELECT team_lead_id FROM teams WHERE id = $1',
      [teamId]
    );
    if (teamCheck.rows.length === 0) {
      throw new Error(MESSAGES.TEAM.NOT_FOUND);
    }

    if (teamCheck.rows[0].team_lead_id === userId) {
      throw new Error('Cannot remove team lead from team');
    }

    await pool.query(
      'DELETE FROM team_users WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    return await this.getTeamMembers(teamId);
  }

  // Bulk add members
  async bulkAddMembers(teamId, userIds) {
    const results = [];
    for (const userId of userIds) {
      try {
        await this.addMember(teamId, userId);
        results.push({ userId, success: true });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }
    return results;
  }

  // Get team statistics
  async getTeamStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_teams,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_teams,
        AVG(member_count) as avg_members,
        MAX(member_count) as max_members,
        MIN(member_count) as min_members
      FROM (
        SELECT 
          t.id,
          COUNT(tu.user_id) as member_count
        FROM teams t
        LEFT JOIN team_users tu ON t.id = tu.team_id
        GROUP BY t.id
      ) as team_stats
    `);

    return stats.rows[0];
  }
}

export default new TeamService();
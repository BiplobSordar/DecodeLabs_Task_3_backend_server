import pool from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/bcrypt.js';
import { generateTokens, verifyToken, verifyRefreshToken } from '../../utils/jwt.js';
import { MESSAGES } from '../../constants/messages.js';

class AuthService {
  async register(userData) {
    const { username, email, password, first_name, last_name } = userData;

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

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name, is_active`,
      [username, email, hashedPassword, first_name, last_name]
    );

    const user = result.rows[0];

    // Assign default role (viewer)
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['viewer']
    );

    if (roleResult.rows.length > 0) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [user.id, roleResult.rows[0].id]
      );
    }

    // Generate tokens
    const tokens = generateTokens({ 
      userId: user.id, 
      username: user.username 
    });

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async login(credentials) {
    const { username, password } = credentials;

    // Get user with role and permissions
    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.email, u.password_hash, 
        u.first_name, u.last_name, u.is_active, u.last_login,
        r.name as role_name, r.permissions,
        ur.role_id
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.username = $1 OR u.email = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      throw new Error(MESSAGES.AUTH.ACCOUNT_INACTIVE);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Remove password_hash from response
    delete user.password_hash;

    // Generate tokens
    const tokens = generateTokens({ 
      userId: user.id, 
      username: user.username,
      role: user.role_name
    });

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  // Save refresh token to database
  async saveRefreshToken(userId, refreshToken) {
    // First delete any existing refresh tokens for this user
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    // Insert new refresh token
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [userId, refreshToken]
    );
  }

  // Validate refresh token from database
  async validateRefreshToken(userId, refreshToken) {
    const result = await pool.query(
      `SELECT token FROM refresh_tokens 
       WHERE user_id = $1 AND token = $2 AND expires_at > NOW() AND revoked = FALSE`,
      [userId, refreshToken]
    );
    return result.rows.length > 0;
  }

  // Delete refresh token
  async deleteRefreshToken(refreshToken) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
  }

  // Revoke all refresh tokens for a user
  async revokeAllRefreshTokens(userId) {
    await pool.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  }

  async refreshToken(refreshToken) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      throw new Error(MESSAGES.AUTH.INVALID_TOKEN);
    }

    // Check if token exists and is valid in database
    const isValid = await this.validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      throw new Error(MESSAGES.AUTH.INVALID_TOKEN);
    }

    // Get user to ensure they still exist and are active
    const result = await pool.query(
      `SELECT u.id, u.username, u.is_active,
              r.name as role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new Error(MESSAGES.AUTH.INVALID_TOKEN);
    }

    const user = result.rows[0];

    // Delete old refresh token (token rotation)
    await this.deleteRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens({ 
      userId: user.id, 
      username: user.username,
      role: user.role_name
    });

    // Save new refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async getProfile(userId) {
    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.is_active, u.last_login, u.created_at,
        r.name as role_name, r.permissions,
        ARRAY_AGG(DISTINCT t.name) as teams
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN team_users tu ON u.id = tu.user_id
       LEFT JOIN teams t ON tu.team_id = t.id
       WHERE u.id = $1
       GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, 
                u.is_active, u.last_login, u.created_at, r.name, r.permissions`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    return result.rows[0];
  }

  async changePassword(userId, oldPassword, newPassword) {
    // Get user
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    // Verify old password
    const isValidPassword = await comparePassword(
      oldPassword,
      result.rows[0].password_hash
    );

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Revoke all refresh tokens after password change (security)
    await this.revokeAllRefreshTokens(userId);

    return true;
  }

  async logout(userId, refreshToken) {
    // Delete the specific refresh token
    if (refreshToken) {
      await this.deleteRefreshToken(refreshToken);
    }
    
    // Optional: Delete all refresh tokens for this user
    // await this.revokeAllRefreshTokens(userId);
    
    return true;
  }
}

export default new AuthService();
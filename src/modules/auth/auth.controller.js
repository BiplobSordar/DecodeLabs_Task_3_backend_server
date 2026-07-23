import AuthService from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { MESSAGES } from '../../constants/messages.js';

// Cookie configuration for access token
const accessTokenCookieConfig = {
  httpOnly: true,
  secure: false, // Production: true (HTTPS)
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

// Cookie configuration for refresh token
const refreshTokenCookieConfig = {
  httpOnly: true,
  secure: false, // Production: true (HTTPS)
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

class AuthController {
  async register(req, res) {
    try {
      const { user, tokens } = await AuthService.register(req.body);

      res.cookie(
        'accessToken',
        tokens.accessToken,
        accessTokenCookieConfig
      );

      res.cookie(
        'refreshToken',
        tokens.refreshToken,
        refreshTokenCookieConfig
      );

      return successResponse(
        res,
        { user },
        MESSAGES.AUTH.REGISTER_SUCCESS,
        201
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400,
        error.message
      );
    }
  }

  async login(req, res) {
    try {
      const { user, tokens } = await AuthService.login(req.body);

      res.cookie(
        'accessToken',
        tokens.accessToken,
        accessTokenCookieConfig
      );

      res.cookie(
        'refreshToken',
        tokens.refreshToken,
        refreshTokenCookieConfig
      );

      return successResponse(
        res,
        { user },
        MESSAGES.AUTH.LOGIN_SUCCESS
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        401,
        error.message
      );
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return errorResponse(
          res,
          'No refresh token provided',
          401,
          'No refresh token provided'
        );
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      res.cookie(
        'accessToken',
        tokens.accessToken,
        accessTokenCookieConfig
      );

      res.cookie(
        'refreshToken',
        tokens.refreshToken,
        refreshTokenCookieConfig
      );

      return successResponse(
        res,
        null,
        MESSAGES.AUTH.REFRESH_TOKEN_SUCCESS
      );
    } catch (error) {
      res.clearCookie('accessToken', accessTokenCookieConfig);
      res.clearCookie('refreshToken', refreshTokenCookieConfig);

      return errorResponse(
        res,
        error.message,
        401,
        error.message
      );
    }
  }

  async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.userId);

      return successResponse(
        res,
        user,
        MESSAGES.AUTH.FETCHED
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        404,
        error.message
      );
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      await AuthService.changePassword(
        req.user.userId,
        oldPassword,
        newPassword
      );

      return successResponse(
        res,
        null,
        'Password changed successfully'
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400,
        error.message
      );
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      await AuthService.logout(
        req.user.userId,
        refreshToken
      );

      res.clearCookie(
        'accessToken',
        accessTokenCookieConfig
      );

      res.clearCookie(
        'refreshToken',
        refreshTokenCookieConfig
      );

      return successResponse(
        res,
        null,
        MESSAGES.AUTH.LOGOUT_SUCCESS
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
}

export default new AuthController();

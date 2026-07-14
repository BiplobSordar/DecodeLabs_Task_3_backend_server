import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    payload,
    authConfig.jwt.refreshSecret || authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.secret);
  } catch (error) {
    return null;
  }
};

// Add this for refresh token verification
export const verifyRefreshToken = (token) => {
  try {
    const secret = authConfig.jwt.refreshSecret || authConfig.jwt.secret;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

export const generateResetToken = (email) => {
  return jwt.sign(
    { email },
    authConfig.jwt.secret,
    { expiresIn: '1h' }
  );
};

export const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.secret);
  } catch (error) {
    return null;
  }
};
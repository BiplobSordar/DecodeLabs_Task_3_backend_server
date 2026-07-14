import bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.js';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, authConfig.bcrypt.saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
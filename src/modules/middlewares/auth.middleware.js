// import { verifyToken } from '../utils/jwt.js';
import { MESSAGES } from '../../constants/messages.js';
import { verifyToken } from '../../utils/jwt.js';


export const authenticate = async (req, res, next) => {
  try {
    // ✅ Read access token from cookie instead of Authorization header
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.TOKEN_REQUIRED,
      });
    }

    const decoded = verifyToken(accessToken);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_TOKEN,
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: MESSAGES.AUTH.INVALID_TOKEN,
    });
  }
};
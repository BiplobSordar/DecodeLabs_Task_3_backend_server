export const validateCreateUser = (req, res, next) => {
  const { username, email, password, first_name, last_name } = req.body;
  const errors = [];

  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!first_name) {
    errors.push('First name is required');
  }

  if (!last_name) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { username, email, first_name, last_name } = req.body;
  const errors = [];

  if (username && username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

export const validateUserId = (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  next();
};
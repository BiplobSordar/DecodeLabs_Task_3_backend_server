export const validateRegister = (req, res, next) => {
  const { username, email, password, first_name, last_name } = req.body;
  console.log(req.body,'thell is me')

  const errors = [];

  if (!username) errors.push('Username is required');
  if (username && username.length < 3) errors.push('Username must be at least 3 characters');
  
  if (!email) errors.push('Email is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }
  
  if (!password) errors.push('Password is required');
  if (password && password.length < 8) errors.push('Password must be at least 8 characters');
  
  if (!first_name) errors.push('First name is required');
  if (!last_name) errors.push('Last name is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  const errors = [];

  if (!username) errors.push('Username or email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

export const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const errors = [];

  if (!oldPassword) errors.push('Current password is required');
  if (!newPassword) errors.push('New password is required');
  if (newPassword && newPassword.length < 8) {
    errors.push('New password must be at least 8 characters');
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
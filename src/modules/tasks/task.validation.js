export const validateCreateTask = (req, res, next) => {
  const { title, description, team_id, assigned_to, priority, due_date, status } = req.body;
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('Task title is required');
  } else if (title.length < 3) {
    errors.push('Task title must be at least 3 characters');
  } else if (title.length > 255) {
    errors.push('Task title must be less than 255 characters');
  }

  if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (team_id !== undefined && team_id !== null && team_id !== '') {
    const parsedId = parseInt(team_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid team ID');
    }
  }

  if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') {
    const parsedId = parseInt(assigned_to);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid assigned user ID');
    }
  }

  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Invalid priority. Must be low, medium, high, or critical');
    }
  }

  if (status) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status. Must be pending, in_progress, completed, or cancelled');
    }
  }

  if (due_date) {
    const date = new Date(due_date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid due date format');
    }
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

export const validateUpdateTask = (req, res, next) => {
  const { title, description, team_id, assigned_to, priority, due_date, status } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (!title.trim()) {
      errors.push('Task title cannot be empty');
    } else if (title.length < 3) {
      errors.push('Task title must be at least 3 characters');
    } else if (title.length > 255) {
      errors.push('Task title must be less than 255 characters');
    }
  }

  if (description !== undefined && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (team_id !== undefined) {
    if (team_id !== null && team_id !== '') {
      const parsedId = parseInt(team_id);
      if (isNaN(parsedId) || parsedId <= 0) {
        errors.push('Invalid team ID');
      }
    }
  }

  if (assigned_to !== undefined) {
    if (assigned_to !== null && assigned_to !== '') {
      const parsedId = parseInt(assigned_to);
      if (isNaN(parsedId) || parsedId <= 0) {
        errors.push('Invalid assigned user ID');
      }
    }
  }

  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Invalid priority. Must be low, medium, high, or critical');
    }
  }

  if (status !== undefined) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status. Must be pending, in_progress, completed, or cancelled');
    }
  }

  if (due_date !== undefined) {
    if (due_date !== null && due_date !== '') {
      const date = new Date(due_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid due date format');
      }
    }
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

export const validateTaskId = (req, res, next) => {
  const taskId = parseInt(req.params.id);
  
  if (!taskId || isNaN(taskId) || taskId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID'
    });
  }

  next();
};

export const validateTaskStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!status) {
    errors.push('Status is required');
  } else {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status. Must be pending, in_progress, completed, or cancelled');
    }
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

export const validateTaskAssignment = (req, res, next) => {
  const { user_id } = req.body;
  const errors = [];

  if (!user_id) {
    errors.push('User ID is required');
  } else {
    const parsedId = parseInt(user_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid user ID');
    }
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

export const validateTaskFilters = (req, res, next) => {
  const { status, priority, team_id, assigned_to, due_date_from, due_date_to } = req.query;
  const errors = [];

  if (status) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status filter');
    }
  }

  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Invalid priority filter');
    }
  }

  if (team_id) {
    const parsedId = parseInt(team_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid team ID filter');
    }
  }

  if (assigned_to) {
    const parsedId = parseInt(assigned_to);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid assigned user ID filter');
    }
  }

  if (due_date_from) {
    const date = new Date(due_date_from);
    if (isNaN(date.getTime())) {
      errors.push('Invalid due date from format');
    }
  }

  if (due_date_to) {
    const date = new Date(due_date_to);
    if (isNaN(date.getTime())) {
      errors.push('Invalid due date to format');
    }
  }

  if (due_date_from && due_date_to) {
    const from = new Date(due_date_from);
    const to = new Date(due_date_to);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from > to) {
      errors.push('Due date from must be before due date to');
    }
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
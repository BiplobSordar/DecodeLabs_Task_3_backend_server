export const validateCreateTeam = (req, res, next) => {
  const { name, description, team_lead_id } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Team name is required');
  } else if (name.length < 3) {
    errors.push('Team name must be at least 3 characters');
  } else if (name.length > 100) {
    errors.push('Team name must be less than 100 characters');
  }

  if (description && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // ✅ Fix: Check if team_lead_id is provided and is a valid number
  if (team_lead_id !== undefined && team_lead_id !== null && team_lead_id !== '') {
    const parsedId = parseInt(team_lead_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid team lead ID');
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

export const validateUpdateTeam = (req, res, next) => {
  const { name, description, team_lead_id } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (!name.trim()) {
      errors.push('Team name cannot be empty');
    } else if (name.length < 3) {
      errors.push('Team name must be at least 3 characters');
    } else if (name.length > 100) {
      errors.push('Team name must be less than 100 characters');
    }
  }

  if (description !== undefined && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // ✅ Fix: Check if team_lead_id is provided and is a valid number
  if (team_lead_id !== undefined && team_lead_id !== null && team_lead_id !== '') {
    const parsedId = parseInt(team_lead_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      errors.push('Invalid team lead ID');
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

export const validateTeamId = (req, res, next) => {
  const teamId = parseInt(req.params.id);
  
  if (!teamId || isNaN(teamId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid team ID'
    });
  }

  next();
};

export const validateAddMember = (req, res, next) => {
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
# User Management System - Backend API

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-90%25-yellowgreen)

A robust, production-ready REST API built with Node.js, Express, and PostgreSQL. Features include secure authentication with JWT and HttpOnly cookies, comprehensive user management, team management, task management, role-based access control, and real-time analytics. Built with modular architecture, this API serves as the backend for a complete user management system.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Entity Relationships](#entity-relationships)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- HttpOnly cookies for secure token storage (XSS protection)
- Automatic token refresh mechanism
- Token rotation for enhanced security
- Role-based access control (RBAC)
- Password hashing with bcrypt (10 rounds)
- Login attempt tracking
- Secure logout with token revocation

### User Management
- Complete CRUD operations
- Role assignment and management
- User status management (active/inactive)
- User statistics and analytics
- Bulk user operations
- User search and filtering
- Pagination support

### Team Management
- Complete CRUD operations
- Team member management (add/remove)
- Team lead assignment
- Team statistics and performance metrics
- Bulk member operations
- Team search and filtering
- Member role management within teams

### Task Management
- Complete CRUD operations
- Task assignment to users
- Task status workflow (Pending → In Progress → Completed)
- Task priority levels (Low, Medium, High, Critical)
- Task filtering and advanced search
- Task statistics and analytics
- Role-based task visibility
- Due date tracking

### Dashboard Analytics
- Real-time statistics aggregator
- Recent tasks and user activity
- Team performance metrics
- Role-based data visibility
- Activity feed

### Database
- PostgreSQL with optimized schema
- Proper relationships with foreign keys
- Indexed queries for performance
- Transaction support for data integrity
- Refresh token storage with revocation support
- Automatic timestamp management

---

## Tech Stack

### Core
| Component | Technology |
|-----------|------------|
| Runtime | Node.js (v18+) |
| Framework | Express.js (v4.x) |
| Database | PostgreSQL (v14+) |
| ORM | Raw SQL with `pg` driver |

### Security
| Component | Technology |
|-----------|------------|
| Authentication | JWT (`jsonwebtoken`) |
| Password Hashing | `bcrypt` |
| Cookies | `cookie-parser` |
| CORS | `cors` middleware |
| Security Headers | `helmet` (optional) |

### Development
| Component | Technology |
|-----------|------------|
| Environment | `dotenv` |
| Dev Server | `nodemon` |
| Linting | ESLint |
| Formatting | Prettier |
| Testing | Jest / Supertest (optional) |

---

## Project Structure

```
src/
├── config/
│   ├── auth.js                       # JWT and authentication configuration
│   ├── cors.js                       # CORS configuration
│   └── db.js                         # Database connection pool
├── constants/
│   └── messages.js                   # Response messages constants
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_refresh_tokens.sql
│   ├── seeds/
│   │   └── 001_seed_data.sql
│   └── migrate.js                    # Migration runner script
├── middleware/
│   ├── auth.middleware.js            # JWT verification middleware
│   ├── permission.middleware.js      # RBAC permission middleware
│   └── validation.middleware.js      # Request validation middleware
├── modules/
│   ├── auth/                         # Authentication module
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   └── validations/
│   │       └── auth.validation.js
│   ├── users/                        # User management module
│   │   ├── controllers/
│   │   │   └── user.controller.js
│   │   ├── services/
│   │   │   └── user.service.js
│   │   ├── routes/
│   │   │   └── user.routes.js
│   │   └── validations/
│   │       └── user.validation.js
│   ├── teams/                        # Team management module
│   │   ├── controllers/
│   │   │   └── team.controller.js
│   │   ├── services/
│   │   │   └── team.service.js
│   │   ├── routes/
│   │   │   └── team.routes.js
│   │   └── validations/
│   │       └── team.validation.js
│   ├── tasks/                        # Task management module
│   │   ├── controllers/
│   │   │   └── task.controller.js
│   │   ├── services/
│   │   │   └── task.service.js
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   └── validations/
│   │       └── task.validation.js
│   └── dashboard/                    # Dashboard module
│       ├── controllers/
│       │   └── dashboard.controller.js
│       ├── services/
│       │   └── dashboard.service.js
│       └── routes/
│           └── dashboard.routes.js
├── utils/
│   ├── bcrypt.js                     # Password hashing utilities
│   ├── jwt.js                        # JWT generation/verification
│   └── response.js                   # Standard response formatters
├── app.js                            # Express app configuration
└── server.js                         # Server entry point
```

---

## Entity Relationships

| Relationship | Cardinality | Description |
|---|---|---|
| User → Role | 1:1 | Each user has exactly one role |
| User ↔ Team | M:M | Users can be in multiple teams |
| Team → Tasks | 1:M | One team can have many tasks |
| User → Tasks (assigned) | 1:M | One user can be assigned many tasks |
| User → Tasks (created) | 1:M | One user can create many tasks |

---

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/BiplobSordar/DecodeLabs_Task_3_backend_server.git
cd DecodeLabs_Task_3_backend_server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# Run database migrations
npm run migrate

# Seed database with sample data (optional)
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000` by default.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot reload (nodemon) |
| `npm start` | Starts the production server |
| `npm run migrate` | Runs database migrations |
| `npm run seed` | Seeds the database with sample data |
| `npm run lint` | Runs ESLint to check code quality |
| `npm test` | Runs the test suite (Jest/Supertest) |

---

## Environment Variables

Create a `.env` file in the root of the project based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your-super-secret-access-token-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX=100
```

| Variable | Description |
|----------|--------------|
| `PORT` | Port the server listens on |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) |
| `CLIENT_URL` | Frontend URL, used for CORS configuration |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_SSL` | Whether to use SSL for database connection |
| `JWT_SECRET` | Secret key for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | Access token expiry duration |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry duration |
| `BCRYPT_SALT_ROUNDS` | Number of salt rounds for password hashing |
| `RATE_LIMIT_WINDOW` | Rate limiting time window (ms) |
| `RATE_LIMIT_MAX` | Max requests allowed per rate limit window |

---

## API Documentation

All endpoints are prefixed with `/api`. Endpoints marked **Auth Required** need a valid access token (sent via HttpOnly cookie), and endpoints with a **Permission** require the corresponding RBAC permission.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|--------------|:---:|---------------|
| POST | `/api/auth/register` | Register new user | ❌ | `{ username, email, password, first_name, last_name }` |
| POST | `/api/auth/login` | Login user | ❌ | `{ username, password }` |
| POST | `/api/auth/refresh-token` | Refresh access token | ❌ | Cookie: `refreshToken` |
| GET | `/api/auth/profile` | Get current user profile | ✅ | - |
| POST | `/api/auth/change-password` | Change password | ✅ | `{ oldPassword, newPassword }` |
| POST | `/api/auth/logout` | Logout user | ✅ | - |

### User Management Endpoints

| Method | Endpoint | Description | Permission | Request Body |
|--------|----------|--------------|------------|---------------|
| GET | `/api/users` | Get all users (paginated) | `view_users` | Query: `page`, `limit`, `search` |
| GET | `/api/users/:id` | Get user by ID | `view_users` | - |
| GET | `/api/users/stats` | Get user statistics | `view_reports` | - |
| GET | `/api/users/roles` | Get all roles | `view_users` | - |
| POST | `/api/users` | Create new user | `create_user` | `{ username, email, password, first_name, last_name, role_id }` |
| PUT | `/api/users/:id` | Update user | `update_user` | `{ username, email, first_name, last_name, is_active }` |
| DELETE | `/api/users/:id` | Delete user | `delete_user` | Query: `permanent=true` |
| PATCH | `/api/users/:id/status` | Update user status | `update_user` | `{ is_active: boolean }` |
| PATCH | `/api/users/:id/role` | Assign role | `manage_roles` | `{ role_id: number }` |
| POST | `/api/users/bulk/role` | Bulk assign roles | `manage_roles` | `{ user_ids: [], role_id: number }` |

### Team Management Endpoints

| Method | Endpoint | Description | Permission | Request Body |
|--------|----------|--------------|------------|---------------|
| GET | `/api/teams` | Get all teams | `view_teams` | Query: `page`, `limit`, `search` |
| GET | `/api/teams/:id` | Get team by ID | `view_teams` | - |
| GET | `/api/teams/:id/members` | Get team members | `view_teams` | - |
| GET | `/api/teams/my-teams` | Get user's teams | - | - |
| GET | `/api/teams/stats` | Get team statistics | `view_reports` | - |
| POST | `/api/teams` | Create team | `create_team` | `{ name, description, team_lead_id }` |
| PUT | `/api/teams/:id` | Update team | `update_team` | `{ name, description, team_lead_id, is_active }` |
| DELETE | `/api/teams/:id` | Delete team | `delete_team` | Query: `permanent=true` |
| POST | `/api/teams/:id/members` | Add member | `update_team` | `{ user_id: number }` |
| POST | `/api/teams/:id/members/bulk` | Bulk add members | `update_team` | `{ user_ids: [] }` |
| DELETE | `/api/teams/:id/members/:userId` | Remove member | `update_team` | - |

### Task Management Endpoints

| Method | Endpoint | Description | Permission | Request Body |
|--------|----------|--------------|------------|---------------|
| GET | `/api/tasks` | Get all tasks | `view_tasks` | Query: `page`, `limit`, `status`, `priority`, `team_id`, `assigned_to` |
| GET | `/api/tasks/:id` | Get task by ID | `view_tasks` | - |
| GET | `/api/tasks/my-tasks` | Get user's tasks | - | - |
| GET | `/api/tasks/stats` | Get task statistics | `view_reports` | - |
| GET | `/api/tasks/team/:teamId` | Get tasks by team | `view_tasks` | Query: `page`, `limit` |
| GET | `/api/tasks/user/:userId` | Get tasks by user | `view_tasks` | Query: `page`, `limit` |
| POST | `/api/tasks` | Create task | `create_task` | `{ title, description, team_id, assigned_to, priority, due_date, status }` |
| PUT | `/api/tasks/:id` | Update task | `update_task` | `{ title, description, team_id, assigned_to, priority, due_date, status }` |
| PATCH | `/api/tasks/:id/status` | Update task status | `update_task` | `{ status: string }` |
| PATCH | `/api/tasks/:id/assign` | Assign task | `assign_task` | `{ user_id: number }` |
| DELETE | `/api/tasks/:id` | Delete task | `delete_task` | Query: `permanent=true` |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required | Query Params |
|--------|----------|--------------|:---:|---------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | ✅ | - |
| GET | `/api/dashboard/recent-tasks` | Get recent tasks | ✅ | `limit` |
| GET | `/api/dashboard/recent-activity` | Get recent activity | ✅ | `limit` |
| GET | `/api/dashboard/user-stats` | Get user-specific stats | ✅ | - |
| GET | `/api/dashboard/team-performance` | Get team performance | ✅ | - |

---

## Security Features

### 1. Authentication Security
- Passwords hashed with `bcrypt` using a configurable salt round count (default 10)
- Access and refresh tokens signed with separate secrets
- Short-lived access tokens (default 15 minutes) minimize exposure if leaked
- Longer-lived refresh tokens (default 7 days) stored server-side for validation

### 2. Authorization (RBAC)
- Fine-grained permissions (e.g. `view_users`, `create_task`, `manage_roles`) mapped to roles
- `permission.middleware.js` enforces required permissions at the route level
- Role-based data visibility (e.g. users only see their own tasks unless permitted otherwise)

### 3. Cookie Security
- **HttpOnly**: Prevents XSS attacks by making tokens inaccessible to client-side JavaScript
- **Secure**: Only sent over HTTPS in production
- **SameSite**: Provides CSRF protection
- **MaxAge**: Refresh token 7 days, access token 15 minutes

### 4. Token Management
- **Token Rotation**: New refresh token issued on each refresh
- **Database Storage**: Refresh tokens stored for validation and auditing
- **Revocation**: Tokens can be revoked on logout
- **One-Time Use**: Refresh tokens invalidated after use to prevent replay attacks

### 5. Role-Based Access Control

```javascript
// Example: middleware/permission.middleware.js
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.role.permissions;

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to perform this action',
      });
    }

    next();
  };
};

module.exports = { requirePermission };
```

### 6. Additional Protections
- Input validation on all incoming requests (`validation.middleware.js`)
- Rate limiting to mitigate brute-force and DoS attacks
- CORS configured to only allow requests from trusted origins (`CLIENT_URL`)
- Optional `helmet` middleware for secure HTTP headers
- Parameterized SQL queries to prevent SQL injection

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting (`npm run lint`) and, where applicable, includes tests before submitting a PR.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
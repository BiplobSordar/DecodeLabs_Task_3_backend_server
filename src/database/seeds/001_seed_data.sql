-- Insert roles with conflict handling
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Full system access with all permissions', 
 '["view_users", "create_user", "update_user", "delete_user", "view_teams", "create_team", "update_team", "delete_team", "view_tasks", "create_task", "update_task", "delete_task", "assign_task", "complete_task", "view_reports", "manage_roles"]'::jsonb),
 
('manager', 'Can manage teams and tasks',
 '["view_users", "view_teams", "create_team", "update_team", "delete_team", "view_tasks", "create_task", "update_task", "delete_task", "assign_task", "complete_task", "view_reports"]'::jsonb),
 
('developer', 'Can create and work on tasks',
 '["view_users", "view_teams", "view_tasks", "create_task", "update_task", "assign_task", "complete_task"]'::jsonb),
 
('tester', 'Can test and verify tasks',
 '["view_users", "view_teams", "view_tasks", "complete_task"]'::jsonb),
 
('viewer', 'Read-only access',
 '["view_users", "view_teams", "view_tasks"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    updated_at = CURRENT_TIMESTAMP;

-- Insert users with conflict handling
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES
('john.doe', 'john.doe@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'John', 'Doe', true),
('jane.smith', 'jane.smith@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Jane', 'Smith', true),
('bob.johnson', 'bob.johnson@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Bob', 'Johnson', true),
('alice.williams', 'alice.williams@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Alice', 'Williams', true),
('charlie.brown', 'charlie.brown@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Charlie', 'Brown', true),
('diana.prince', 'diana.prince@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Diana', 'Prince', true),
('michael.scott', 'michael.scott@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Michael', 'Scott', true),
('pam.beesly', 'pam.beesly@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Pam', 'Beesly', true),
('jim.halpert', 'jim.halpert@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Jim', 'Halpert', true),
('dwight.schrute', 'dwight.schrute@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Dwight', 'Schrute', true),
('tony.stark', 'tony.stark@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Tony', 'Stark', true),
('steve.rogers', 'steve.rogers@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Steve', 'Rogers', true),
('natasha.romanoff', 'natasha.romanoff@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Natasha', 'Romanoff', true),
('bruce.banner', 'bruce.banner@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Bruce', 'Banner', true),
('thor.odinson', 'thor.odinson@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Thor', 'Odinson', true),
('clint.barton', 'clint.barton@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Clint', 'Barton', true),
('wanda.maximoff', 'wanda.maximoff@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Wanda', 'Maximoff', true),
('peter.parker', 'peter.parker@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Peter', 'Parker', true),
('stephen.strange', 'stephen.strange@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Stephen', 'Strange', true),
('carol.danvers', 'carol.danvers@company.com', '$2b$10$K7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S', 'Carol', 'Danvers', true)
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Assign roles to users (1:1 mapping) with conflict handling
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1),  -- John Doe -> Admin
(2, 2, 1),  -- Jane Smith -> Manager
(3, 3, 1),  -- Bob Johnson -> Developer
(4, 4, 1),  -- Alice Williams -> Tester
(5, 5, 1),  -- Charlie Brown -> Viewer
(6, 3, 2),  -- Diana Prince -> Developer
(7, 2, 1),  -- Michael Scott -> Manager
(8, 5, 1),  -- Pam Beesly -> Viewer
(9, 3, 2),  -- Jim Halpert -> Developer
(10, 5, 1), -- Dwight Schrute -> Viewer
(11, 1, 1), -- Tony Stark -> Admin
(12, 2, 1), -- Steve Rogers -> Manager
(13, 4, 1), -- Natasha Romanoff -> Tester
(14, 3, 2), -- Bruce Banner -> Developer
(15, 5, 1), -- Thor Odinson -> Viewer
(16, 3, 2), -- Clint Barton -> Developer
(17, 4, 1), -- Wanda Maximoff -> Tester
(18, 3, 2), -- Peter Parker -> Developer
(19, 5, 1), -- Stephen Strange -> Viewer
(20, 3, 2)  -- Carol Danvers -> Developer
ON CONFLICT (user_id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    assigned_by = EXCLUDED.assigned_by,
    assigned_at = CURRENT_TIMESTAMP;

-- Insert teams with conflict handling
INSERT INTO teams (name, description, team_lead_id, is_active) VALUES
('Frontend Team', 'Responsible for all frontend development', 2, true),
('Backend Team', 'Responsible for backend API and database', 3, true),
('QA Team', 'Quality Assurance and Testing team', 4, true),
('DevOps Team', 'Infrastructure and DevOps', 1, true),
('Product Team', 'Product management and design', 6, true),
('Mobile Team', 'Mobile app development', 9, true),
('Data Team', 'Data analytics and reporting', 12, true),
('Security Team', 'Security and compliance', 11, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    team_lead_id = EXCLUDED.team_lead_id,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Assign users to teams (M:M relationship) with conflict handling
INSERT INTO team_users (team_id, user_id) VALUES
-- Frontend Team
(1, 1), (1, 2), (1, 3), (1, 8), (1, 9), (1, 18),
-- Backend Team
(2, 1), (2, 3), (2, 6), (2, 14), (2, 16), (2, 20),
-- QA Team
(3, 4), (3, 2), (3, 13), (3, 17),
-- DevOps Team
(4, 1), (4, 5), (4, 10), (4, 15),
-- Product Team
(5, 6), (5, 2), (5, 7), (5, 12),
-- Mobile Team
(6, 9), (6, 18), (6, 20), (6, 11),
-- Data Team
(7, 12), (7, 14), (7, 16), (7, 3),
-- Security Team
(8, 11), (8, 1), (8, 5), (8, 10)
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Insert tasks with conflict handling
INSERT INTO tasks (title, description, team_id, assigned_to, created_by, status, priority, due_date) VALUES
-- Frontend Team Tasks
('Design new landing page', 'Create a modern landing page for the product', 1, 2, 1, 'completed', 'high', '2026-06-15 18:00:00+00'),
('Develop mobile responsive design', 'Ensure all pages work on mobile devices', 1, 2, 1, 'pending', 'low', '2026-08-05 18:00:00+00'),
('Implement dark mode', 'Add dark mode support to the application', 1, 9, 2, 'in_progress', 'medium', '2026-07-25 18:00:00+00'),
('Optimize frontend performance', 'Improve page load times and Core Web Vitals', 1, 18, 2, 'pending', 'high', '2026-07-30 18:00:00+00'),
('Create component library', 'Build reusable React component library', 1, 3, 1, 'completed', 'medium', '2026-06-20 18:00:00+00'),
-- Backend Team Tasks
('Implement user authentication API', 'Build JWT-based authentication endpoints', 2, 3, 1, 'in_progress', 'high', '2026-07-20 18:00:00+00'),
('Optimize database queries', 'Improve query performance for user dashboard', 2, 3, 6, 'in_progress', 'medium', '2026-07-18 18:00:00+00'),
('Build payment integration', 'Integrate Stripe payment gateway', 2, 6, 1, 'pending', 'critical', '2026-08-15 18:00:00+00'),
('Create API documentation', 'Generate OpenAPI/Swagger documentation', 2, 14, 6, 'pending', 'low', '2026-08-01 18:00:00+00'),
('Implement caching layer', 'Add Redis caching for frequently accessed data', 2, 20, 3, 'completed', 'high', '2026-06-30 18:00:00+00'),
-- QA Team Tasks
('Test payment gateway integration', 'Test all payment flows and edge cases', 3, 4, 2, 'pending', 'critical', '2026-07-25 18:00:00+00'),
('Write integration tests', 'Create integration tests for all APIs', 3, 4, 2, 'pending', 'medium', '2026-07-28 18:00:00+00'),
('Perform security audit', 'Run security testing and vulnerability assessment', 3, 13, 1, 'pending', 'high', '2026-08-10 18:00:00+00'),
('Create test automation suite', 'Build automated testing framework', 3, 17, 4, 'completed', 'medium', '2026-06-25 18:00:00+00'),
('Performance testing', 'Load test critical user flows', 3, 4, 2, 'pending', 'medium', '2026-07-30 18:00:00+00'),
-- DevOps Team Tasks
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated deployment', 4, 1, 1, 'completed', 'high', '2026-06-30 18:00:00+00'),
('Deploy to production', 'Plan and execute production deployment', 4, 1, 1, 'pending', 'high', '2026-07-22 18:00:00+00'),
('Implement monitoring', 'Set up application monitoring with Prometheus/Grafana', 4, 5, 1, 'in_progress', 'medium', '2026-07-15 18:00:00+00'),
('Disaster recovery plan', 'Create and test disaster recovery procedures', 4, 10, 1, 'pending', 'low', '2026-08-20 18:00:00+00'),
('Infrastructure as Code', 'Terraform implementation for cloud resources', 4, 15, 1, 'completed', 'high', '2026-06-28 18:00:00+00'),
-- Product Team Tasks
('Create product wireframes', 'Design initial wireframes for new features', 5, 6, 2, 'pending', 'medium', '2026-07-30 18:00:00+00'),
('User feedback analysis', 'Analyze user feedback for Q3 features', 5, 6, 2, 'completed', 'medium', '2026-06-28 18:00:00+00'),
('Product roadmap planning', 'Define Q4 product roadmap', 5, 7, 2, 'in_progress', 'high', '2026-07-20 18:00:00+00'),
('Competitor analysis', 'Research competitor products and features', 5, 12, 6, 'pending', 'low', '2026-08-15 18:00:00+00'),
('User interviews', 'Conduct user interviews for new features', 5, 6, 2, 'completed', 'medium', '2026-06-15 18:00:00+00'),
-- Mobile Team Tasks
('Develop iOS app', 'Build native iOS application', 6, 9, 11, 'in_progress', 'high', '2026-08-15 18:00:00+00'),
('Develop Android app', 'Build native Android application', 6, 18, 11, 'pending', 'high', '2026-08-30 18:00:00+00'),
('Mobile push notifications', 'Implement push notification system', 6, 20, 9, 'pending', 'medium', '2026-07-25 18:00:00+00'),
('Mobile analytics', 'Add analytics tracking to mobile apps', 6, 9, 11, 'completed', 'low', '2026-06-30 18:00:00+00'),
('App store submission', 'Prepare and submit apps to stores', 6, 11, 9, 'pending', 'medium', '2026-09-15 18:00:00+00'),
-- Data Team Tasks
('Build data warehouse', 'Design and implement data warehouse', 7, 12, 3, 'in_progress', 'high', '2026-08-20 18:00:00+00'),
('Create dashboards', 'Build executive and operational dashboards', 7, 14, 12, 'pending', 'medium', '2026-07-30 18:00:00+00'),
('Data migration', 'Migrate legacy data to new system', 7, 16, 12, 'pending', 'high', '2026-08-10 18:00:00+00'),
('ML model development', 'Develop predictive analytics models', 7, 3, 12, 'pending', 'low', '2026-09-01 18:00:00+00'),
('Data governance', 'Implement data governance framework', 7, 12, 1, 'completed', 'medium', '2026-06-25 18:00:00+00'),
-- Security Team Tasks
('Security audit', 'Conduct comprehensive security audit', 8, 11, 1, 'pending', 'critical', '2026-07-20 18:00:00+00'),
('Penetration testing', 'Perform penetration testing', 8, 5, 11, 'in_progress', 'high', '2026-07-15 18:00:00+00'),
('Implement SSO', 'Set up single sign-on with OAuth', 8, 1, 11, 'pending', 'high', '2026-08-25 18:00:00+00'),
('Security training', 'Conduct security awareness training', 8, 10, 11, 'completed', 'medium', '2026-06-20 18:00:00+00'),
('Incident response plan', 'Create security incident response plan', 8, 1, 11, 'pending', 'medium', '2026-08-01 18:00:00+00')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    team_id = EXCLUDED.team_id,
    assigned_to = EXCLUDED.assigned_to,
    created_by = EXCLUDED.created_by,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    due_date = EXCLUDED.due_date,
    updated_at = CURRENT_TIMESTAMP;
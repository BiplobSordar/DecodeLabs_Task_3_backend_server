// Export all auth module components
export { default as AuthController } from './auth.controller.js';
export { default as AuthService } from './auth.service.js';
export { default as authRoutes } from './auth.routes.js';
export * from './auth.validation.js';

// Or export as a single object
import authRoutes from './auth.routes.js';

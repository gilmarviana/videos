// Authentication exports
export { AuthService } from './auth.service';
export { JWTService } from './jwt';
export { PasswordService } from './password';
export { PasswordResetService } from './password-reset.service';
export { AuthMiddleware, createAuthErrorResponse } from './middleware';
export { TrialMiddleware } from './trial-middleware';

// Services
export { TrialSessionService } from '../services/trial-session.service';

// Types
export type { JWTPayload, TokenPair } from './jwt';
export type { AuthResult, AuthError } from './auth.service';
export type { PasswordResetRequest, PasswordResetConfirm } from './password-reset.service';
export type { AuthenticatedRequest } from './middleware';
export type { TrialTrackingSession } from './trial-middleware';
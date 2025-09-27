import { NextRequest } from 'next/server';
import { AuthService } from './auth.service';
import { JWTPayload } from './jwt';

export interface TrialTrackingSession {
  userId: string;
  sessionStart: Date;
  lastActivity: Date;
  accumulatedMinutes: number;
}

// In-memory session tracking (in production, use Redis)
const activeSessions = new Map<string, TrialTrackingSession>();

export class TrialMiddleware {
  /**
   * Start tracking trial usage for a user session
   */
  static async startTrialSession(userId: string): Promise<void> {
    const now = new Date();
    
    // End any existing session for this user
    await this.endTrialSession(userId);
    
    // Start new session
    activeSessions.set(userId, {
      userId,
      sessionStart: now,
      lastActivity: now,
      accumulatedMinutes: 0,
    });
  }

  /**
   * Update trial session activity (called on each request)
   */
  static async updateTrialActivity(userId: string): Promise<void> {
    const session = activeSessions.get(userId);
    if (!session) {
      // Start new session if none exists
      await this.startTrialSession(userId);
      return;
    }

    const now = new Date();
    const timeSinceLastActivity = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60); // minutes

    // Only count time if user was active within the last 5 minutes (prevents idle time counting)
    if (timeSinceLastActivity <= 5) {
      session.accumulatedMinutes += timeSinceLastActivity;
    }

    session.lastActivity = now;
  }

  /**
   * End trial session and save accumulated time to database
   */
  static async endTrialSession(userId: string): Promise<void> {
    const session = activeSessions.get(userId);
    if (!session) {
      return;
    }

    // Calculate final session time
    const now = new Date();
    const sessionDuration = (now.getTime() - session.sessionStart.getTime()) / (1000 * 60); // minutes
    const totalMinutes = Math.min(sessionDuration, session.accumulatedMinutes + 1); // Add 1 minute buffer

    // Get current trial status
    const currentTrialStatus = await AuthService.getTrialStatus(userId);
    const newTotalMinutes = currentTrialStatus.minutesUsed + totalMinutes;

    // Update database with accumulated time
    await AuthService.updateTrialUsage(userId, Math.floor(newTotalMinutes));

    // Remove session
    activeSessions.delete(userId);
  }

  /**
   * Check if user has valid trial or subscription access
   */
  static async checkTrialAccess(payload: JWTPayload): Promise<{
    hasAccess: boolean;
    reason?: string;
    trialStatus?: any;
  }> {
    // Admin users always have access
    if (payload.role === 'admin') {
      return { hasAccess: true };
    }

    // Get current user and trial status
    const user = await AuthService.getCurrentUser(payload.userId);
    const trialStatus = await AuthService.getTrialStatus(payload.userId);

    // Check if user has active subscription
    if (user.subscription && user.subscription.status === 'active') {
      return { hasAccess: true };
    }

    // Check trial status
    if (!trialStatus.isActive) {
      return {
        hasAccess: false,
        reason: 'Trial not started',
        trialStatus,
      };
    }

    if (trialStatus.minutesRemaining <= 0) {
      return {
        hasAccess: false,
        reason: 'Trial expired',
        trialStatus,
      };
    }

    return {
      hasAccess: true,
      trialStatus,
    };
  }

  /**
   * Middleware to track trial usage and check access for content endpoints
   */
  static async requireTrialOrSubscription(payload: JWTPayload): Promise<void> {
    // Update trial activity for students
    if (payload.role === 'student') {
      await this.updateTrialActivity(payload.userId);
    }

    // Check access
    const accessCheck = await this.checkTrialAccess(payload);
    
    if (!accessCheck.hasAccess) {
      const errorMessage = accessCheck.reason === 'Trial expired' 
        ? 'Trial period has expired. Please subscribe to continue accessing content.'
        : 'Trial access required. Please start your trial or subscribe.';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current session info for a user
   */
  static getSessionInfo(userId: string): TrialTrackingSession | null {
    return activeSessions.get(userId) || null;
  }

  /**
   * Clean up inactive sessions (should be called periodically)
   */
  static cleanupInactiveSessions(): void {
    const now = new Date();
    const maxInactiveMinutes = 30;

    for (const [userId, session] of activeSessions.entries()) {
      const inactiveMinutes = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
      
      if (inactiveMinutes > maxInactiveMinutes) {
        this.endTrialSession(userId);
      }
    }
  }
}

// Cleanup inactive sessions every 10 minutes
setInterval(() => {
  TrialMiddleware.cleanupInactiveSessions();
}, 10 * 60 * 1000);
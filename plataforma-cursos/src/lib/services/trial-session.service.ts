import { TrialMiddleware } from '../auth/trial-middleware';
import { AuthService } from '../auth/auth.service';

export interface TrialSessionInfo {
  isActive: boolean;
  sessionStartTime?: Date;
  lastActivity?: Date;
  currentSessionMinutes: number;
  totalTrialMinutes: number;
  remainingMinutes: number;
}

export class TrialSessionService {
  /**
   * Start a new trial session for a user
   */
  static async startSession(userId: string): Promise<TrialSessionInfo> {
    await TrialMiddleware.startTrialSession(userId);
    return this.getSessionInfo(userId);
  }

  /**
   * End the current trial session for a user
   */
  static async endSession(userId: string): Promise<void> {
    await TrialMiddleware.endTrialSession(userId);
  }

  /**
   * Get comprehensive session information
   */
  static async getSessionInfo(userId: string): Promise<TrialSessionInfo> {
    const session = TrialMiddleware.getSessionInfo(userId);
    const trialStatus = await AuthService.getTrialStatus(userId);

    if (!session) {
      return {
        isActive: false,
        currentSessionMinutes: 0,
        totalTrialMinutes: trialStatus.minutesUsed,
        remainingMinutes: trialStatus.minutesRemaining,
      };
    }

    const now = new Date();
    const currentSessionMinutes = (now.getTime() - session.sessionStart.getTime()) / (1000 * 60);

    return {
      isActive: true,
      sessionStartTime: session.sessionStart,
      lastActivity: session.lastActivity,
      currentSessionMinutes: Math.floor(currentSessionMinutes),
      totalTrialMinutes: trialStatus.minutesUsed,
      remainingMinutes: trialStatus.minutesRemaining,
    };
  }

  /**
   * Update trial activity (heartbeat)
   */
  static async updateActivity(userId: string): Promise<TrialSessionInfo> {
    await TrialMiddleware.updateTrialActivity(userId);
    return this.getSessionInfo(userId);
  }

  /**
   * Check if user can access content
   */
  static async checkContentAccess(userId: string): Promise<{
    canAccess: boolean;
    reason?: string;
    sessionInfo: TrialSessionInfo;
  }> {
    const user = await AuthService.getCurrentUser(userId);
    const sessionInfo = await this.getSessionInfo(userId);

    // Admin always has access
    if (user.role === 'admin') {
      return {
        canAccess: true,
        sessionInfo,
      };
    }

    // Check subscription
    if (user.subscription && user.subscription.status === 'active') {
      return {
        canAccess: true,
        sessionInfo,
      };
    }

    // Check trial
    if (sessionInfo.remainingMinutes <= 0) {
      return {
        canAccess: false,
        reason: 'Trial time expired',
        sessionInfo,
      };
    }

    return {
      canAccess: true,
      sessionInfo,
    };
  }
}
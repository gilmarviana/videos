import { NotificationService } from './notification.service';

export class CronService {
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start all cron jobs
   */
  static startAll(): void {
    this.startTrialWarningChecker();
    this.startDailyAdminSummary();
  }

  /**
   * Stop all cron jobs
   */
  static stopAll(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  /**
   * Start trial warning checker (runs every 5 minutes)
   */
  private static startTrialWarningChecker(): void {
    const interval = setInterval(async () => {
      try {
        await NotificationService.checkTrialWarnings();
      } catch (error) {
        console.error('Error in trial warning checker:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.set('trialWarningChecker', interval);
    console.log('✅ Trial warning checker started (runs every 5 minutes)');
  }

  /**
   * Start daily admin summary (runs at 9 AM every day)
   */
  private static startDailyAdminSummary(): void {
    const runDailySummary = async () => {
      const now = new Date();
      const targetHour = 9; // 9 AM
      
      if (now.getHours() === targetHour && now.getMinutes() === 0) {
        try {
          await NotificationService.sendDailyAdminSummary();
        } catch (error) {
          console.error('Error sending daily admin summary:', error);
        }
      }
    };

    // Check every minute to see if it's 9 AM
    const interval = setInterval(runDailySummary, 60 * 1000);
    this.intervals.set('dailyAdminSummary', interval);
    console.log('✅ Daily admin summary started (runs at 9 AM daily)');
  }

  /**
   * Manually trigger trial warning check
   */
  static async triggerTrialWarningCheck(): Promise<void> {
    await NotificationService.checkTrialWarnings();
  }

  /**
   * Manually trigger daily admin summary
   */
  static async triggerDailyAdminSummary(): Promise<void> {
    await NotificationService.sendDailyAdminSummary();
  }
}
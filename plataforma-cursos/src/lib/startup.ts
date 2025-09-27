import { CronService } from './services/cron.service';

/**
 * Initialize application services on startup
 */
export function initializeApp(): void {
  console.log('🚀 Initializing application services...');

  // Start cron jobs for notifications
  CronService.startAll();

  console.log('✅ Application services initialized successfully');
}

/**
 * Cleanup function for graceful shutdown
 */
export function shutdownApp(): void {
  console.log('🛑 Shutting down application services...');

  // Stop all cron jobs
  CronService.stopAll();

  console.log('✅ Application services shut down successfully');
}

// Handle process termination signals
process.on('SIGTERM', shutdownApp);
process.on('SIGINT', shutdownApp);
process.on('SIGUSR2', shutdownApp); // For nodemon restarts
import { db } from '../lib/db/connection';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initializeAnalyticsTables() {
  try {
    console.log('Initializing analytics tables...');
    
    // Read the analytics schema SQL file
    const schemaPath = join(process.cwd(), 'src/lib/db/analytics-schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    // Execute the schema creation
    await db.query(schemaSql);
    
    console.log('Analytics tables created successfully!');
    
    // Initialize some sample data for testing
    console.log('Initializing sample analytics data...');
    
    // Sample user analytics events
    await db.query(`
      INSERT INTO user_analytics (user_id, event_type, event_data, created_at)
      SELECT 
        u.id,
        'login',
        '{"timestamp": "' || NOW() || '"}',
        NOW() - INTERVAL '1 day' * (random() * 30)
      FROM users u
      WHERE u.role = 'student'
      LIMIT 10
      ON CONFLICT DO NOTHING
    `);
    
    // Sample course analytics
    await db.query(`
      INSERT INTO course_analytics (course_id, date, views, unique_viewers, total_watch_time_seconds)
      SELECT 
        c.id,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
        (random() * 100)::integer,
        (random() * 50)::integer,
        (random() * 3600)::integer
      FROM courses c
      WHERE c.is_active = true
      ON CONFLICT (course_id, date) DO NOTHING
    `);
    
    // Sample daily metrics
    await db.query(`
      INSERT INTO daily_metrics (date, total_users, active_users, trial_users, subscribed_users, new_registrations, revenue)
      SELECT 
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
        (random() * 1000)::integer,
        (random() * 500)::integer,
        (random() * 100)::integer,
        (random() * 200)::integer,
        (random() * 20)::integer,
        (random() * 5000)::numeric(10,2)
      ON CONFLICT (date) DO NOTHING
    `);
    
    // Sample user engagement
    await db.query(`
      INSERT INTO user_engagement (user_id, date, session_duration_seconds, videos_watched, lessons_completed)
      SELECT 
        u.id,
        CURRENT_DATE - INTERVAL '1 day' * (random() * 30),
        (random() * 7200)::integer,
        (random() * 10)::integer,
        (random() * 5)::integer
      FROM users u
      WHERE u.role = 'student'
      LIMIT 50
      ON CONFLICT (user_id, date) DO NOTHING
    `);
    
    console.log('Sample analytics data initialized successfully!');
    
  } catch (error) {
    console.error('Error initializing analytics tables:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeAnalyticsTables()
    .then(() => {
      console.log('Analytics initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Analytics initialization failed:', error);
      process.exit(1);
    });
}

export { initializeAnalyticsTables };
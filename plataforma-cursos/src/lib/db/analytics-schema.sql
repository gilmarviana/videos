-- Analytics and reporting tables

-- User behavior tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'video_start', 'video_pause', 'video_complete', 'course_start', 'lesson_complete', 'quiz_attempt'
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course popularity and engagement metrics
CREATE TABLE IF NOT EXISTS course_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_watch_time_seconds INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, date)
);

-- Daily platform metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    trial_users INTEGER DEFAULT 0,
    subscribed_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    trial_conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    total_watch_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- User engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_duration_seconds INTEGER DEFAULT 0,
    videos_watched INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    courses_started INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    quiz_attempts INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    subscription_revenue DECIMAL(10,2) DEFAULT 0.00,
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0.00,
    mrr DECIMAL(10,2) DEFAULT 0.00, -- Monthly Recurring Revenue
    arr DECIMAL(10,2) DEFAULT 0.00, -- Annual Recurring Revenue
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_analytics_date ON course_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_date ON user_engagement(date);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);
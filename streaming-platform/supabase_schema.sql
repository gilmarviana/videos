-- StreamFlix - Complete Supabase Schema
-- Execute these commands in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
-- This ensures users can only access their own data

-- Create custom user profiles table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    subscription_plan TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    free_trial_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    max_screens INTEGER NOT NULL DEFAULT 1,
    video_quality TEXT NOT NULL DEFAULT 'HD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    video_url TEXT NOT NULL,
    genres TEXT[] NOT NULL DEFAULT '{}',
    release_year INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    rating TEXT,
    is_exclusive BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    genres TEXT[] NOT NULL DEFAULT '{}',
    release_year INTEGER NOT NULL,
    rating TEXT,
    is_exclusive BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasons table
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(series_id, season_number)
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, episode_number)
);

-- Create watch history table
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL, -- can reference movies or episodes
    content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
    watch_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    total_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, content_type)
);

-- Create active watching sessions table (for real-time monitoring)
CREATE TABLE IF NOT EXISTS public.active_watching (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, content_type)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, features, max_screens, video_quality) VALUES
('Básico', 19.90, ARRAY['HD disponível', '1 tela simultânea', 'Smartphones e tablets'], 1, 'HD'),
('Padrão', 27.90, ARRAY['Full HD disponível', '2 telas simultâneas', 'Smartphones, tablets e computadores'], 2, 'Full HD'),
('Premium', 37.90, ARRAY['4K + HDR disponível', '4 telas simultâneas', 'Todos os dispositivos', 'Conteúdo exclusivo'], 4, '4K')
ON CONFLICT DO NOTHING;

-- Insert sample movies
INSERT INTO public.movies (title, description, cover_image, video_url, genres, release_year, duration, rating, is_exclusive) VALUES
(
    'Ação Explosiva',
    'Um thriller de ação repleto de adrenalina sobre um agente especial que deve impedir um ataque terrorista.',
    'https://picsum.photos/300/450?random=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ARRAY['Ação', 'Thriller'],
    2023,
    120,
    '16+',
    true
),
(
    'Romance de Verão',
    'Uma comédia romântica sobre dois estranhos que se conhecem durante uma viagem de verão.',
    'https://picsum.photos/300/450?random=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ARRAY['Romance', 'Comédia'],
    2023,
    95,
    'Livre',
    false
),
(
    'Mistério da Cidade',
    'Um detetive investiga uma série de crimes misteriosos em uma cidade sombria.',
    'https://picsum.photos/300/450?random=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ARRAY['Mistério', 'Drama'],
    2022,
    110,
    '14+',
    false
)
ON CONFLICT DO NOTHING;

-- Insert sample series
INSERT INTO public.series (title, description, cover_image, genres, release_year, rating, is_exclusive) VALUES
(
    'Aventuras Espaciais',
    'Uma épica jornada pelo espaço com uma tripulação corajosa explorando galáxias distantes.',
    'https://picsum.photos/300/450?random=4',
    ARRAY['Ficção Científica', 'Aventura'],
    2023,
    '12+',
    true
),
(
    'Drama Familiar',
    'A história emocionante de uma família enfrentando desafios e descobrindo o verdadeiro significado do amor.',
    'https://picsum.photos/300/450?random=5',
    ARRAY['Drama', 'Família'],
    2022,
    'Livre',
    false
)
ON CONFLICT DO NOTHING;

-- Insert sample seasons (for the series we just created)
DO $$
DECLARE 
    series_id_1 UUID;
    series_id_2 UUID;
    season_id_1 UUID;
    season_id_2 UUID;
BEGIN
    -- Get series IDs
    SELECT id INTO series_id_1 FROM public.series WHERE title = 'Aventuras Espaciais' LIMIT 1;
    SELECT id INTO series_id_2 FROM public.series WHERE title = 'Drama Familiar' LIMIT 1;
    
    -- Insert seasons
    INSERT INTO public.seasons (series_id, season_number, title, description) VALUES
    (series_id_1, 1, 'Primeira Temporada', 'O início da jornada espacial'),
    (series_id_2, 1, 'Primeira Temporada', 'Os primeiros desafios da família')
    ON CONFLICT DO NOTHING;
    
    -- Get season IDs
    SELECT id INTO season_id_1 FROM public.seasons WHERE series_id = series_id_1 AND season_number = 1;
    SELECT id INTO season_id_2 FROM public.seasons WHERE series_id = series_id_2 AND season_number = 1;
    
    -- Insert sample episodes
    INSERT INTO public.episodes (season_id, episode_number, title, description, video_url, duration) VALUES
    (season_id_1, 1, 'O Começo', 'A tripulação embarca em sua primeira missão espacial.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 45),
    (season_id_1, 2, 'Novos Mundos', 'Descoberta de um planeta habitável.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 50),
    (season_id_1, 3, 'Conflito', 'A tripulação enfrenta uma ameaça alienígena.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 48),
    (season_id_2, 1, 'Novos Começos', 'A família se muda para uma nova cidade.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 42),
    (season_id_2, 2, 'Adaptação', 'Cada membro da família enfrenta seus próprios desafios.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 44),
    (season_id_2, 3, 'União', 'A família se une para superar as dificuldades.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 46)
    ON CONFLICT DO NOTHING;
END $$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_watching ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow user creation during signup
CREATE POLICY "Enable insert for users during signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscription plans are viewable by all authenticated users
CREATE POLICY "Subscription plans are viewable by authenticated users" ON public.subscription_plans
    FOR SELECT TO authenticated USING (true);

-- Content is viewable by all authenticated users
CREATE POLICY "Movies are viewable by authenticated users" ON public.movies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Series are viewable by authenticated users" ON public.series
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Seasons are viewable by authenticated users" ON public.seasons
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Episodes are viewable by authenticated users" ON public.episodes
    FOR SELECT TO authenticated USING (true);

-- Watch history is private to each user
CREATE POLICY "Users can view own watch history" ON public.watch_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history" ON public.watch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history" ON public.watch_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history" ON public.watch_history
    FOR DELETE USING (auth.uid() = user_id);

-- Active watching sessions are private to each user
CREATE POLICY "Users can view own active sessions" ON public.active_watching
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active sessions" ON public.active_watching
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active sessions" ON public.active_watching
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own active sessions" ON public.active_watching
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (add admin email here)
-- Replace 'admin@streaming.com' with your actual admin email

-- Allow admin to do everything
CREATE POLICY "Admin full access to all tables" ON public.movies
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

CREATE POLICY "Admin full access to series" ON public.series
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

CREATE POLICY "Admin full access to seasons" ON public.seasons
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

CREATE POLICY "Admin full access to episodes" ON public.episodes
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_genres ON public.movies USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_series_genres ON public.series USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON public.movies (release_year);
CREATE INDEX IF NOT EXISTS idx_series_release_year ON public.series (release_year);
CREATE INDEX IF NOT EXISTS idx_movies_views ON public.movies (views_count DESC);
CREATE INDEX IF NOT EXISTS idx_series_views ON public.series (views_count DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_views ON public.episodes (views_count DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.watch_history (user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content ON public.watch_history (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_active_watching_user ON public.active_watching (user_id);
CREATE INDEX IF NOT EXISTS idx_seasons_series ON public.seasons (series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON public.episodes (season_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON public.seasons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON public.episodes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON public.watch_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, free_trial_expires_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
        NOW() + INTERVAL '3 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up old active watching sessions
CREATE OR REPLACE FUNCTION cleanup_active_watching()
RETURNS void AS $$
BEGIN
    DELETE FROM public.active_watching 
    WHERE last_ping < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create a view for analytics
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE subscription_expires_at > NOW()) as active_subscribers,
    (SELECT COUNT(*) FROM public.users WHERE free_trial_expires_at > NOW() AND subscription_expires_at IS NULL) as trial_users,
    (SELECT COUNT(*) FROM public.movies) as total_movies,
    (SELECT COUNT(*) FROM public.series) as total_series,
    (SELECT COUNT(*) FROM public.episodes) as total_episodes,
    (SELECT COUNT(*) FROM public.active_watching WHERE last_ping > NOW() - INTERVAL '5 minutes') as currently_watching;

-- Grant permissions for the analytics view
GRANT SELECT ON public.analytics_summary TO authenticated;

-- Create RLS policy for analytics view (admin only)
CREATE POLICY "Admin can view analytics" ON public.analytics_summary
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND email = 'admin@streaming.com'
        )
    );

-- Function to get user's content access
CREATE OR REPLACE FUNCTION public.user_can_access_content(user_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_id
        AND (
            u.subscription_expires_at > NOW()
            OR u.free_trial_expires_at > NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track active watching
CREATE OR REPLACE FUNCTION public.track_active_watching(
    p_user_id UUID,
    p_content_id UUID,
    p_content_type TEXT
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.active_watching (user_id, content_id, content_type, started_at, last_ping)
    VALUES (p_user_id, p_content_id, p_content_type, NOW(), NOW())
    ON CONFLICT (user_id, content_id, content_type)
    DO UPDATE SET last_ping = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.user_can_access_content(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_active_watching(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_active_watching() TO authenticated;
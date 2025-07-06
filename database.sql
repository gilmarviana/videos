-- ============================================================================
-- StreamFlix Database Setup for Supabase
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase para configurar o banco
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_type TEXT DEFAULT 'monthly' CHECK (duration_type IN ('monthly', 'quarterly', 'yearly')),
    includes_vip BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    active BOOLEAN DEFAULT true,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_trial BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category_id UUID REFERENCES public.categories(id),
    is_vip BOOLEAN DEFAULT false,
    duration TEXT,
    release_year INTEGER,
    cast TEXT,
    director TEXT,
    genre TEXT,
    rating TEXT,
    trailer_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watch_history table
CREATE TABLE public.watch_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Subscription plans policies  
CREATE POLICY "Subscription plans are viewable by everyone" 
ON public.subscription_plans FOR SELECT 
USING (active = true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage categories" 
ON public.categories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Videos policies
CREATE POLICY "Videos are viewable by everyone" 
ON public.videos FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage videos" 
ON public.videos FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Watch history policies
CREATE POLICY "Users can view their own watch history" 
ON public.watch_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" 
ON public.watch_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" 
ON public.watch_history FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_type, includes_vip) VALUES
('Básico Mensal', 'Acesso ao catálogo básico com qualidade HD', 19.90, 'monthly', false),
('VIP Mensal', 'Acesso completo incluindo conteúdo VIP e qualidade 4K', 39.90, 'monthly', true),
('Básico Trimestral', 'Acesso ao catálogo básico com qualidade HD (3 meses)', 49.90, 'quarterly', false),
('VIP Trimestral', 'Acesso completo incluindo conteúdo VIP e qualidade 4K (3 meses)', 99.90, 'quarterly', true),
('Básico Anual', 'Acesso ao catálogo básico com qualidade HD (12 meses)', 179.90, 'yearly', false),
('VIP Anual', 'Acesso completo incluindo conteúdo VIP e qualidade 4K (12 meses)', 359.90, 'yearly', true);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Filmes', 'Filmes de diversos gêneros'),
('Séries', 'Séries e temporadas completas'),
('Documentários', 'Documentários educativos e informativos'),
('Canais', 'Conteúdo de canais e creators'),
('Infantil', 'Conteúdo adequado para crianças'),
('Ação', 'Filmes e séries de ação'),
('Drama', 'Dramas e melodramas'),
('Comédia', 'Comédias e humor'),
('Terror', 'Filmes de terror e suspense'),
('Ficção Científica', 'Sci-fi e fantasia'),
('Romance', 'Filmes e séries românticos'),
('Aventura', 'Aventuras e exploração'),
('Animação', 'Filmes e séries animados'),
('Biografia', 'Biografias e histórias reais'),
('Esporte', 'Conteúdo esportivo e competições');

-- ============================================================================
-- DEMO DATA (opcional - para testes)
-- ============================================================================

-- Alguns vídeos de exemplo (URLs públicas para demonstração)
INSERT INTO public.videos (title, description, url, thumbnail_url, category_id, is_vip, duration, release_year, genre, rating) 
SELECT 
    'Big Buck Bunny',
    'Um curta-metragem de animação 3D de código aberto.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    id,
    false,
    '10 min',
    2008,
    'Animação, Comédia',
    'Livre'
FROM public.categories WHERE name = 'Animação' LIMIT 1;

INSERT INTO public.videos (title, description, url, thumbnail_url, category_id, is_vip, duration, release_year, genre, rating) 
SELECT 
    'Elephant Dream',
    'Primeiro filme de animação 3D de código aberto do mundo.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    id,
    true,
    '11 min',
    2006,
    'Animação, Sci-Fi',
    'Livre'
FROM public.categories WHERE name = 'Ficção Científica' LIMIT 1;

INSERT INTO public.videos (title, description, url, thumbnail_url, category_id, is_vip, duration, release_year, genre, rating) 
SELECT 
    'Sintel',
    'Uma história épica sobre uma garota em busca de seu dragão perdido.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    id,
    false,
    '15 min',
    2010,
    'Animação, Aventura',
    'Livre'
FROM public.categories WHERE name = 'Aventura' LIMIT 1;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX idx_videos_category_id ON public.videos(category_id);
CREATE INDEX idx_videos_is_vip ON public.videos(is_vip);
CREATE INDEX idx_videos_active ON public.videos(active);
CREATE INDEX idx_videos_created_at ON public.videos(created_at);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(active);
CREATE INDEX idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX idx_watch_history_video_id ON public.watch_history(video_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- VIEWS FOR EASIER QUERIES
-- ============================================================================

-- View for active videos with category information
CREATE VIEW public.active_videos AS
SELECT 
    v.*,
    c.name as category_name,
    c.description as category_description
FROM public.videos v
LEFT JOIN public.categories c ON v.category_id = c.id
WHERE v.active = true;

-- View for user subscriptions with plan details
CREATE VIEW public.user_subscriptions AS
SELECT 
    s.*,
    sp.name as plan_name,
    sp.description as plan_description,
    sp.price as plan_price,
    sp.duration_type as plan_duration_type,
    sp.includes_vip as plan_includes_vip
FROM public.subscriptions s
JOIN public.subscription_plans sp ON s.plan_id = sp.id
WHERE s.active = true;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'StreamFlix Database Setup Completed Successfully!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables created: profiles, subscription_plans, subscriptions, categories, videos, watch_history';
    RAISE NOTICE 'Policies created: Row Level Security enabled for all tables';
    RAISE NOTICE 'Sample data inserted: subscription plans, categories, and demo videos';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure your .env file with Supabase credentials';
    RAISE NOTICE '2. Run: npm install && npm run dev';
    RAISE NOTICE '3. Create admin user and start adding content!';
    RAISE NOTICE '============================================================================';
END $$;
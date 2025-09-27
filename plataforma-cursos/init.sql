-- Initial database setup
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    trial_start_time TIMESTAMP,
    trial_minutes_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    payment_gateway_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    video_source VARCHAR(20) CHECK (video_source IN ('google_drive', 'onedrive', 'direct')),
    video_format VARCHAR(10) CHECK (video_format IN ('mp4', 'avi', 'mov', 'mkv', 'ts', 'webm')),
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    materials JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Course completion tracking table
CREATE TABLE IF NOT EXISTS course_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_percentage DECIMAL(5,2) DEFAULT 100.00,
    UNIQUE(user_id, course_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    quiz_type VARCHAR(10) NOT NULL CHECK (quiz_type IN ('lesson', 'module', 'course')),
    questions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quiz_target_check CHECK (
        (quiz_type = 'lesson' AND lesson_id IS NOT NULL AND module_id IS NULL AND course_id IS NULL) OR
        (quiz_type = 'module' AND lesson_id IS NULL AND module_id IS NOT NULL AND course_id IS NULL) OR
        (quiz_type = 'course' AND lesson_id IS NULL AND module_id IS NULL AND course_id IS NOT NULL)
    )
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '[]',
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_url VARCHAR(500),
    average_quiz_score DECIMAL(5,2),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    share_token VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning path courses table
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    UNIQUE(learning_path_id, course_id)
);

-- WhatsApp configuration table
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    welcome_message TEXT NOT NULL,
    menu_options JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('site_visit', 'trial_generated', 'module_completed', 'certificate_generated')),
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing page content table
CREATE TABLE IF NOT EXISTS landing_page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(50) NOT NULL CHECK (section IN ('hero', 'features', 'testimonials', 'pricing', 'faq', 'about')),
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_course_id ON user_favorites(course_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_user_id ON course_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_share_token ON learning_paths(share_token);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_path_id ON learning_path_courses(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_course_id ON learning_path_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_order ON learning_path_courses(learning_path_id, order_index);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_active ON whatsapp_config(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_triggered_at ON webhook_logs(triggered_at);
CREATE INDEX IF NOT EXISTS idx_landing_page_content_section ON landing_page_content(section);
CREATE INDEX IF NOT EXISTS idx_landing_page_content_active ON landing_page_content(is_active);

-- Create initial admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@plataforma.com', '$2b$12$jAg/0BOi/2O11gigl29bJ.isOHP6NzTRXRA7aCaYfGoiuKeAwOlNG', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert initial landing page content
INSERT INTO landing_page_content (section, content) VALUES 
('hero', '{
    "title": "Aprenda Novas Habilidades com Nossos Cursos Online",
    "subtitle": "Acesso ilimitado a centenas de cursos por apenas R$ 30/mês",
    "description": "Comece agora com 4 horas grátis para testar nossa plataforma",
    "buttonText": "Começar Teste Gratuito",
    "backgroundImage": "/images/hero-bg.jpg",
    "features": ["4 horas grátis", "Acesso ilimitado", "Certificados", "Suporte 24/7"]
}'),
('features', '{
    "title": "Por que escolher nossa plataforma?",
    "subtitle": "Recursos que fazem a diferença no seu aprendizado",
    "items": [
        {
            "title": "Conteúdo de Qualidade",
            "description": "Cursos criados por especialistas da área",
            "icon": "star"
        },
        {
            "title": "Aprenda no seu Ritmo",
            "description": "Acesse quando e onde quiser, 24/7",
            "icon": "clock"
        },
        {
            "title": "Certificados Reconhecidos",
            "description": "Comprove suas habilidades com certificados",
            "icon": "certificate"
        },
        {
            "title": "Suporte Especializado",
            "description": "Tire suas dúvidas com nossa equipe",
            "icon": "support"
        }
    ]
}'),
('testimonials', '{
    "title": "O que nossos alunos dizem",
    "subtitle": "Histórias reais de transformação",
    "items": [
        {
            "name": "Maria Silva",
            "role": "Desenvolvedora",
            "content": "Os cursos me ajudaram a conseguir minha primeira vaga como desenvolvedora. Conteúdo excelente!",
            "rating": 5,
            "avatar": "/images/testimonial-1.jpg"
        },
        {
            "name": "João Santos",
            "role": "Designer",
            "content": "Plataforma incrível! Aprendi muito e já estou aplicando no meu trabalho.",
            "rating": 5,
            "avatar": "/images/testimonial-2.jpg"
        },
        {
            "name": "Ana Costa",
            "role": "Empreendedora",
            "content": "Recomendo para todos que querem se capacitar. Vale muito a pena!",
            "rating": 5,
            "avatar": "/images/testimonial-3.jpg"
        }
    ]
}'),
('pricing', '{
    "title": "Planos que cabem no seu bolso",
    "subtitle": "Escolha o melhor plano para você",
    "plans": [
        {
            "name": "Teste Gratuito",
            "price": "0",
            "period": "4 horas",
            "description": "Experimente nossa plataforma",
            "features": ["Acesso limitado", "4 horas de conteúdo", "Suporte básico"],
            "buttonText": "Começar Agora",
            "highlighted": false
        },
        {
            "name": "Plano Mensal",
            "price": "30",
            "period": "mês",
            "description": "Acesso completo à plataforma",
            "features": ["Acesso ilimitado", "Todos os cursos", "Certificados", "Suporte prioritário"],
            "buttonText": "Assinar Agora",
            "highlighted": true
        }
    ]
}'),
('faq', '{
    "title": "Perguntas Frequentes",
    "subtitle": "Tire suas dúvidas sobre nossa plataforma",
    "items": [
        {
            "question": "Como funciona o teste gratuito?",
            "answer": "Você tem 4 horas de acesso gratuito para explorar nossos cursos e decidir se quer assinar."
        },
        {
            "question": "Posso cancelar a qualquer momento?",
            "answer": "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais."
        },
        {
            "question": "Os certificados são reconhecidos?",
            "answer": "Nossos certificados são digitais e podem ser compartilhados em redes profissionais como LinkedIn."
        },
        {
            "question": "Há suporte técnico disponível?",
            "answer": "Sim, oferecemos suporte via WhatsApp e email para todos os nossos alunos."
        }
    ]
}')
ON CONFLICT (section) DO NOTHING;
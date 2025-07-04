# StreamFlix - Plataforma de Streaming

Uma plataforma de streaming completa como o Netflix, desenvolvida com React, Vite e Supabase.

## 🎬 Características

- **Interface moderna**: Design responsivo inspirado no Netflix
- **Sistema de autenticação**: Login/registro com Supabase Auth
- **Planos de assinatura**: Básico e VIP com diferentes permissões
- **Player de vídeo universal**: Suporte a múltiplas fontes de vídeo
- **Painel administrativo**: Gerenciamento completo de conteúdo
- **PWA**: Aplicação Progressive Web App para instalação
- **Responsivo**: Otimizado para desktop e mobile

## 🚀 Funcionalidades

### Para Usuários
- ✅ Cadastro e login de usuários
- ✅ Escolha de planos de assinatura (Básico/VIP)
- ✅ Navegação por categorias (Filmes, Séries, Canais, VIP)
- ✅ Busca de conteúdo
- ✅ Player de vídeo com controles personalizados
- ✅ Histórico de visualização
- ✅ Interface responsiva

### Para Administradores
- ✅ Painel administrativo completo
- ✅ Gerenciamento de vídeos (CRUD)
- ✅ Gerenciamento de categorias
- ✅ Controle de acesso por plano
- ✅ Estatísticas em tempo real
- ✅ Upload de múltiplas fontes de vídeo

### Fontes de Vídeo Suportadas
- 🎥 **YouTube** - Links diretos e embeds
- 💾 **Google Drive** - Arquivos hospedados no Drive
- ☁️ **OneDrive** - Arquivos da Microsoft
- 🎬 **Vimeo** - Vídeos do Vimeo
- 🐼 **Panda Video** - Plataforma Panda
- 📹 **Arquivos diretos** - MP4, MKV, TS, AVI, MOV, WebM

## 🛠️ Tecnologias

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Roteamento**: React Router v7
- **Estado**: React Context API
- **Ícones**: Heroicons
- **PWA**: Service Workers, Web App Manifest

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/streamflix.git
cd streamflix
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o arquivo `.env.example` para `.env`
3. Adicione suas credenciais:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configure o banco de dados

Execute o SQL fornecido no final desta documentação no editor SQL do Supabase.

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🗄️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── admin/          # Componentes do painel admin
│   ├── auth/           # Componentes de autenticação  
│   ├── client/         # Componentes do cliente
│   └── shared/         # Componentes compartilhados
├── context/            # Contextos React
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
│   ├── admin/          # Páginas administrativas
│   ├── auth/           # Páginas de autenticação
│   └── client/         # Páginas do cliente
├── services/           # Serviços (Supabase, APIs)
├── utils/              # Utilitários e helpers
└── types/              # Tipos TypeScript (se usar)
```

## 👥 Usuários Demo

Para testar o sistema, você pode criar usuários demo:

**Administrador:**
- Email: admin@demo.com
- Senha: admin123
- Role: admin

**Cliente:**
- Email: user@demo.com  
- Senha: user123
- Role: client

## 🎯 Como Usar

### Para Administradores

1. **Login**: Use as credenciais de admin
2. **Acessar painel**: Navegue para `/admin`
3. **Adicionar vídeos**: 
   - Clique em "Adicionar Vídeo"
   - Cole a URL do vídeo (YouTube, Drive, etc.)
   - Preencha as informações
   - Defina se é conteúdo VIP
4. **Gerenciar categorias**: Crie e organize categorias
5. **Monitorar**: Veja estatísticas na visão geral

### Para Usuários

1. **Registro**: Crie uma conta escolhendo um plano
2. **Login**: Entre com suas credenciais
3. **Navegar**: Use as categorias ou busca
4. **Assistir**: Clique em um vídeo para reproduzir
5. **Histórico**: Veja o que assistiu recentemente

## 🔒 Permissões

### Plano Básico
- Acesso a conteúdo básico
- Qualidade HD
- 2 dispositivos simultâneos

### Plano VIP  
- Acesso a todo conteúdo
- Conteúdo VIP exclusivo
- Qualidade 4K
- 4 dispositivos simultâneos

## 📱 PWA (Progressive Web App)

O StreamFlix é uma PWA completa:

- **Instalável**: Pode ser instalado no dispositivo
- **Offline**: Funciona sem internet (cache básico)
- **Notificações**: Suporte a push notifications
- **Responsivo**: Adapta-se a qualquer tela

### Instalação PWA

1. Abra o site no navegador
2. Clique no ícone de "Instalar app" na barra de endereços
3. Confirme a instalação
4. Use como app nativo!

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 🚀 Deploy

### Netlify/Vercel
1. Faça o build: `npm run build`
2. Suba a pasta `dist/`
3. Configure as variáveis de ambiente

### Configurações necessárias
- Redirecionar todas as rotas para `index.html` (SPA)
- Configurar variáveis de ambiente do Supabase

## 🎨 Customização

### Cores (TailwindCSS)
As cores do Netflix estão definidas em `tailwind.config.js`:

```js
netflix: {
  red: '#E50914',
  black: '#000000', 
  darkGray: '#141414',
  mediumGray: '#2F2F2F',
  lightGray: '#B3B3B3',
}
```

### Componentes
Todos os componentes seguem o padrão do design system do Netflix.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto é licenciado sob a MIT License.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato: contato@streamflix.com

---

## 📊 SQL do Banco de Dados

Execute este SQL no Supabase para configurar o banco:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscription plans policies  
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (active = true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Videos policies
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (active = true);
CREATE POLICY "Only admins can manage videos" ON public.videos FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Watch history policies
CREATE POLICY "Users can view their own watch history" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watch history" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watch history" ON public.watch_history FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_type, includes_vip) VALUES
('Básico Mensal', 'Acesso ao catálogo básico com qualidade HD', 19.90, 'monthly', false),
('VIP Mensal', 'Acesso completo incluindo conteúdo VIP e qualidade 4K', 39.90, 'monthly', true),
('Básico Trimestral', 'Acesso ao catálogo básico com qualidade HD (3 meses)', 49.90, 'quarterly', false),
('VIP Trimestral', 'Acesso completo incluindo conteúdo VIP e qualidade 4K (3 meses)', 99.90, 'quarterly', true);

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
('Ficção Científica', 'Sci-fi e fantasia');

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
```

Este SQL criará toda a estrutura necessária para o funcionamento do StreamFlix!

## 🎉 Conclusão

O StreamFlix é uma plataforma completa de streaming que oferece:

- ✅ Sistema robusto de autenticação e autorização
- ✅ Gerenciamento flexível de conteúdo
- ✅ Suporte a múltiplas fontes de vídeo
- ✅ Interface moderna e responsiva
- ✅ Funcionalidades PWA
- ✅ Painel administrativo completo

Perfeito para criar sua própria plataforma de streaming! 🚀

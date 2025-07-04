# StreamFlix - Plataforma de Streaming Completa

Uma plataforma de streaming moderna e escalável, similar à Netflix e Amazon Prime Video, desenvolvida com React, TypeScript e Supabase.

## 🚀 Funcionalidades Principais

### 👤 Sistema de Usuários
- **Autenticação completa**: Registro, login e logout
- **Teste gratuito**: 3 dias de acesso grátis para novos usuários
- **Perfis de usuário**: Edição de informações pessoais
- **Histórico de visualização**: Continuar assistindo onde parou

### 📺 Conteúdo
- **Filmes e Séries**: Catálogo completo organizado
- **Múltiplas fontes de vídeo**: 
  - YouTube
  - Google Drive
  - OneDrive
  - Arquivos diretos (MP4, MKV, TS)
- **Conteúdo exclusivo**: Filmes e séries premium
- **Carrosséis dinâmicos**: Lançamentos, populares, exclusivos

### 💳 Sistema de Assinatura
- **Múltiplos planos**: Básico, Padrão e Premium
- **Diferentes benefícios**: Qualidade de vídeo, telas simultâneas
- **Período de teste**: 3 dias gratuitos

### 🎬 Player de Vídeo Avançado
- **Controles completos**: Play/pause, volume, qualidade
- **Tela cheia**: Suporte completo
- **Múltiplas velocidades**: 0.5x até 2x
- **Atalhos de teclado**: Espaço, setas, F, M
- **Rastreamento de progresso**: Salva automaticamente onde parou

### 🔐 Painel Administrativo
- **Gerenciamento de conteúdo**: Adicionar/editar filmes e séries
- **Gestão de usuários**: Visualizar e gerenciar assinantes
- **Analytics em tempo real**: Estatísticas de uso e engajamento
- **Monitoramento de sessões**: Quem está assistindo no momento

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI/UX**: Material-UI (MUI) com tema dark
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Player de Vídeo**: React Player
- **Roteamento**: React Router DOM
- **Carrosséis**: Swiper.js
- **Charts**: Chart.js + React Chart.js 2

## 📦 Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone <seu-repositorio>
cd streaming-platform
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e a Anon Key do projeto

#### 3.2 Configure as Variáveis de Ambiente
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais:
```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-anon-key
```

#### 3.3 Execute o Schema SQL
1. Abra o Supabase Dashboard
2. Vá para "SQL Editor"
3. Copie e execute todo o conteúdo do arquivo `supabase_schema.sql`
4. Aguarde a execução completa (pode levar alguns minutos)

### 4. Inicie o Servidor de Desenvolvimento
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 👥 Como Usar

### 1. Registro de Usuário
- Acesse a página inicial
- Clique em "Cadastrar"
- Preencha os dados e crie sua conta
- Automaticamente você terá 3 dias de teste gratuito

### 2. Navegação
- **Início**: Carrosséis com conteúdo organizado
- **Filmes**: Catálogo completo de filmes
- **Séries**: Catálogo completo de séries
- **Exclusivos**: Conteúdo premium

### 3. Assistindo Conteúdo
- Clique em qualquer filme/série
- Use os controles do player:
  - **Espaço**: Play/Pause
  - **Setas**: Avançar/Retroceder 10s
  - **F**: Tela cheia
  - **M**: Mute/Unmute

### 4. Administração (Admin)
Para acessar o painel administrativo:
1. Crie uma conta com o email `admin@streaming.com`
2. Acesse `/admin` após o login
3. Gerencie conteúdo, usuários e veja analytics

## 🎨 Personalização

### Temas e Cores
O tema principal usa a paleta de cores da Netflix:
- **Primário**: #e50914 (vermelho Netflix)
- **Fundo**: #000000 (preto)
- **Secundário**: #ffffff (branco)

Para personalizar, edite o arquivo `src/App.tsx` na seção `darkTheme`.

### Adicionando Conteúdo
1. Acesse o painel admin (`/admin`)
2. Vá para a aba "Filmes" ou "Séries"
3. Clique em "Adicionar"
4. Preencha os dados e URLs dos vídeos

### Fontes de Vídeo Suportadas
- **YouTube**: Cole o URL direto do vídeo
- **Google Drive**: 
  1. Compartilhe o arquivo
  2. Copie o link de compartilhamento
  3. Cole no campo URL do vídeo
- **OneDrive**: Similar ao Google Drive
- **Arquivos diretos**: URLs diretas para .mp4, .mkv, .ts

## 📊 Analytics e Monitoramento

O sistema inclui analytics em tempo real:
- **Usuários totais e ativos**
- **Conversão de teste para assinatura**
- **Conteúdo mais assistido**
- **Sessões ativas no momento**

## 🔒 Segurança

- **Row Level Security (RLS)**: Implementado em todas as tabelas
- **Autenticação JWT**: Gerenciada pelo Supabase
- **Políticas de acesso**: Usuários só acessam seus próprios dados
- **Admin protegido**: Apenas email específico tem acesso admin

## 🚀 Deploy em Produção

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload da pasta build/ para o Netlify
```

### Configurações Importantes para Produção
1. Configure as variáveis de ambiente no provedor de hosting
2. Atualize o email do admin no schema SQL se necessário
3. Configure domínio personalizado no Supabase
4. Ative HTTPS e configure CORS

## 📱 Design Responsivo

A aplicação é totalmente responsiva e funciona em:
- **Desktop**: Experiência completa
- **Tablet**: Interface adaptada
- **Mobile**: Navegação otimizada

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.tsx      # Navegação principal
│   ├── ContentCarousel.tsx # Carrosséis de conteúdo
│   ├── FeaturedContent.tsx # Conteúdo em destaque
│   └── ProtectedRoute.tsx  # Rotas protegidas
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Auth.tsx        # Login/Registro
│   ├── VideoPlayer.tsx # Player de vídeo
│   ├── Profile.tsx     # Perfil do usuário
│   └── AdminDashboard.tsx # Painel admin
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Autenticação
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces
├── lib/                # Configurações
│   └── supabase.ts     # Cliente Supabase
└── App.tsx             # Componente principal
```

### Scripts Disponíveis
- `npm start`: Servidor de desenvolvimento
- `npm build`: Build para produção
- `npm test`: Executar testes
- `npm eject`: Ejetar configurações (não recomendado)

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro de conexão com Supabase**
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

**2. Vídeos não carregam**
- Verifique se as URLs estão corretas
- Para Google Drive, certifique-se que o arquivo está público

**3. Admin não funciona**
- Confirme se criou conta com email `admin@streaming.com`
- Verifique se o schema SQL foi executado completamente

**4. Teste gratuito não ativado**
- Verifique se a função `handle_new_user()` foi criada
- Confirme se o trigger está ativo

## 📞 Suporte

Para suporte técnico ou dúvidas:
1. Verifique a documentação do Supabase
2. Consulte os logs do navegador (F12)
3. Revise as configurações de ambiente

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**StreamFlix** - Uma plataforma de streaming moderna e completa! 🎬✨

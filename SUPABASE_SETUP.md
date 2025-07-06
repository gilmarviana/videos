# Supabase Setup Guide

## Configuração do Supabase

Para que a aplicação funcione corretamente, você precisa configurar as variáveis de ambiente do Supabase.

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Aguarde a configuração inicial

### 2. Obter credenciais

1. No dashboard do seu projeto, vá para **Settings > API**
2. Copie os seguintes valores:
   - **Project URL** (ex: `https://your-project-id.supabase.co`)
   - **anon public** key

### 3. Configurar variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://ctzvbjrmsraalxbqcxif.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0enZianJtc3JhYWx4YnFjeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODg5MzksImV4cCI6MjA2NzE2NDkzOX0.ds2A-XejCgGa-1yHBoavMEMSM1aWNOVkz0mDxt20yjM
```

### 4. Configurar banco de dados

Execute o script SQL fornecido em `database.sql` no SQL Editor do Supabase para criar as tabelas necessárias.

### 5. Configurar autenticação

1. Vá para **Authentication > Settings**
2. Configure as URLs permitidas:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
   - `http://localhost:5176`

### 6. Reiniciar aplicação

Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Estrutura do Banco de Dados

A aplicação espera as seguintes tabelas:

- `profiles` - Perfis de usuário
- `subscription_plans` - Planos de assinatura
- `subscriptions` - Assinaturas dos usuários
- `categories` - Categorias de vídeos
- `videos` - Vídeos
- `watch_history` - Histórico de visualização

## Nota

Se as variáveis de ambiente não estiverem configuradas, a aplicação usará um cliente mock que permite navegar pela interface, mas não salvará dados. 
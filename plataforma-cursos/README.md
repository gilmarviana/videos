# Plataforma de Cursos Online

Uma plataforma moderna de cursos online com sistema de assinatura mensal, teste gratuito de 4 horas, quizzes gerados por IA e certificados automáticos.

## 🚀 Tecnologias

- **Frontend**: Next.js 15 com TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Authentication**: JWT
- **Payment**: Stripe/MercadoPago
- **AI**: OpenAI para geração de quizzes
- **File Storage**: AWS S3
- **Email**: SMTP/SendGrid

## 📋 Pré-requisitos

- Node.js 18.18+ (recomendado: 20+)
- Docker e Docker Compose
- npm ou yarn

## 🛠️ Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone <repository-url>
cd plataforma-cursos
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
- Database URL
- Redis URL
- JWT secrets
- Payment gateway keys
- AI service keys
- Email configuration

### 4. Inicie os serviços com Docker
```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Redis na porta 6379

### 5. Execute as migrações do banco (será implementado na task 2)
```bash
# Será implementado com Prisma
npm run db:migrate
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Dashboard do aluno
│   ├── (admin)/           # Painel administrativo
│   ├── api/               # API Routes
│   └── shared/            # Páginas compartilhadas
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   ├── auth/             # Componentes de autenticação
│   ├── course/           # Componentes de curso
│   ├── admin/            # Componentes administrativos
│   ├── quiz/             # Componentes de quiz
│   └── landing/          # Componentes da landing page
├── lib/                  # Utilitários e configurações
│   ├── auth/             # Lógica de autenticação
│   ├── db/               # Conexão com banco de dados
│   ├── redis/            # Cliente Redis
│   └── utils/            # Funções utilitárias
└── types/                # Definições de tipos TypeScript
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
npm run type-check   # Verifica tipos TypeScript
```

## 🐳 Docker

### Serviços incluídos:
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões

### Comandos úteis:
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Resetar dados
docker-compose down -v
```

## 📝 Próximos Passos

1. **Task 2**: Implementar sistema de autenticação
2. **Task 3**: Implementar sistema de trial e tracking de tempo
3. **Task 4**: Criar sistema de gestão de cursos
4. **Task 5**: Implementar sistema de vídeo
5. **Task 6**: Criar tracking de progresso do usuário

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@plataforma-cursos.com ou abra uma issue no GitHub.
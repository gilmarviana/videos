# 🎬 Plataforma de Streaming

Uma plataforma moderna de streaming com interface elegante, suporte a múltiplos servidores e player integrado.

## ✨ Características

- **Interface Moderna**: Design responsivo e elegante
- **Múltiplos Servidores**: Suporte a diferentes servidores IPTV
- **Player Integrado**: Reprodução de conteúdo diretamente na plataforma
- **Categorização**: Filmes, séries, canais ao vivo e mais
- **Busca Avançada**: Encontre conteúdo rapidamente
- **Autenticação**: Sistema de login seguro

## 🚀 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos de Instalação

1. **Clone ou baixe o projeto**
```bash
git clone <seu-repositorio>
cd streaming-platform
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor**
```bash
npm start
```

4. **Acesse a plataforma**
Abra seu navegador e acesse: `http://localhost:3000`

## 🎯 Como Usar

### 1. Login
- Acesse a página inicial
- Insira seu **usuário** e **senha**
- Selecione o **servidor** desejado:
  - **Premium**: zed5.top
  - **Super Premium**: voando66483.click  
  - **Padrão 1**: nplaylunar.shop
  - **Padrão 2**: nplaysolar.shop
  - **Outro**: Para servidor customizado

### 2. Navegação
- Use a **barra lateral** para navegar entre categorias
- Use a **barra de busca** para encontrar conteúdo específico
- Clique em **"Atualizar"** para recarregar a lista de canais

### 3. Reprodução
- Clique em **"Assistir"** em qualquer canal
- O player será aberto em modal
- Use os controles padrão do vídeo
- Pressione **ESC** ou clique fora para fechar

## 🔧 Configuração de Servidores

A plataforma suporta os seguintes servidores pré-configurados:

| Servidor | URL Base |
|----------|----------|
| Premium | zed5.top |
| Super Premium | voando66483.click |
| Padrão 1 | nplaylunar.shop |
| Padrão 2 | nplaysolar.shop |

### Servidor Customizado
Se você tem um servidor próprio:
1. Selecione "Outro" no dropdown
2. Digite apenas a parte após `http://`
3. Exemplo: Para `http://meuservidor.com`, digite apenas `meuservidor.com`

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, mobile
- **Formatos**: M3U8, MPEGTS e outros formatos suportados pelo HTML5

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
streaming-platform/
├── server.js              # Servidor backend
├── package.json           # Dependências
├── public/
│   ├── index.html         # Página de login
│   ├── dashboard.html     # Dashboard principal
│   ├── css/
│   │   └── style.css      # Estilos
│   └── js/
│       ├── login.js       # JavaScript do login
│       └── dashboard.js   # JavaScript do dashboard
└── README.md
```

### API Endpoints

- `GET /` - Página de login
- `GET /dashboard` - Dashboard (requer autenticação)
- `POST /login` - Autenticação
- `POST /logout` - Logout
- `GET /playlist` - Obter playlist M3U
- `GET /user` - Informações do usuário logado

### Modo Desenvolvimento
```bash
npm install -g nodemon
npm run dev
```

## 🎨 Personalização

### Temas
Os estilos podem ser personalizados editando `/public/css/style.css`

### Adicionar Novos Servidores
Edite o objeto `servers` em `server.js`:
```javascript
const servers = {
    'premium': 'zed5.top',
    'novo-servidor': 'novoservidor.com'
};
```

## 🔒 Segurança

- Sessões seguras com express-session
- Validação de dados de entrada
- Headers de segurança configurados
- Proxy para APIs externas

## 📝 Notas Importantes

1. **Compatibilidade de Vídeo**: Nem todos os formatos podem ser reproduzidos diretamente no navegador
2. **CORS**: Alguns servidores podem ter restrições CORS
3. **Auto-play**: Pode ser bloqueado por políticas do navegador
4. **Performance**: A velocidade depende da qualidade da conexão e do servidor

## 🆘 Solução de Problemas

### Erro de Conexão
- Verifique se o servidor está online
- Confirme usuário e senha
- Teste com outro servidor

### Vídeo não Carrega
- Verifique a conexão com a internet
- Teste em outro navegador
- Alguns conteúdos podem não ser compatíveis

### Login não Funciona
- Verifique as credenciais
- Confirme se o servidor está correto
- Limpe o cache do navegador

## 📧 Suporte

Para problemas técnicos ou dúvidas:
1. Verifique a seção de solução de problemas
2. Consulte os logs do console do navegador
3. Reinicie o servidor se necessário

---

**Desenvolvido com ❤️ usando Node.js, Express e tecnologias web modernas**
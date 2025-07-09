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

# Exemplo de Player HLS com React Player

Este exemplo mostra como usar o [react-player](https://github.com/cookpete/react-player) para tocar vídeos HLS (.m3u8) em um projeto React.

## Como rodar

1. Crie um novo projeto React:
   ```bash
   npx create-react-app meu-player
   cd meu-player
   ```
2. Instale o react-player:
   ```bash
   npm install react-player
   ```
3. Crie o arquivo `src/MeuPlayer.js` com o código do player (veja abaixo).
4. Importe e use o componente em `src/App.js`.
5. Rode o projeto:
   ```bash
   npm start
   ```

## Código do componente `MeuPlayer.js`

```jsx
import React, { useState } from 'react';
import ReactPlayer from 'react-player';

export default function MeuPlayer() {
  const [url, setUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#18181c', padding: 20, borderRadius: 10 }}>
      <h2 style={{ color: '#fff' }}>Player HLS com React Player</h2>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Cole a URL .m3u8 aqui"
        style={{ width: '100%', marginBottom: 20, padding: 8, borderRadius: 4 }}
      />
      <ReactPlayer
        url={url}
        controls
        playing
        width="100%"
        height="360px"
        style={{ background: '#000' }}
      />
    </div>
  );
}
```

## Código do `App.js`

```jsx
import React from 'react';
import MeuPlayer from './MeuPlayer';

function App() {
  return (
    <div>
      <MeuPlayer />
    </div>
  );
}

export default App;
```

---

Se quiser um exemplo com lista de canais ou integração com M3U, peça que eu monto para você!
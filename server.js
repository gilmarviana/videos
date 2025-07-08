const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4100;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuração de sessões
app.use(session({
    secret: 'streaming-platform-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Servidores disponíveis
const servers = {
    'premium': 'zed5.top',
    'super-premium': 'voando66483.click',
    'padrao-1': 'nplaylunar.shop',
    'padrao-2': 'nplaysolar.shop'
};

// Rota para página inicial (login)
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Rota para dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/');
    }
});

// Rota para login
app.post('/login', (req, res) => {
    const { username, password, server, customServer } = req.body;
    
    if (!username || !password || !server) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Determinar servidor
    let selectedServer;
    if (server === 'outro') {
        if (!customServer) {
            return res.status(400).json({ error: 'URL do servidor customizado é obrigatória' });
        }
        selectedServer = customServer;
    } else {
        selectedServer = servers[server];
    }
    
    if (!selectedServer) {
        return res.status(400).json({ error: 'Servidor inválido' });
    }
    
    // Salvar dados na sessão
    req.session.authenticated = true;
    req.session.username = username;
    req.session.password = password;
    req.session.server = selectedServer;
    
    res.json({ success: true, message: 'Login realizado com sucesso' });
});

// Rota para logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Rota para obter playlist M3U
app.get('/playlist', async (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    
    try {
        const playlistUrl = `http://${req.session.server}/get.php?username=${req.session.username}&password=${req.session.password}&type=m3u_plus&output=mpegts`;
        
        const response = await axios.get(playlistUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        res.setHeader('Content-Type', 'application/x-mpegurl');
        res.send(response.data);
    } catch (error) {
        console.error('Erro ao buscar playlist:', error.message);
        res.status(500).json({ error: 'Erro ao carregar conteúdo' });
    }
});

// Rota para obter dados do usuário
app.get('/user', (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    
    res.json({
        username: req.session.username,
        server: req.session.server,
        authenticated: true
    });
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
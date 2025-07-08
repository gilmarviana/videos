document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const loadingContent = document.getElementById('loadingContent');
    const errorContent = document.getElementById('errorContent');
    const channelsList = document.getElementById('channelsList');
    const navLinks = document.querySelectorAll('.nav-link');
    const playerModal = document.getElementById('playerModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const playerTitle = document.getElementById('playerTitle');
    const channelInfo = document.getElementById('channelInfo');

    // Variáveis globais
    let allChannels = [];
    let filteredChannels = [];
    let currentCategory = 'all';

    // Inicialização
    init();

    async function init() {
        await loadUserInfo();
        await loadContent();
        setupEventListeners();
    }

    async function loadUserInfo() {
        // Carrega usuário e servidor do localStorage
        const username = localStorage.getItem('username');
        const servidor = localStorage.getItem('servidor');
        if (username && servidor) {
            userInfo.textContent = `Usuário: ${username} | Servidor: ${servidor}`;
        } else {
            window.location.href = 'login.html';
        }
    }

    async function loadContent() {
        try {
            showLoading();
            // Busca a URL M3U do localStorage
            const m3uUrl = localStorage.getItem('m3uUrl');
            if (!m3uUrl) throw new Error('URL M3U não encontrada');
            const response = await fetch(m3uUrl);
            if (!response.ok) throw new Error('Erro ao carregar playlist');
            const playlistText = await response.text();
            allChannels = parseM3U(playlistText);
            filteredChannels = [...allChannels];
            renderChannels();
            hideLoading();
        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            showError();
        }
    }

    function parseM3U(playlistText) {
        const lines = playlistText.split('\n');
        const channels = [];
        let currentChannel = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                // Extrair informações do canal
                const info = line.substring(8); // Remove '#EXTINF:'
                const titleMatch = info.match(/,(.+)$/);
                const title = titleMatch ? titleMatch[1].trim() : 'Canal sem nome';
                
                // Extrair atributos como tvg-logo, group-title, etc.
                const logoMatch = info.match(/tvg-logo="([^"]+)"/);
                const groupMatch = info.match(/group-title="([^"]+)"/);
                
                currentChannel = {
                    title: title,
                    logo: logoMatch ? logoMatch[1] : null,
                    group: groupMatch ? groupMatch[1] : 'Sem categoria',
                    url: null,
                    type: 'live' // Padrão para canais ao vivo
                };
            } else if (line && !line.startsWith('#') && currentChannel) {
                // URL do canal
                currentChannel.url = line;
                
                // Determinar tipo baseado no nome/grupo
                currentChannel.type = determineChannelType(currentChannel.title, currentChannel.group);
                
                channels.push(currentChannel);
                currentChannel = null;
            }
        }

        return channels;
    }

    function determineChannelType(title, group) {
        const titleLower = title.toLowerCase();
        const groupLower = group.toLowerCase();
        
        if (groupLower.includes('filme') || titleLower.includes('filme')) {
            return 'movies';
        } else if (groupLower.includes('serie') || titleLower.includes('serie')) {
            return 'series';
        } else if (groupLower.includes('documentar') || titleLower.includes('documentar')) {
            return 'documentaries';
        } else if (groupLower.includes('noticia') || groupLower.includes('news') || titleLower.includes('news')) {
            return 'news';
        } else if (groupLower.includes('esporte') || groupLower.includes('sport') || titleLower.includes('sport')) {
            return 'sports';
        } else if (groupLower.includes('entret') || titleLower.includes('entret')) {
            return 'entertainment';
        } else {
            return 'live';
        }
    }

    function renderChannels() {
        if (filteredChannels.length === 0) {
            channelsList.innerHTML = '<div class="no-content"><p>Nenhum canal encontrado</p></div>';
            return;
        }

        const html = filteredChannels.map(channel => `
            <div class="channel-card" data-url="${channel.url}" data-title="${channel.title}">
                <div class="channel-logo">
                    ${channel.logo ? 
                        `<img src="${channel.logo}" alt="${channel.title}" onerror="this.style.display='none'">` : 
                        '<i class="fas fa-tv"></i>'
                    }
                </div>
                <h3>${channel.title}</h3>
                <p class="channel-group">${channel.group}</p>
                <button class="play-btn" onclick="playChannel('${channel.url}', '${channel.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-play"></i>
                    Assistir
                </button>
            </div>
        `).join('');

        channelsList.innerHTML = html;
    }

    function filterChannels() {
        let filtered = [...allChannels];

        // Filtrar por categoria
        if (currentCategory !== 'all') {
            filtered = filtered.filter(channel => channel.type === currentCategory);
        }

        // Filtrar por busca
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(channel => 
                channel.title.toLowerCase().includes(searchTerm) ||
                channel.group.toLowerCase().includes(searchTerm)
            );
        }

        filteredChannels = filtered;
        renderChannels();
    }

    function setupEventListeners() {
        // Logout
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });

        // Busca
        searchInput.addEventListener('input', filterChannels);

        // Refresh
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
            loadContent().then(() => {
                icon.style.animation = '';
            });
        });

        // Navegação por categoria
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Atualizar links ativos
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrar por categoria
                currentCategory = this.dataset.category;
                filterChannels();
            });
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePlayer();
            }
        });

        // Fechar modal clicando fora
        playerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closePlayer();
            }
        });
    }

    // Função global para tocar canal (chamada pelos botões)
    window.playChannel = function(url, title) {
        playerTitle.textContent = title;
        channelInfo.textContent = `Reproduzindo: ${title}`;
        
        // Definir fonte do vídeo
        videoPlayer.src = url;
        videoPlayer.load();
        
        // Mostrar modal
        playerModal.style.display = 'block';
        
        // Auto-play (pode não funcionar em alguns navegadores)
        setTimeout(() => {
            videoPlayer.play().catch(error => {
                console.log('Auto-play bloqueado pelo navegador');
            });
        }, 500);
    };

    // Função global para fechar player
    window.closePlayer = function() {
        playerModal.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.src = '';
    };

    function showLoading() {
        loadingContent.style.display = 'flex';
        errorContent.style.display = 'none';
        channelsList.style.display = 'none';
    }

    function hideLoading() {
        loadingContent.style.display = 'none';
        channelsList.style.display = 'grid';
    }

    function showError() {
        loadingContent.style.display = 'none';
        errorContent.style.display = 'flex';
        channelsList.style.display = 'none';
    }

    // Adicionar estilo CSS para o logo dos canais
    const style = document.createElement('style');
    style.textContent = `
        .channel-logo {
            text-align: center;
            margin-bottom: 15px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .channel-logo img {
            max-width: 80px;
            max-height: 60px;
            border-radius: 8px;
        }
        
        .channel-logo i {
            font-size: 2.5rem;
            color: #667eea;
        }
        
        .channel-group {
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            color: #666;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .no-content {
            text-align: center;
            padding: 60px 20px;
            color: #666;
            grid-column: 1 / -1;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});
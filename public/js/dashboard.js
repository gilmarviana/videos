// SPA navigation state
let currentSection = null;

function showSection(section) {
    document.getElementById('section-canais').style.display = 'none';
    document.getElementById('section-filmes').style.display = 'none';
    document.getElementById('section-series').style.display = 'none';
    document.getElementById('nav-canais').classList.remove('active');
    document.getElementById('nav-filmes').classList.remove('active');
    document.getElementById('nav-series').classList.remove('active');
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('section-' + section).style.display = '';
    document.getElementById('nav-' + section).classList.add('active');
    currentSection = section;
    if (section === 'canais') {
        console.log('Chamando inicializarCanais...');
        if (typeof inicializarCanais === 'function') inicializarCanais();
    } else if (section === 'filmes') {
        console.log('Chamando inicializarFilmes...');
        if (typeof inicializarFilmes === 'function') inicializarFilmes();
    } else if (section === 'series') {
        console.log('Chamando inicializarSeries...');
        if (typeof inicializarSeries === 'function') inicializarSeries();
    }
}

function startSPA(section) {
    document.getElementById('landing').style.display = 'none';
    document.querySelector('.main-layout').style.display = '';
    showSection(section);
}

// Ao carregar, mostra só a landing
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('landing').style.display = '';
    document.querySelector('.main-layout').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const m3uUrl = localStorage.getItem('m3uUrl');
    const username = localStorage.getItem('username') || localStorage.getItem('usuario');
    
    if (!m3uUrl || !username) {
        // Usuário não está logado, redirecionar para login
        window.location.href = 'index.html';
        return;
    }
    
    // Preencher usuário e servidor no header
    const user = username;
    const serverValue = localStorage.getItem('server') || '';
    const headerUser = document.getElementById('headerUser');
    const headerServer = document.getElementById('headerServer');
    
    if (headerUser) headerUser.textContent = user;
    
    // Converter o valor do servidor para o nome amigável
    let serverName = 'Padrão';
    switch(serverValue) {
        case 'premium':
            serverName = 'Premium';
            break;
        case 'super-premium':
            serverName = 'Super Premium';
            break;
        case 'padrao-1':
            serverName = 'Padrão 1';
            break;
        case 'padrao-2':
            serverName = 'Padrão 2';
            break;
        case 'outro':
            serverName = 'Customizado';
            break;
        default:
            serverName = 'Padrão';
    }
    
    if (headerServer) headerServer.textContent = serverName;

    // Formulário de busca global
    const globalSearchForm = document.getElementById('globalSearchForm');
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchForm && globalSearchInput) {
        globalSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termo = globalSearchInput.value.trim();
            // Oculta todas as seções, inclusive landing
            const secLanding = document.getElementById('landing');
            const secCanais = document.getElementById('section-canais');
            const secFilmes = document.getElementById('section-filmes');
            const secSeries = document.getElementById('section-series');
            const secSearch = document.getElementById('section-search');
            if (secLanding) secLanding.style.display = 'none';
            if (secCanais) secCanais.style.display = 'none';
            if (secFilmes) secFilmes.style.display = 'none';
            if (secSeries) secSeries.style.display = 'none';
            if (secSearch) secSearch.style.display = '';
            if (termo) {
                renderSearchResults(termo.toLowerCase());
            }
        });
    }

    // Pesquisa local também vira global
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = searchInput.value.trim().toLowerCase();
            const secCanais = document.getElementById('section-canais');
            const secFilmes = document.getElementById('section-filmes');
            const secSeries = document.getElementById('section-series');
            const secSearch = document.getElementById('section-search');
            if (termo) {
                if (secCanais) secCanais.style.display = 'none';
                if (secFilmes) secFilmes.style.display = 'none';
                if (secSeries) secSeries.style.display = 'none';
                if (secSearch) secSearch.style.display = '';
                renderSearchResults(termo);
            } else {
                if (secCanais) secCanais.style.display = '';
                if (secFilmes) secFilmes.style.display = 'none';
                if (secSeries) secSeries.style.display = 'none';
                if (secSearch) secSearch.style.display = 'none';
            }
        });
    }

    // Controle de visibilidade do campo de pesquisa global
    function atualizarVisibilidadePesquisaGlobal() {
        const secLanding = document.getElementById('landing');
        const globalSearchForm = document.getElementById('globalSearchForm');
        if (!globalSearchForm) return;
        if (secLanding && secLanding.style.display !== 'none') {
            globalSearchForm.style.display = 'none';
        } else {
            globalSearchForm.style.display = '';
        }
    }
    atualizarVisibilidadePesquisaGlobal();
    // Sempre que trocar de seção, atualizar visibilidade
    window.showSection = function(sec) {
        // Função já usada nos menus para trocar de seção
        const secLanding = document.getElementById('landing');
        const secCanais = document.getElementById('section-canais');
        const secFilmes = document.getElementById('section-filmes');
        const secSeries = document.getElementById('section-series');
        const secSearch = document.getElementById('section-search');
        if (secLanding) secLanding.style.display = 'none';
        if (secCanais) secCanais.style.display = (sec === 'canais') ? '' : 'none';
        if (secFilmes) secFilmes.style.display = (sec === 'filmes') ? '' : 'none';
        if (secSeries) secSeries.style.display = (sec === 'series') ? '' : 'none';
        if (secSearch) secSearch.style.display = 'none';
        atualizarVisibilidadePesquisaGlobal();
    };
    // Também atualizar ao exibir busca
    const globalSearchFormSubmit = document.getElementById('globalSearchForm');
    if (globalSearchFormSubmit) {
        globalSearchFormSubmit.addEventListener('submit', function() {
            atualizarVisibilidadePesquisaGlobal();
        });
    }

    // Filtro de tipo na busca (event delegation robusto)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.search-filter-btn');
        const filterGroup = document.getElementById('searchFilterGroup');
        if (btn && filterGroup && filterGroup.contains(btn)) {
            filterGroup.querySelectorAll('.search-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tipo = btn.getAttribute('data-filter');
            aplicarFiltroBusca(tipo);
        }
    });
});

function extrairNomeBase(nome) {
    // Remove 'Temporada X' ou 'Season X' do final do nome
    return nome.replace(/\s*[Tt]emporada\s*\d+$/, '').replace(/\s*[Ss]eason\s*\d+$/, '').trim();
}

function extrairNomeBaseETemporada(nome) {
    // Remove SxxExx, Temporada xx, Season xx, etc.
    let nomeBase = nome.replace(/\s*S\d{2}E\d{2}/gi, '')
                       .replace(/\s*Temporada\s*\d+/i, '')
                       .replace(/\s*Season\s*\d+/i, '')
                       .trim();
    // Extrai temporada (Sxx, Temporada xx, Season xx)
    let tempMatch = nome.match(/S(\d{2})/i) || nome.match(/Temporada\s*(\d+)/i) || nome.match(/Season\s*(\d+)/i);
    let temporada = tempMatch ? (tempMatch[1].length === 1 ? 'S0' + tempMatch[1] : 'S' + tempMatch[1]) : 'S01';
    return { nomeBase, temporada };
}

// Função para atualizar contadores nos botões de filtro
function atualizarContadoresFiltro(canais, filmes, series) {
    const filterGroup = document.getElementById('searchFilterGroup');
    if (!filterGroup) return;
    
    const btnTodos = filterGroup.querySelector('[data-filter="todos"]');
    const btnCanais = filterGroup.querySelector('[data-filter="canal"]');
    const btnFilmes = filterGroup.querySelector('[data-filter="filme"]');
    const btnSeries = filterGroup.querySelector('[data-filter="serie"]');
    
    const total = canais + filmes + series;
    
    // Atualizar textos
    if (btnTodos) btnTodos.textContent = `Todos (${total})`;
    if (btnCanais) btnCanais.textContent = `Canais (${canais})`;
    if (btnFilmes) btnFilmes.textContent = `Filmes (${filmes})`;
    if (btnSeries) btnSeries.textContent = `Séries (${series})`;
    
    // Ocultar botões sem conteúdo (exceto "Todos")
    if (btnCanais) btnCanais.style.display = canais > 0 ? '' : 'none';
    if (btnFilmes) btnFilmes.style.display = filmes > 0 ? '' : 'none';
    if (btnSeries) btnSeries.style.display = series > 0 ? '' : 'none';
    
    // Se não há nenhum resultado, ocultar todo o grupo de filtros
    if (total === 0) {
        filterGroup.style.display = 'none';
    } else {
        filterGroup.style.display = 'flex';
    }
}

// Filtro de tipo na busca global
function aplicarFiltroBusca(tipo) {
    const cards = document.querySelectorAll('#searchResultsGrid .card-filme');
    cards.forEach(card => {
        const t = card.getAttribute('data-tipo');
        if (tipo === 'todos' || t === tipo || (tipo === 'serie' && t === 'serie-temporada')) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderSearchResults(termo) {
    const grid = document.getElementById('searchResultsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let achou = false;
    
    // Contadores para cada tipo
    let contadorCanais = 0;
    let contadorFilmes = 0;
    let contadorSeries = 0;
    
    // Canais
    if (window.categoriasCanais && Array.isArray(window.categoriasCanais)) {
        window.categoriasCanais.forEach(cat => {
            (cat.canais || []).forEach(canal => {
                if (canal.nome && canal.nome.toLowerCase().includes(termo)) {
                    achou = true;
                    contadorCanais++;
                    grid.innerHTML += `
                        <div class='card-filme' data-tipo='canal' data-nome="${canal.nome.replace(/"/g, '&quot;')}" data-url="${canal.url}" data-logo="${canal.logo || ''}">
                            <img src='${canal.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(canal.nome.charAt(0))}' alt='${canal.nome}' class='card-capa'>
                            <div class='card-titulo'>${canal.nome}</div>
                            <div style='color:#6c63ff;font-size:13px;margin-top:4px;'>Canal</div>
                        </div>`;
                }
            });
        });
    }
    // Filmes
    if (window.categoriasFilmes && Array.isArray(window.categoriasFilmes)) {
        window.categoriasFilmes.forEach(cat => {
            (cat.filmes || []).forEach(filme => {
                const nomeFilme = filme.nome || filme.titulo;
                if (nomeFilme && nomeFilme.toLowerCase().includes(termo)) {
                    achou = true;
                    contadorFilmes++;
                    grid.innerHTML += `
                        <div class='card-filme' data-tipo='filme' data-nome="${nomeFilme.replace(/"/g, '&quot;')}" data-url="${filme.url}" data-logo="${filme.logo || ''}">
                            <img src='${filme.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(nomeFilme.charAt(0))}' alt='${nomeFilme}' class='card-capa'>
                            <div class='card-titulo'>${nomeFilme}</div>
                            <div style='color:#6c63ff;font-size:13px;margin-top:4px;'>Filme</div>
                        </div>`;
                }
            });
        });
    }
    // Séries agrupadas REALMENTE por nome base e temporada
    let agrupadas = {};
    if (window.categoriasSeries && Array.isArray(window.categoriasSeries)) {
        window.categoriasSeries.forEach(cat => {
            (cat.series || []).forEach(serie => {
                const nomeSerie = serie.nome || serie.titulo;
                if (nomeSerie && nomeSerie.toLowerCase().includes(termo)) {
                    achou = true;
                    const { nomeBase, temporada } = extrairNomeBaseETemporada(nomeSerie);
                    if (!agrupadas[nomeBase]) agrupadas[nomeBase] = {};
                    if (!agrupadas[nomeBase][temporada]) agrupadas[nomeBase][temporada] = [];
                    agrupadas[nomeBase][temporada].push(serie);
                }
            });
        });
    }
    // Renderizar cards de temporada agrupados
    Object.entries(agrupadas).forEach(([nomeBase, temporadas]) => {
        Object.entries(temporadas).forEach(([temporada, episodios]) => {
            const ep = episodios[0];
            contadorSeries++;
            grid.innerHTML += `
                <div class='card-filme card-serie-temporada' data-tipo='serie-temporada' data-nomebase="${nomeBase.replace(/"/g, '&quot;')}" data-temporada="${temporada}">
                    <img src='${ep.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(nomeBase.charAt(0))}' alt='${nomeBase} ${temporada}' class='card-capa'>
                    <div class='card-titulo'>${nomeBase} ${temporada.replace('S', 'Temporada ')}</div>
                    <div style='color:#6c63ff;font-size:13px;margin-top:4px;'>Série</div>
                </div>`;
        });
    });
    
    // Atualizar os botões de filtro com as quantidades
    atualizarContadoresFiltro(contadorCanais, contadorFilmes, contadorSeries);
    
    if (!achou) {
        grid.innerHTML = '<div style="color:#bbb;padding:40px;text-align:center;">Nenhum resultado encontrado.</div>';
    }

    // Adiciona event listener para abrir o player/modal ao clicar no card
    grid.querySelectorAll('.card-filme').forEach(card => {
        card.addEventListener('click', function() {
            const tipo = card.getAttribute('data-tipo');
            const nome = card.getAttribute('data-nome');
            const url = card.getAttribute('data-url');
            const logo = card.getAttribute('data-logo');
            if (tipo === 'filme' && window.abrirModalPlayerFilme) {
                window.abrirModalPlayerFilme(url, nome);
            } else if (tipo === 'serie' && window.abrirModalPlayerSerie) {
                window.abrirModalPlayerSerie(url, nome);
            } else if (tipo === 'serie-temporada') {
                // Exibe episódios da temporada agrupada corretamente
                const nomeBase = card.getAttribute('data-nomebase');
                const temporada = card.getAttribute('data-temporada');
                if (agrupadas[nomeBase] && agrupadas[nomeBase][temporada]) {
                    exibirEpisodiosTemporadaModal(nomeBase, temporada, agrupadas[nomeBase][temporada]);
                }
            } else if (tipo === 'canal') {
                abrirModalPlayerCanal(url, nome);
            }
        });
    });

    // Após renderizar, aplicar filtro ativo
    const filterGroup = document.getElementById('searchFilterGroup');
    if (filterGroup) {
        const btn = filterGroup.querySelector('.search-filter-btn.active');
        const tipo = btn ? btn.getAttribute('data-filter') : 'todos';
        aplicarFiltroBusca(tipo);
    }
}

function exibirEpisodiosTemporadaModal(nomeBase, temporada, episodios) {
    // Cria um modal simples para exibir os episódios
    let modal = document.getElementById('modalEpisodiosTemporada');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalEpisodiosTemporada';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.85)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = '';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div id='modalEpisodiosContent' style='background:#23232a;padding:32px 24px;border-radius:12px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;position:relative;'>
        <button id='fecharModalEpisodios' style='position:absolute;top:12px;right:12px;background:#6c63ff;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:15px;'>Fechar</button>
        <h3 style='color:#fff;margin-bottom:18px;'>${nomeBase} ${temporada.replace('S', 'Temporada ')}</h3>
        <div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;'>
            ${episodios.map((ep, idx) => `
                <div class='card-filme' style='cursor:pointer;' data-tipo='serie-ep' data-url='${ep.url}' data-nome='${ep.nome || ep.titulo}'>
                    <img src='${ep.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(ep.nome ? ep.nome.charAt(0) : nomeBase.charAt(0))}' alt='${ep.nome || ep.titulo}' class='card-capa'>
                    <div class='card-titulo'>${ep.nome || ep.titulo}</div>
                </div>
            `).join('')}
        </div>
    </div>`;
    modal.style.display = 'flex';
    document.getElementById('fecharModalEpisodios').onclick = () => { modal.style.display = 'none'; };
    // Fechar ao clicar fora do conteúdo central
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
    // Ao clicar em episódio, abrir player
    modal.querySelectorAll('.card-filme').forEach(card => {
        card.addEventListener('click', function() {
            const url = card.getAttribute('data-url');
            const nome = card.getAttribute('data-nome');
            if (window.abrirModalPlayerSerie) window.abrirModalPlayerSerie(url, nome);
        });
    });
}

function abrirModalPlayerCanal(url, nome) {
    let modal = document.getElementById('modalPlayerCanal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPlayerCanal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.85)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div style='background:#23232a;padding:32px 24px;border-radius:12px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;position:relative;'>
        <button id='fecharModalPlayerCanal' style='position:absolute;top:12px;right:12px;background:#6c63ff;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:15px;'>Fechar</button>
        <h3 style='color:#fff;margin-bottom:18px;'>${nome}</h3>
        <div id='player_container_modal_canal' style='width:100%;height:340px;background:#111;border-radius:8px;'></div>
    </div>`;
    modal.style.display = 'flex';
    document.getElementById('fecharModalPlayerCanal').onclick = () => {
        modal.style.display = 'none';
        if (window.clapprPlayerCanal) { window.clapprPlayerCanal.destroy(); window.clapprPlayerCanal = null; }
    };
    if (window.clapprPlayerCanal) window.clapprPlayerCanal.destroy();
    window.clapprPlayerCanal = new Clappr.Player({
        source: url,
        parentId: '#player_container_modal_canal',
        autoPlay: true,
        width: '100%',
        height: 340,
        mute: false
    });
}

function filtrarCards(containerId, termo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cards = container.querySelectorAll('.card-filme');
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        if (!termo || texto.includes(termo)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Sobrescreva/adicione a função abrirModalPlayerSerie para garantir z-index maior e ocultar modal de episódios temporariamente
window.abrirModalPlayerSerie = function(url, titulo) {
    const modalEpisodios = document.getElementById('modalEpisodiosTemporada');
    if (modalEpisodios) modalEpisodios.style.display = 'none';
    let modal = document.getElementById('modalPlayer');
    if (!modal) return;
    const container = document.getElementById('modalPlayerContainer');
    const titleDiv = document.getElementById('modalPlayerTitle');
    modal.style.display = 'flex';
    modal.style.zIndex = '10001';
    container.innerHTML = '';
    if (titleDiv) titleDiv.textContent = titulo || '';
    if (window.clapprPlayer) window.clapprPlayer.destroy();
    window.clapprPlayer = new Clappr.Player({
        source: url,
        parentId: "#modalPlayerContainer",
        autoPlay: true,
        width: "100%",
        height: "100%",
        mute: false,
        hideControls: true
    });
    // Ao fechar o player, reexibe o modal de episódios se existir
    const fechar = document.querySelector('.modal-close');
    if (fechar) {
        fechar.onclick = function() {
            modal.style.display = 'none';
            if (window.clapprPlayer) { window.clapprPlayer.destroy(); window.clapprPlayer = null; }
            if (modalEpisodios) modalEpisodios.style.display = 'flex';
        };
    }
};

// Garante destruição do player ao fechar modal de filme
if (window.fecharModalPlayer === undefined) {
    window.fecharModalPlayer = function() {
        const modal = document.getElementById('modalPlayer');
        if (modal) modal.style.display = 'none';
        if (window.clapprPlayer) { window.clapprPlayer.destroy(); window.clapprPlayer = null; }
        // Reexibe modal de episódios se existir
        const modalEpisodios = document.getElementById('modalEpisodiosTemporada');
        if (modalEpisodios && modalEpisodios.style.display === 'none') modalEpisodios.style.display = 'flex';
    };
}

// Função para ir para a página inicial (landing)
function goHome() {
    // Ocultar todas as seções
    document.getElementById('section-canais').style.display = 'none';
    document.getElementById('section-filmes').style.display = 'none';
    document.getElementById('section-series').style.display = 'none';
    document.getElementById('section-search').style.display = 'none';
    
    // Remover classes ativas dos navs
    document.getElementById('nav-canais').classList.remove('active');
    document.getElementById('nav-filmes').classList.remove('active');
    document.getElementById('nav-series').classList.remove('active');
    document.getElementById('nav-home').classList.add('active');
    
    // Mostrar landing
    document.getElementById('landing').style.display = '';
    document.querySelector('.main-layout').style.display = 'none';
    
    // Limpar campo de busca global
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) globalSearchInput.value = '';
    
    // Atualizar visibilidade do campo de busca global
    const globalSearchForm = document.getElementById('globalSearchForm');
    if (globalSearchForm) globalSearchForm.style.display = 'none';
}

// Função para mostrar modal de confirmação de logout
function confirmarLogout() {
    const modal = document.getElementById('modalLogout');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Função para fechar modal de logout
function fecharModalLogout() {
    const modal = document.getElementById('modalLogout');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para executar logout após confirmação
function confirmarLogoutExecutar() {
    // Limpar dados do localStorage
    localStorage.removeItem('usuario');
    localStorage.removeItem('servidor');
    localStorage.removeItem('username');
    localStorage.removeItem('server');
    localStorage.removeItem('m3uUrl');
    localStorage.removeItem('categoriasCanais');
    localStorage.removeItem('categoriasFilmes');
    localStorage.removeItem('categoriasSeries');
    
    // Fechar modal
    fecharModalLogout();
    
    // Redirecionar para a página de login
    window.location.href = 'index.html';
}


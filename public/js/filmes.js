// Script para carregar e exibir filmes por categoria (group) a partir de M3U
async function fetchAndParseM3UFilmes(m3uUrl) {
    const res = await fetch(m3uUrl);
    if (!res.ok) throw new Error('Erro ao carregar M3U');
    const text = await res.text();
    return parseM3UFilmes(text);
}

function parseM3UFilmes(m3uText) {
    console.log('Iniciando parse de filmes...');
    const lines = m3uText.split(/\r?\n/);
    console.log('Total de linhas no M3U:', lines.length);
    const categoriasMap = {};
    let currentInfo = null;
    let itemCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF')) {
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const nameMatch = line.match(/tvg-name="([^"]+)"/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const name = nameMatch ? nameMatch[1] : line.split(',').pop().trim();
            const group = groupMatch ? groupMatch[1] : 'Outros';
            const logo = logoMatch ? logoMatch[1] : '';
            // Filtrar todos exceto Canais e Séries, mas incluir "CANAIS | FILMES E SERIES"
            if ((group.toLowerCase().includes('canais') || group.toLowerCase().includes('séries')) && 
                !group.includes('FILMES E SERIES')) {
                currentInfo = null;
                continue;
            }
            currentInfo = { nome: name, group, logo };
            console.log('Encontrado item de filmes:', name, 'do grupo:', group);
        } else if (currentInfo && line && !line.startsWith('#')) {
            currentInfo.url = line;
            // Aceitar qualquer URL para séries
            if (!categoriasMap[currentInfo.group]) categoriasMap[currentInfo.group] = [];
            categoriasMap[currentInfo.group].push({ ...currentInfo });
            currentInfo = null;
        }
    }
    
    console.log('Total de itens processados:', itemCount);
    console.log('Categorias encontradas:', Object.keys(categoriasMap));
    
    // Retorna todas as categorias
    return Object.entries(categoriasMap)
        .map(([nome, filmes]) => ({ nome, filmes }));
}

let categoriasFilmes = [];
let categoriaSelecionadaFilme = 0;
let filmeSelecionado = 0;

function renderCategorias() {
    const catDiv = document.getElementById('filmesCategorias');
    if (!categoriasFilmes.length) {
        catDiv.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma categoria encontrada.</div>';
        return;
    }
    catDiv.innerHTML = '<ul>' + categoriasFilmes.map((cat, idx) =>
        `<li class="${idx === categoriaSelecionadaFilme ? 'active' : ''}" onclick="selectCategoria(${idx})">${cat.nome}</li>`
    ).join('') + '</ul>';
}

function renderFilmesGrid() {
    const filmes = categoriasFilmes[categoriaSelecionadaFilme]?.filmes || [];
    const grid = document.getElementById('filmesGrid');
    if (!filmes.length) {
        grid.innerHTML = '<div style="padding:20px;color:#bbb">Nenhum filme nesta categoria.</div>';
        return;
    }
    grid.innerHTML = '<div class="cards-container">' + filmes.map((filme, idx) =>
        `<div class="card-filme${(filmeSelecionado === idx ? ' active' : '')}" onclick="selectFilme(${idx})">
            <img src="${filme.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(filme.nome.charAt(0))}" alt="${filme.nome}" class="card-capa">
            <div class="card-titulo">${filme.nome}</div>
        </div>`
    ).join('') + '</div>';
}

function renderInfoFilme() {
    const filme = categoriasFilmes[categoriaSelecionadaFilme]?.filmes[filmeSelecionado];
    const infoDiv = document.getElementById('filmeInfo');
    if (infoDiv) infoDiv.textContent = filme ? filme.nome : '';
}

function abrirModalPlayerFilme(url, titulo) {
    const modal = document.getElementById('modalPlayer');
    const container = document.getElementById('modalPlayerContainer');
    const titleDiv = document.getElementById('modalPlayerTitle');
    modal.style.display = 'flex';
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
}
function fecharModalPlayer() {
    document.getElementById('modalPlayer').style.display = 'none';
    if (window.clapprPlayer) window.clapprPlayer.destroy();
}

window.selectCategoria = function(idx) {
    categoriaSelecionadaFilme = idx;
    filmeSelecionado = -1; // Nenhum selecionado
    renderCategorias();
    renderFilmesGrid();
    renderInfoFilme();
};

window.selectFilme = function(idx) {
    filmeSelecionado = idx;
    renderFilmesGrid();
    renderInfoFilme();
};

async function inicializarFilmes() {
    console.log('Inicializando Filmes...');
    const m3uUrl = localStorage.getItem('m3uUrl');
    console.log('M3U URL para filmes:', m3uUrl);
    if (!m3uUrl) {
        document.getElementById('filmesCategorias').innerHTML = '<div style="padding:20px;color:#f66">Configure a URL do arquivo M3U no localStorage (chave m3uUrl).</div>';
        document.getElementById('filmesGrid').innerHTML = '';
        if (document.getElementById('filmeInfo')) document.getElementById('filmeInfo').textContent = '';
        document.getElementById('player_container_filme').style.display = 'none';
        return;
    }
    try {
        console.log('Carregando filmes do M3U...');
        categoriasFilmes = await fetchAndParseM3UFilmes(m3uUrl);
        window.categoriasFilmes = categoriasFilmes;
        console.log('Categorias de filmes encontradas:', categoriasFilmes.length);
        console.log('Categorias:', categoriasFilmes);
        categoriaSelecionadaFilme = 0;
        filmeSelecionado = 0;
        renderCategorias();
        renderFilmesGrid();
        renderInfoFilme();
        // renderPlayer(); // Removido
    } catch (e) {
        console.error('Erro ao carregar filmes:', e);
        document.getElementById('filmesCategorias').innerHTML = '<div style="padding:20px;color:#f66">Erro ao carregar M3U: ' + e.message + '</div>';
        document.getElementById('filmesGrid').innerHTML = '';
        if (document.getElementById('filmeInfo')) document.getElementById('filmeInfo').textContent = '';
        document.getElementById('player_container_filme').style.display = 'none';
    }
}

// Carregar filmes automaticamente quando a página carrega
window.addEventListener('DOMContentLoaded', inicializarFilmes);

window.inicializarFilmes = inicializarFilmes; 


function renderPlayer() {
    const canal = categoriasCanais[categoriaSelecionadaCanal]?.canais[canalSelecionado];
    console.log('Tentando abrir canal:', canal);
    if (!canal) return;
    const container = document.getElementById('player_container');
    if (!container) {
        console.error('Container #player_container não encontrado no DOM!');
        return;
    }
    if (window.clapprPlayer) {
        window.clapprPlayer.destroy();
    }
    window.clapprPlayer = new Clappr.Player({
        source: canal.url,
        parentId: "#player_container",
        autoPlay: true,
        width: "100%",
        height: 340,
        mute: false
    });
}

// Script para carregar e exibir canais por categoria (group) a partir de M3U
async function fetchAndParseM3UCanais(m3uUrl) {
    const res = await fetch(m3uUrl);
    if (!res.ok) throw new Error('Erro ao carregar M3U');
    const text = await res.text();
    return parseM3UCanais(text);
}

function parseM3UCanais(m3uText) {
    const lines = m3uText.split(/\r?\n/);
    const categoriasMap = {};
    let currentInfo = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF')) {
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const nameMatch = line.match(/tvg-name="([^"]+)"/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const name = nameMatch ? nameMatch[1] : line.split(',').pop().trim();
            const group = groupMatch ? groupMatch[1] : 'Outros';
            const logo = logoMatch ? logoMatch[1] : '';
            // Filtro: excluir apenas grupos de filmes/séries, exceto 'CANAIS | FILMES E SERIES'
            const groupNorm = group.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (
              (groupNorm.includes('filme') || groupNorm.includes('serie')) &&
              !groupNorm.includes('canais | filmes e series')
            ) {
              currentInfo = null;
              continue;
            }
            currentInfo = { nome: name, group, logo };
        } else if (currentInfo && line && !line.startsWith('#')) {
            currentInfo.url = line;
            if (!categoriasMap[currentInfo.group]) categoriasMap[currentInfo.group] = [];
            categoriasMap[currentInfo.group].push({ ...currentInfo });
            currentInfo = null;
        }
    }
    return Object.entries(categoriasMap).map(([nome, canais]) => ({ nome, canais }));
}

let categoriasCanais = [];
let categoriaSelecionadaCanal = 0;
let canalSelecionado = 0;

function renderCategoriasCanais() {
    const catDiv = document.getElementById('canaisCategorias');
    if (!categoriasCanais.length) {
        catDiv.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma categoria encontrada.</div>';
        return;
    }
    catDiv.innerHTML = '<ul>' + categoriasCanais.map((cat, idx) =>
        `<li class="${idx === categoriaSelecionadaCanal ? 'active' : ''}" onclick="selectCategoriaCanal(${idx})">${cat.nome}</li>`
    ).join('') + '</ul>';
}

function renderCanaisLista() {
    const canais = categoriasCanais[categoriaSelecionadaCanal]?.canais || [];
    const canaisDiv = document.getElementById('canaisLista');
    if (!canais.length) {
        canaisDiv.innerHTML = '<div style="padding:20px;color:#bbb">Nenhum canal nesta categoria.</div>';
        return;
    }
    canaisDiv.innerHTML = '<ul>' + canais.map((canal, idx) =>
        `<li class="${idx === canalSelecionado ? 'active' : ''}" onclick="selectCanal(${idx})">` +
        `<img src='${canal.logo || 'https://placehold.co/32x32/222/fff?text=' + encodeURIComponent(canal.nome.charAt(0))}' alt='logo' style='width:32px;height:32px;object-fit:contain;border-radius:4px;background:#fff1;margin-right:8px;'>` +
        `${canal.nome}</li>`
    ).join('') + '</ul>';
}

function renderInfoCanal() {
    const canal = categoriasCanais[categoriaSelecionadaCanal]?.canais[canalSelecionado];
    document.getElementById('channelInfo').textContent = canal ? canal.nome : '';
    document.getElementById('epgList').innerHTML = '';
}

window.selectCategoriaCanal = function(idx) {
    categoriaSelecionadaCanal = idx;
    canalSelecionado = 0;
    renderCategoriasCanais();
    renderCanaisLista();
    renderInfoCanal();
};

window.selectCanal = function(idx) {
    canalSelecionado = idx;
    renderCanaisLista();
    renderInfoCanal();
    renderPlayer();
};

async function inicializarCanais() {
    console.log('Inicializando Canais...');
    const m3uUrl = localStorage.getItem('m3uUrl');
    console.log('M3U URL:', m3uUrl);
    if (!m3uUrl) {
        document.getElementById('canaisCategorias').innerHTML = '<div style="padding:20px;color:#f66">Configure a URL do arquivo M3U no localStorage (chave m3uUrl).</div>';
        document.getElementById('canaisLista').innerHTML = '';
        document.getElementById('channelInfo').textContent = '';
        document.getElementById('epgList').innerHTML = '';
        return;
    }
    try {
        categoriasCanais = await fetchAndParseM3UCanais(m3uUrl);
        window.categoriasCanais = categoriasCanais;
        console.log('Categorias de canais carregadas:', categoriasCanais);
        categoriaSelecionadaCanal = 0;
        canalSelecionado = 0;
        renderCategoriasCanais();
        renderCanaisLista();
        renderInfoCanal();
    } catch (e) {
        console.error('Erro ao carregar canais:', e);
        document.getElementById('canaisCategorias').innerHTML = '<div style="padding:20px;color:#f66">Erro ao carregar M3U: ' + e.message + '</div>';
        document.getElementById('canaisLista').innerHTML = '';
        document.getElementById('channelInfo').textContent = '';
        document.getElementById('epgList').innerHTML = '';
    }
}

window.addEventListener('DOMContentLoaded', inicializarCanais);

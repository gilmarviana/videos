// Script para carregar e exibir séries por categoria (group) a partir de M3U
async function fetchAndParseM3USeries(m3uUrl) {
    const res = await fetch(m3uUrl);
    if (!res.ok) throw new Error('Erro ao carregar M3U');
    const text = await res.text();
    return parseM3USeries(text);
}

function parseM3USeries(m3uText) {
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
            // Filtrar todos exceto Canais e Filmes, mas incluir "CANAIS | FILMES E SERIES"
            if ((group.toLowerCase().includes('canais') || group.toLowerCase().includes('filmes')) && 
                !group.includes('FILMES E SERIES')) {
                currentInfo = null;
                continue;
            }
            currentInfo = { nome: name, group, logo, categoriaOriginal: group };
        } else if (currentInfo && line && !line.startsWith('#')) {
            // Só aceita se o url contiver '/series/'
            if (line.includes('/series/')) {
                currentInfo.url = line;
                if (!categoriasMap[currentInfo.group]) categoriasMap[currentInfo.group] = [];
                categoriasMap[currentInfo.group].push({ ...currentInfo });
            }
            currentInfo = null;
        }
    }
    // Retorna todas as categorias
    return Object.entries(categoriasMap)
        .map(([nome, series]) => ({ nome, series }));
}

let categoriasSeries = [];
let categoriaSelecionadaSerie = 0;
let serieSelecionada = 0;

function renderCategoriasSeries() {
    const catDiv = document.getElementById('seriesCategorias');
    if (!categoriasSeries.length) {
        catDiv.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma categoria encontrada.</div>';
        return;
    }
    catDiv.innerHTML = '<ul>' + categoriasSeries.map((cat, idx) =>
        `<li class="${idx === categoriaSelecionadaSerie ? 'active' : ''}" onclick="selectCategoriaSerie(${idx})">${cat.nome}</li>`
    ).join('') + '</ul>';
}

// --- Agrupamento de séries por nome base e temporada ---
function agruparSeriesPorTemporada(series) {
    const agrupadas = {};
    series.forEach(serie => {
        // Exemplo de nome: "Olympo S01E01"
        const match = serie.nome.match(/^(.*?)(?:\s+S(\d{2})E(\d{2}))/i);
        if (match) {
            const nomeBase = match[1].trim();
            const temporada = 'S' + match[2];
            const episodio = 'E' + match[3];
            if (!agrupadas[nomeBase]) agrupadas[nomeBase] = {};
            if (!agrupadas[nomeBase][temporada]) agrupadas[nomeBase][temporada] = [];
            agrupadas[nomeBase][temporada].push({...serie, temporada, episodio});
        } else {
            // Se não bater o padrão, coloca como "Outros"
            if (!agrupadas['Outros']) agrupadas['Outros'] = {};
            if (!agrupadas['Outros']['S00']) agrupadas['Outros']['S00'] = [];
            agrupadas['Outros']['S00'].push(serie);
        }
    });
    return agrupadas;
}

// --- Estados de navegação ---
let agrupamentoSeries = {};
let serieSelecionadaNome = null;
let temporadaSelecionada = null;
let episodioSelecionado = null;

function renderSeriesAgrupadas() {
    const grid = document.getElementById('seriesGrid');
    if (!agrupamentoSeries || Object.keys(agrupamentoSeries).length === 0) {
        grid.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma série encontrada.</div>';
        return;
    }
    // Nível 1: Lista de séries
    if (!serieSelecionadaNome) {
        grid.innerHTML = '<div class="cards-container">' + Object.keys(agrupamentoSeries).map(nomeBase => {
            // Pega a categoria original do primeiro episódio da série
            const primeiroEp = Object.values(agrupamentoSeries[nomeBase])[0][0];
            return `<div class="card-filme" onclick="selectSerieNome('${nomeBase.replace(/'/g, "\\'")}')">
                <div class="card-titulo">${nomeBase}</div>
            </div>`;
        }).join('') + '</div>';
        return;
    }
    // Nível 2: Lista de temporadas
    if (!temporadaSelecionada) {
        const temporadas = Object.keys(agrupamentoSeries[serieSelecionadaNome]);
        grid.innerHTML = '<div class="cards-container">' + temporadas.map(temp =>
            `<div class="card-filme" onclick="selectTemporada('${temp}')">
                <div class="card-titulo">${serieSelecionadaNome} ${temp}</div>
            </div>`
        ).join('') + '</div>';
        return;
    }
    // Nível 3: Lista de episódios
    const episodios = agrupamentoSeries[serieSelecionadaNome][temporadaSelecionada];
    grid.innerHTML = '<div class="cards-container">' + episodios.map((ep, idx) =>
        `<div class="card-filme" onclick="selectEpisodio(${idx})">
            <img src="${ep.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(ep.nome.charAt(0))}" alt="${ep.nome}" class="card-capa">
            <div class="card-titulo">${ep.nome}</div>
        </div>`
    ).join('') + '</div>';
}

function renderSerieInfo() {
    const infoDiv = document.getElementById('serieInfo');
    // Sempre ocultar o título
    infoDiv.style.display = 'none';
    infoDiv.textContent = '';
}

function renderSeriePlayer() {
    const container = document.getElementById('player_container_serie');
    // Sempre ocultar o player
    container.style.display = 'none';
    if (window.clapprPlayerSerie) {
        window.clapprPlayerSerie.destroy();
    }
}

function abrirModalPlayerSerie(url, titulo) {
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

// Novo estado para navegação
// Removido duplicatas: categoriaSelecionadaSerie, serieSelecionadaNome, temporadaSelecionada, episodioSelecionado
// Novo agrupamento: categoria -> nomes-base -> temporadas -> episódios
let agrupamentoPorCategoria = {};

function agruparSeriesPorCategoria(categoriasSeries) {
    const agrupado = {};
    categoriasSeries.forEach(cat => {
        const categoria = cat.nome;
        if (!agrupado[categoria]) agrupado[categoria] = {};
        cat.series.forEach(serie => {
            // Agrupa por nome base e temporada
            const match = serie.nome.match(/^(.*?)(?:\s+S(\d{2})E(\d{2}))/i);
            let nomeBase = serie.nome;
            let temporada = 'S00';
            let episodio = '';
            if (match) {
                nomeBase = match[1].trim();
                temporada = 'S' + match[2];
                episodio = 'E' + match[3];
            }
            if (!agrupado[categoria][nomeBase]) agrupado[categoria][nomeBase] = {};
            if (!agrupado[categoria][nomeBase][temporada]) agrupado[categoria][nomeBase][temporada] = [];
            agrupado[categoria][nomeBase][temporada].push({ ...serie, temporada, episodio });
        });
    });
    return agrupado;
}

function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function extrairNomeBase(nome) {
    // Remove 'Temporada X' ou 'Season X' do final do nome
    return nome.replace(/\s*[Tt]emporada\s*\d+$/, '').replace(/\s*[Ss]eason\s*\d+$/, '').trim();
}

// Chave da OMDb API - insira a sua aqui
const OMDB_API_KEY = '2ef23ead'; // Chave fornecida pelo usuário

async function buscarPosterIMDB(nomeSerie, fallbackNome) {
    const cacheKey = 'poster_' + nomeSerie;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(nomeSerie)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.Poster && data.Poster !== 'N/A') {
            localStorage.setItem(cacheKey, data.Poster);
            return data.Poster;
        }
        // Tenta buscar pelo nome completo se não achou pelo nome-base
        if (fallbackNome && fallbackNome !== nomeSerie) {
            const url2 = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(fallbackNome)}`;
            const res2 = await fetch(url2);
            const data2 = await res2.json();
            if (data2.Poster && data2.Poster !== 'N/A') {
                localStorage.setItem(cacheKey, data2.Poster);
                return data2.Poster;
            }
        }
    } catch (e) {}
    return null;
}

// Chave da TMDb API - insira a sua aqui
const TMDB_API_KEY = 'e764afcdb53bf0c30f6c688621da1703'; // Chave fornecida pelo usuário

async function buscarPosterTMDB(nomeSerie) {
    const cacheKey = 'poster_tmdb_' + nomeSerie;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(nomeSerie)}&language=pt-BR`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            const posterUrl = 'https://image.tmdb.org/t/p/w500' + data.results[0].poster_path;
            localStorage.setItem(cacheKey, posterUrl);
            return posterUrl;
        }
    } catch (e) {
        console.error('Erro TMDb:', e);
    }
    return null;
}

async function buscarBannerTemporadaTMDB(nomeSerie, numeroTemporada, nomeAlternativo) {
    const apiKey = TMDB_API_KEY;
    const cacheKey = `banner_tmdb_${nomeSerie}_S${numeroTemporada}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached !== null) return cached !== 'null' ? cached : null;
    // 1. Buscar o ID da série (primeiro em português, depois nomeAlternativo se fornecido)
    let searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(nomeSerie)}`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    if ((!searchData.results || !searchData.results.length) && nomeAlternativo) {
        searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(nomeAlternativo)}`;
        searchRes = await fetch(searchUrl);
        searchData = await searchRes.json();
    }
    if (!searchData.results || !searchData.results.length) {
        console.warn('TMDb: Série não encontrada:', nomeSerie, nomeAlternativo);
        localStorage.setItem(cacheKey, 'null');
        return null;
    }
    const serieId = searchData.results[0].id;
    // 2. Buscar detalhes da temporada
    const seasonUrl = `https://api.themoviedb.org/3/tv/${serieId}/season/${numeroTemporada}?api_key=${apiKey}&language=pt-BR`;
    const seasonRes = await fetch(seasonUrl);
    const seasonData = await seasonRes.json();
    if (!seasonData.poster_path) {
        console.warn('TMDb: Banner da temporada não encontrado:', nomeSerie, 'Temporada', numeroTemporada);
        localStorage.setItem(cacheKey, 'null');
        return null;
    }
    // 3. Montar a URL do banner
    const bannerUrl = `https://image.tmdb.org/t/p/w780${seasonData.poster_path}`;
    localStorage.setItem(cacheKey, bannerUrl);
    return bannerUrl;
}

function renderSeriesAgrupadas() {
    const grid = document.getElementById('seriesGrid');
    if (!categoriasSeries.length) {
        grid.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma série encontrada.</div>';
        return;
    }
    const categoriaAtual = categoriasSeries[categoriaSelecionadaSerie]?.nome;
    if (!categoriaAtual) {
        grid.innerHTML = '<div style="padding:20px;color:#bbb">Nenhuma categoria selecionada.</div>';
        return;
    }
    const agrupamento = agrupamentoPorCategoria[categoriaAtual] || {};
    // Nível 1: Lista de nomes-base de séries da categoria
    if (!serieSelecionadaNome) {
        grid.innerHTML = '<div class="cards-container" id="seriesCardsContainer">' + Object.keys(agrupamento).map((nomeBase) => {
            const primeiroEp = Object.values(agrupamento[nomeBase])[0][0];
            const posterId = 'poster_' + sanitizeId(nomeBase);
            return `<div class=\"card-filme\" id=\"serieCard_${posterId}\" onclick=\"selectSerieNome('${nomeBase.replace(/'/g, "\\'")}')\">
                <img src=\"https://placehold.co/160x220/222/fff?text=${encodeURIComponent(nomeBase.charAt(0))}\" alt=\"${nomeBase}\" class=\"card-capa\" id=\"${posterId}\">
                <div class=\"card-titulo\">${nomeBase}</div>
            </div>`;
        }).join('') + '</div>';
        // Após renderizar, buscar posters na TMDb
        Object.keys(agrupamento).forEach((nomeBase) => {
            const posterId = 'poster_' + sanitizeId(nomeBase);
            buscarPosterTMDB(nomeBase).then(url => {
                if (url) {
                    const img = document.getElementById(posterId);
                    if (img) img.src = url;
                }
            });
        });
        return;
    }
    // Nível 2: Lista de temporadas da série selecionada
    if (!temporadaSelecionada) {
        const temporadas = Object.keys(agrupamento[serieSelecionadaNome]);
        grid.innerHTML = '<div style="margin-bottom: 20px;"><button onclick="voltarParaSeries()" style="background: #6c63ff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">← Voltar para Séries</button></div><div class="cards-container">' + temporadas.map(temp => {
            // Extrai o número da temporada
            let num = temp.match(/S(\d{2})/i);
            let label = num ? `Temporada ${parseInt(num[1], 10)}` : temp;
            let numeroTemporada = num ? parseInt(num[1], 10) : 1;
            let nomeBase = extrairNomeBase(serieSelecionadaNome);
            let nomeAlternativo = null;
            if (nomeBase === 'Coração de Ferro') nomeAlternativo = 'Ironheart';
            // ID único para o banner do card
            let bannerId = `bannerTemporada_CARD_${temp}`;
            // Inicia busca do banner (assíncrona)
            setTimeout(() => {
                buscarBannerTemporadaTMDB(nomeBase, numeroTemporada, nomeAlternativo).then(url => {
                    const bannerDiv = document.getElementById(bannerId);
                    if (bannerDiv) {
                        if (url) {
                            bannerDiv.innerHTML = `<img src='${url}' alt='Banner Temporada' style='width:100%;height:120px;object-fit:cover;display:block;border-radius:10px 10px 0 0;'>`;
                        } else {
                            bannerDiv.innerHTML = `<div style='width:100%;height:120px;display:flex;align-items:center;justify-content:center;background:#222;border-radius:10px 10px 0 0;color:#888;font-size:13px;'>Sem banner</div>`;
                        }
                    }
                });
            }, 0);
            return `<div class=\"card-filme\" onclick=\"selectTemporada('${temp}')\">\n<div id='${bannerId}'></div>\n<div class=\"card-titulo\">${serieSelecionadaNome} ${label}</div>\n</div>`;
        }).join('') + '</div>';
        return;
    }
    // Nível 3: Lista de episódios
    const episodios = agrupamento[serieSelecionadaNome][temporadaSelecionada];
    // Adicionar banner da temporada acima do grid
    let bannerHtml = '';
    let nomeBase = extrairNomeBase(serieSelecionadaNome);
    let nomeAlternativo = null;
    if (nomeBase === 'Coração de Ferro') nomeAlternativo = 'Ironheart';
    let numTemp = temporadaSelecionada.match(/S(\d{2})/i);
    let numeroTemporada = numTemp ? parseInt(numTemp[1], 10) : 1;
    console.log('Buscando banner para:', nomeBase, 'Temporada:', numeroTemporada, 'Alternativo:', nomeAlternativo);
    buscarBannerTemporadaTMDB(nomeBase, numeroTemporada, nomeAlternativo).then(url => {
        const bannerDiv = document.getElementById('bannerTemporada');
        if (bannerDiv) {
            if (url) {
                bannerDiv.innerHTML = `<img src='${url}' alt='Banner Temporada' style='width:100%;max-width:600px;display:block;margin:0 auto 24px;border-radius:12px;'>`;
            } else {
                bannerDiv.innerHTML = `<div style='width:100%;max-width:600px;height:180px;display:flex;align-items:center;justify-content:center;background:#222;border-radius:12px;color:#888;margin:0 auto 24px;'>Banner não encontrado</div>`;
            }
        }
    });
    bannerHtml = `<div id='bannerTemporada'></div>`;
    grid.innerHTML = '<div style="margin-bottom: 20px;"><button onclick="voltarParaTemporadas()" style="background: #6c63ff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">← Voltar para Temporadas</button></div>' + bannerHtml + '<div class="cards-container">' + episodios.map((ep, idx) =>
        `<div class="card-filme" onclick="selectEpisodio(${idx})">
            <img src="${ep.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(ep.nome.charAt(0))}" alt="${ep.nome}" class="card-capa">
            <div class="card-titulo">${ep.nome}</div>
        </div>`
    ).join('') + '</div>';
}

window.selectCategoriaSerie = function(idx) {
    categoriaSelecionadaSerie = idx;
    serieSelecionadaNome = null;
    temporadaSelecionada = null;
    episodioSelecionado = null;
    renderCategoriasSeries();
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer(); // Chama renderSeriePlayer para ocultar o player
};

window.selectSerieNome = function(nomeBase) {
    serieSelecionadaNome = nomeBase;
    temporadaSelecionada = null;
    episodioSelecionado = null;
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer(); // Chama renderSeriePlayer para ocultar o player
};
window.selectTemporada = function(temp) {
    temporadaSelecionada = temp;
    episodioSelecionado = null;
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer(); // Chama renderSeriePlayer para ocultar o player
};
window.selectEpisodio = function(idx) {
    episodioSelecionado = idx;
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer(); // Chama renderSeriePlayer para ocultar o player
    // abrir modal ao clicar
    const categoriaAtual = categoriasSeries[categoriaSelecionadaSerie]?.nome;
    const agrupamento = agrupamentoPorCategoria[categoriaAtual] || {};
    const ep = agrupamento[serieSelecionadaNome][temporadaSelecionada][idx];
    if (ep) abrirModalPlayerSerie(ep.url, ep.nome);
};

window.voltarParaSeries = function() {
    serieSelecionadaNome = null;
    temporadaSelecionada = null;
    episodioSelecionado = null;
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer();
};

window.voltarParaTemporadas = function() {
    temporadaSelecionada = null;
    episodioSelecionado = null;
    renderSeriesAgrupadas();
    renderSerieInfo();
    renderSeriePlayer();
};

// --- Inicialização adaptada ---
async function inicializarSeries() {
    console.log('Inicializando Séries...');
    const m3uUrl = localStorage.getItem('m3uUrl');
    console.log('M3U URL para séries:', m3uUrl);
    if (!m3uUrl) {
        document.getElementById('seriesCategorias').innerHTML = '<div style="padding:20px;color:#f66">Configure a URL do arquivo M3U no localStorage (chave m3uUrl).</div>';
        document.getElementById('seriesGrid').innerHTML = '';
        document.getElementById('serieInfo').textContent = '';
        document.getElementById('player_container_serie').style.display = 'none';
        return;
    }
    try {
        console.log('Carregando séries do M3U...');
        categoriasSeries = await fetchAndParseM3USeries(m3uUrl);
        window.categoriasSeries = categoriasSeries;
        agrupamentoPorCategoria = agruparSeriesPorCategoria(categoriasSeries);
        categoriaSelecionadaSerie = 0;
        serieSelecionadaNome = null;
        temporadaSelecionada = null;
        episodioSelecionado = null;
        renderSeriesAgrupadas();
        renderCategoriasSeries(); // Se quiser manter a sidebar de categorias
        renderSerieInfo();
        renderSeriePlayer(); // Chama renderSeriePlayer para ocultar o player
    } catch (e) {
        console.error('Erro ao carregar séries:', e);
        document.getElementById('seriesCategorias').innerHTML = '<div style="padding:20px;color:#f66">Erro ao carregar M3U: ' + e.message + '</div>';
        document.getElementById('seriesGrid').innerHTML = '';
        document.getElementById('serieInfo').textContent = '';
        document.getElementById('player_container_serie').style.display = 'none';
    }
}

// Carregar séries automaticamente quando a página carrega
window.addEventListener('DOMContentLoaded', inicializarSeries);

window.inicializarSeries = inicializarSeries; 
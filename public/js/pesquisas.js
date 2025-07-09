// Preencher header com usuário e servidor
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('usuario') || 'Usuário';
    const server = localStorage.getItem('servidor') || 'Padrão';
    const headerUser = document.getElementById('headerUser');
    const headerServer = document.getElementById('headerServer');
    if (headerUser) headerUser.textContent = user;
    if (headerServer) headerServer.textContent = `Servidor: ${server}`;

    // Formulário de busca global
    const globalSearchForm = document.getElementById('globalSearchForm');
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchForm && globalSearchInput) {
        globalSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termo = globalSearchInput.value.trim();
            if (termo) {
                window.location.href = `pesquisas.html?query=${encodeURIComponent(termo)}`;
            }
        });
        // Preencher input com termo atual
        const urlParams = new URLSearchParams(window.location.search);
        const termoAtual = urlParams.get('query') || '';
        globalSearchInput.value = termoAtual;
    }

    // Buscar e renderizar resultados
    const urlParams = new URLSearchParams(window.location.search);
    const termo = (urlParams.get('query') || '').toLowerCase();
    if (termo) renderSearchResults(termo);
});

function renderSearchResults(termo) {
    const grid = document.getElementById('searchResultsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let achou = false;
    // Canais
    if (window.categoriasCanais && Array.isArray(window.categoriasCanais)) {
        window.categoriasCanais.forEach(cat => {
            (cat.canais || []).forEach(canal => {
                if (canal.nome && canal.nome.toLowerCase().includes(termo)) {
                    achou = true;
                    grid.innerHTML += `
                        <div class='card-filme'>
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
                    grid.innerHTML += `
                        <div class='card-filme'>
                            <img src='${filme.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(nomeFilme.charAt(0))}' alt='${nomeFilme}' class='card-capa'>
                            <div class='card-titulo'>${nomeFilme}</div>
                            <div style='color:#6c63ff;font-size:13px;margin-top:4px;'>Filme</div>
                        </div>`;
                }
            });
        });
    }
    // Séries
    if (window.categoriasSeries && Array.isArray(window.categoriasSeries)) {
        window.categoriasSeries.forEach(cat => {
            (cat.series || []).forEach(serie => {
                const nomeSerie = serie.nome || serie.titulo;
                if (nomeSerie && nomeSerie.toLowerCase().includes(termo)) {
                    achou = true;
                    grid.innerHTML += `
                        <div class='card-filme'>
                            <img src='${serie.logo || 'https://placehold.co/160x220/222/fff?text=' + encodeURIComponent(nomeSerie.charAt(0))}' alt='${nomeSerie}' class='card-capa'>
                            <div class='card-titulo'>${nomeSerie}</div>
                            <div style='color:#6c63ff;font-size:13px;margin-top:4px;'>Série</div>
                        </div>`;
                }
            });
        });
    }
    if (!achou) {
        grid.innerHTML = '<div style="color:#bbb;padding:40px;text-align:center;">Nenhum resultado encontrado.</div>';
    }
} 
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const serverSelect = document.getElementById('serverSelect');
    const customServerGroup = document.getElementById('customServerGroup');
    const loginError = document.getElementById('loginError');

    // Mostrar/ocultar campo de servidor customizado
    serverSelect.addEventListener('change', function() {
        if (serverSelect.value === 'outro') {
            customServerGroup.style.display = 'block';
        } else {
            customServerGroup.style.display = 'none';
        }
    });

    // Manipular envio do formulário
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        loginError.style.display = 'none';
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        let servidor = '';
        switch(serverSelect.value) {
            case 'premium':
                servidor = 'zed5.top';
                break;
            case 'superpremium':
                servidor = 'voando66483.click';
                break;
            case 'padrao1':
                servidor = 'nplaylunar.shop';
                break;
            case 'padrao2':
                servidor = 'nplaysolar.shop';
                break;
            case 'outro':
                const custom = document.getElementById('customServer').value.trim();
                if (!custom) {
                    loginError.textContent = 'Digite o endereço do servidor.';
                    loginError.style.display = 'block';
                    return;
                }
                servidor = custom;
                break;
        }
        if (!username || !password || !servidor) {
            loginError.textContent = 'Preencha todos os campos.';
            loginError.style.display = 'block';
            return;
        }
        // Monta a URL M3U
        const m3uUrl = `http://${servidor}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`;
        // Salva no localStorage para uso no dashboard
        localStorage.setItem('m3uUrl', m3uUrl);
        localStorage.setItem('username', username);
        localStorage.setItem('servidor', servidor);
        // Redireciona para o dashboard
        window.location.href = 'dashboard.html';
    });

    // Animação adicional para os inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Verificar se já está logado
    checkAuthStatus();

    async function checkAuthStatus() {
        try {
            const response = await fetch('/user');
            if (response.ok) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            // Usuário não está logado, continuar na página de login
        }
    }
});
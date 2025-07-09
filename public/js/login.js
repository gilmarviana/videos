document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const serverSelect = document.getElementById('server'); // Corrigido para o id correto
    const customServerGroup = document.getElementById('customServerGroup');
    const loginError = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');

    // Mostrar/ocultar campo de servidor customizado
    serverSelect.addEventListener('change', function() {
        if (serverSelect.value === 'outro') {
            customServerGroup.style.display = 'block';
        } else {
            customServerGroup.style.display = 'none';
        }
    });

    // Manipular envio do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        loginError.style.display = 'none';
        loadingMessage.style.display = 'block';
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        let servidor = '';
        let serverValue = serverSelect.value;
        let customServer = '';
        switch(serverValue) {
            case 'premium (Concluído)':
                servidor = 'zed5.top';
                break;
            case 'super-premium (manutenção)':
                servidor = 'voando66483.click';
                break;
            case 'padrao-1 (manutenção)':
                servidor = 'nplaylunar.shop';
                break;
            case 'padrao-2 (manutenção)':
                servidor = 'nplaysolar.shop';
                break;
            case 'outro':
                customServer = document.getElementById('customServer').value.trim();
                if (!customServer) {
                    loginError.textContent = 'Digite o endereço do servidor.';
                    loginError.style.display = 'block';
                    loadingMessage.style.display = 'none';
                    return;
                }
                servidor = customServer;
                break;
            default:
                loginError.textContent = 'Selecione um servidor.';
                loginError.style.display = 'block';
                loadingMessage.style.display = 'none';
                return;
        }
        if (!username || !password || !servidor) {
            loginError.textContent = 'Preencha todos os campos.';
            loginError.style.display = 'block';
            loadingMessage.style.display = 'none';
            return;
        }
        // Validar login e M3U antes de conectar
        try {
            // Primeiro, testar se o login é válido
            const testM3uUrl = `http://${servidor}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=m3u8`;
            
            loadingMessage.innerHTML = '<div class="loading-spinner"></div><span>Validando credenciais...</span>';
            
            // Usar a função de validação robusta
            await validateM3U(testM3uUrl);
            
            // Se chegou até aqui, as credenciais são válidas
            loadingMessage.innerHTML = '<div class="loading-spinner"></div><span>Redirecionando...</span>';
            
            // Salva no localStorage para uso no dashboard
            localStorage.setItem('m3uUrl', testM3uUrl);
            localStorage.setItem('username', username);
            localStorage.setItem('servidor', servidor);
            localStorage.setItem('server', serverValue); // Salva o valor escolhido (premium, super-premium, etc.)
            
            // Redireciona diretamente para o dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (err) {
            console.log('Erro na validação:', err.message);
            
            // Salva no localStorage
            const testM3uUrl = `http://${servidor}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=m3u8`;
            localStorage.setItem('m3uUrl', testM3uUrl);
            localStorage.setItem('username', username);
            localStorage.setItem('servidor', servidor);
            localStorage.setItem('server', serverValue);
            
            // Se a mensagem for "Credenciais inválidas", autoriza o acesso
            if (err.message.includes('Credenciais inválidas')) {
                loginError.textContent = 'Aviso: Credenciais inválidas - Autorizando acesso...';
                loginError.style.display = 'block';
                
                // Redireciona após 2 segundos
                setTimeout(() => {
                    loadingMessage.innerHTML = '<div class="loading-spinner"></div><span>Redirecionando...</span>';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }, 2000);
            } else {
                // Para outros erros, verifica se é "Servidor não respondeu corretamente"
                if (err.message.includes('Acesso inválido, verifique com a administração')) {
                    loginError.textContent = ''; // Texto em branco
                    loginError.style.display = 'block';
                    loadingMessage.style.display = 'none';
                } else {
                    // Para outros erros, mostra o erro normalmente
                    loginError.textContent = err.message || 'Erro de conexão com o servidor.';
                    loginError.style.display = 'block';
                    loadingMessage.style.display = 'none';
                }
            }
        }
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

    // Removido redirecionamento automático - usuário deve fazer login manualmente
});

// Função para mostrar/ocultar senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
    }
}

// Função para validar M3U de forma mais robusta
async function validateM3U(m3uUrl) {
    try {
        const response = await fetch(m3uUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/plain, application/x-mpegurl, application/vnd.apple.mpegurl'
            }
        });
        
        if (!response.ok) {
            throw new Error('Servidor não respondeu corretamente');
        }
        
        const content = await response.text();
        
        // Verificar se é um M3U válido
        if (!content.includes('#EXTM3U')) {
            throw new Error('Formato M3U inválido');
        }
        
        // Verificar se há erros no conteúdo (menos restritivo)
        if (content.includes('error') && content.includes('invalid') && content.includes('unauthorized')) {
            throw new Error('Credenciais inválidas');
        }
        
        // Verificar se há pelo menos alguns canais (opcional)
        const channelCount = (content.match(/#EXTINF/g) || []).length;
        if (channelCount === 0) {
            console.warn('Nenhum canal encontrado, mas permitindo acesso');
        }
        
        return true;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
            // Se for erro de CORS, tentar uma abordagem diferente
            return await validateM3UAlternative(m3uUrl);
        }
        throw error;
    }
}

// Função alternativa para validar M3U (para casos de CORS)
async function validateM3UAlternative(m3uUrl) {
    try {
        // Tentar através do backend
        const response = await fetch('/validate-m3u', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ m3uUrl })
        });
        
        if (!response.ok) {
            throw new Error('Erro na validação do M3U');
        }
        
        const data = await response.json();
        if (!data.valid) {
            throw new Error(data.error || 'M3U inválido');
        }
        
        return true;
    } catch (error) {
        throw new Error('Não foi possível validar o M3U. Verifique suas credenciais.');
    }
}
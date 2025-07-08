document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const serverSelect = document.getElementById('server');
    const customServerGroup = document.getElementById('customServerGroup');
    const errorMessage = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Mostrar/ocultar campo de servidor customizado
    serverSelect.addEventListener('change', function() {
        if (this.value === 'outro') {
            customServerGroup.style.display = 'block';
            customServerGroup.querySelector('input').required = true;
        } else {
            customServerGroup.style.display = 'none';
            customServerGroup.querySelector('input').required = false;
            customServerGroup.querySelector('input').value = '';
        }
    });

    // Manipular envio do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Limpar mensagens anteriores
        hideMessages();
        
        // Mostrar loading
        showLoading();
        
        // Coletar dados do formulário
        const formData = new FormData(this);
        const data = {
            username: formData.get('username'),
            password: formData.get('password'),
            server: formData.get('server'),
            customServer: formData.get('customServer')
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Login bem-sucedido
                showSuccess('Login realizado com sucesso! Redirecionando...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                // Erro no login
                showError(result.error || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showError('Erro de conexão. Tente novamente.');
        } finally {
            hideLoading();
        }
    });

    function showLoading() {
        loadingMessage.style.display = 'block';
        loginBtn.disabled = true;
    }

    function hideLoading() {
        loadingMessage.style.display = 'none';
        loginBtn.disabled = false;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'success-message';
        errorMessage.style.background = '#d4edda';
        errorMessage.style.color = '#155724';
        errorMessage.style.borderLeftColor = '#28a745';
    }

    function hideMessages() {
        errorMessage.style.display = 'none';
    }

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
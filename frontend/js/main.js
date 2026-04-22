/**
 * Main - Manejador de eventos y lógica del frontend
 */

// Variable global para guardar el intervalo de actualización del tiempo
let timeRemainingInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    if (AuthService.isAuthenticated()) {
        showJwtInfo();
    }

    // Event listeners para los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    // Event listeners para los formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

/**
 * Cambia entre tabs de login y registro
 */
function switchTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar el tab seleccionado
    document.getElementById(tabName).classList.add('active');

    // Activar el botón seleccionado
    event.target.classList.add('active');

    // Limpiar mensajes de error
    document.getElementById('loginError').innerHTML = '';
    document.getElementById('registerError').innerHTML = '';
    document.getElementById('registerSuccess').innerHTML = '';
}

/**
 * Maneja el submit del formulario de login
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    // Limpiar errores previos
    errorDiv.innerHTML = '';
    errorDiv.classList.remove('show');

    try {
        // Realizar login
        await AuthService.login(email, password);

        // Mostrar información del JWT
        showJwtInfo();

        // Limpiar formulario
        document.getElementById('loginForm').reset();
    } catch (error) {
        // Mostrar error
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
}

/**
 * Maneja el submit del formulario de registro
 */
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    // Limpiar mensajes previos
    errorDiv.innerHTML = '';
    errorDiv.classList.remove('show');
    successDiv.innerHTML = '';
    successDiv.classList.remove('show');

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.add('show');
        return;
    }

    try {
        // Realizar registro
        const response = await AuthService.register(username, email, password, passwordConfirm);

        // Mostrar mensaje de éxito
        successDiv.textContent = response.message;
        successDiv.classList.add('show');

        // Limpiar formulario
        document.getElementById('registerForm').reset();

        // Cambiar a tab de login después de 2 segundos
        setTimeout(() => {
            switchTab('login');
        }, 2000);
    } catch (error) {
        // Mostrar error
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
}

/**
 * Muestra la información del JWT decodificado
 */
function showJwtInfo() {
    const authSection = document.getElementById('authSection');
    const jwtSection = document.getElementById('jwtSection');

    // Obtener datos
    const accessToken = AuthService.getAccessToken();
    const user = AuthService.getUser();

    if (!accessToken || !user) {
        return;
    }

    // Ocultar sección de autenticación y mostrar JWT info
    authSection.style.display = 'none';
    jwtSection.style.display = 'block';

    // Mostrar información del usuario
    document.getElementById('userId').textContent = user.id;
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;

    // Mostrar token completo
    document.getElementById('fullToken').textContent = accessToken;

    // Decodificar y mostrar JWT
    try {
        const decoded = JwtDecoder.decode(accessToken);

        // Header
        document.getElementById('jwtHeader').textContent = JSON.stringify(decoded.header, null, 2);

        // Payload
        document.getElementById('jwtPayload').textContent = JSON.stringify(decoded.payload, null, 2);

        // Signature (mostrar solo una parte para seguridad)
        const signaturePreview = decoded.signature.substring(0, 20) + '...';
        document.getElementById('jwtSignature').textContent = signaturePreview + '\n(Firma secreta - no se muestra completa)';

        // Información del token
        const expiresAt = decoded.payload.exp;
        const issuedAt = decoded.payload.iat;

        document.getElementById('tokenType').textContent = 'Bearer Token (JWT)';
        document.getElementById('issuedAt').textContent = JwtDecoder.formatDate(issuedAt);
        document.getElementById('expiresAt').textContent = JwtDecoder.formatDate(expiresAt);

        // Limpiar el intervalo anterior si existe
        if (timeRemainingInterval) {
            clearInterval(timeRemainingInterval);
        }

        // Actualizar tiempo restante cada segundo
        updateTimeRemaining(expiresAt);
        timeRemainingInterval = setInterval(() => updateTimeRemaining(expiresAt), 1000);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
    }
}

/**
 * Actualiza el tiempo restante de expiración del token
 */
function updateTimeRemaining(expiresAt) {
    const timeRemaining = JwtDecoder.getTimeRemaining(expiresAt);
    document.getElementById('timeRemaining').textContent = timeRemaining;

    // Cambiar color si falta poco tiempo
    const remaining = expiresAt - Math.floor(Date.now() / 1000);
    const timeRemainingSpan = document.getElementById('timeRemaining');

    if (remaining < 300) { // Menos de 5 minutos
        timeRemainingSpan.style.color = '#ff6b6b';
        timeRemainingSpan.style.fontWeight = 'bold';
    } else {
        timeRemainingSpan.style.color = 'inherit';
        timeRemainingSpan.style.fontWeight = 'normal';
    }
}

/**
 * Renueva el access token
 */
async function refreshAccessToken() {
    const errorDiv = document.getElementById('refreshError');
    errorDiv.innerHTML = '';
    errorDiv.classList.remove('show');

    try {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No hay refresh token disponible');
        }

        // Renovar token
        await AuthService.refreshAccessToken(refreshToken);

        // Actualizar la información mostrada
        showJwtInfo();

        // Mostrar notificación de éxito
        alert('✅ Access token renovado exitosamente');
    } catch (error) {
        errorDiv.textContent = 'Error renovando token: ' + error.message;
        errorDiv.classList.add('show');
    }
}

/**
 * Cierra la sesión
 */
function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar el intervalo antes de hacer logout
        if (timeRemainingInterval) {
            clearInterval(timeRemainingInterval);
            timeRemainingInterval = null;
        }
        AuthService.logout();
        window.location.reload();
    }
}

/**
 * Copia el token al portapapeles
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Token copiado al portapapeles');
    }).catch(() => {
        alert('❌ Error al copiar el token');
    });
}

/**
 * Prueba un endpoint protegido con el token actual
 * Demuestra qué pasa cuando el token expira
 */
async function testProtectedEndpoint() {
    const testDiv = document.getElementById('testEndpointResult');
    testDiv.innerHTML = '';
    testDiv.className = 'info-message';

    try {
        testDiv.innerHTML = '⏳ Probando endpoint protegido...';
        
        // Hacer petición al endpoint protegido /api/auth/me
        const response = await AuthService.makeProtectedRequest('http://localhost:8080/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Token válido
            testDiv.className = 'success-message show';
            testDiv.innerHTML = `
                <strong>✅ Token Válido - Endpoint Protegido Funcionó</strong><br>
                ${data.message}<br>
                <small>Usuario: ${data.data.username} | Timestamp: ${new Date(data.data.timestamp).toLocaleString()}</small>
            `;
        } else {
            // Token expirado o inválido
            testDiv.className = 'error-message show';
            testDiv.innerHTML = `
                <strong>❌ Error 401 - Token Expirado o Inválido</strong><br>
                ${data.error || 'No autorizado'}<br>
                <small>El servidor rechazó el token. Ya no es válido.</small>
            `;
        }
    } catch (error) {
        testDiv.className = 'error-message show';
        testDiv.innerHTML = `
            <strong>❌ Error de Conexión</strong><br>
            ${error.message}
        `;
    }
}

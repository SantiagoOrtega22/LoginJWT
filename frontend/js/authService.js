/**
 * Auth Service - Maneja la lógica de autenticación
 * Realiza requests a los endpoints del backend para:
 * - Registro de usuarios
 * - Login
 * - Renovación de tokens
 */

const API_URL = 'http://localhost:8080/api/auth';

// Claves para localStorage
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    TOKEN_EXPIRY: 'tokenExpiry'
};

class AuthService {
    /**
     * Registra un nuevo usuario
     * @param {string} username - Nombre de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @param {string} passwordConfirm - Confirmación de contraseña
     * @returns {Promise<object>} Respuesta del servidor
     */
    static async register(username, email, password, passwordConfirm) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    passwordConfirm
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Inicia sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Datos del usuario y tokens
     */
    static async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            // Guardar tokens y datos del usuario en localStorage
            const loginData = data.data;
            this.saveTokens(
                loginData.accessToken,
                loginData.refreshToken,
                loginData.expiresIn
            );
            this.saveUser(loginData.user);

            return loginData;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Renueva el access token usando el refresh token
     * @param {string} refreshToken - Token de renovación
     * @returns {Promise<object>} Nuevo access token
     */
    static async refreshAccessToken(refreshToken) {
        try {
            const response = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error renovando token');
            }

            // Actualizar tokens en localStorage
            const loginData = data.data;
            this.saveTokens(
                loginData.accessToken,
                loginData.refreshToken,
                loginData.expiresIn
            );

            return loginData;
        } catch (error) {
            console.error('Error renovando token:', error);
            throw error;
        }
    }

    /**
     * Guarda los tokens en localStorage
     * @private
     */
    static saveTokens(accessToken, refreshToken, expiresIn) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, Date.now() + (expiresIn * 1000));
    }

    /**
     * Obtiene el access token del localStorage
     */
    static getAccessToken() {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Obtiene el refresh token del localStorage
     */
    static getRefreshToken() {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Guarda los datos del usuario en localStorage
     * @private
     */
    static saveUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    /**
     * Obtiene los datos del usuario del localStorage
     */
    static getUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Verifica si hay una sesión activa
     */
    static isAuthenticated() {
        return !!this.getAccessToken();
    }

    /**
     * Limpia la sesión (logout)
     */
    static logout() {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    }

    /**
     * Obtiene el access token con el prefijo Bearer
     */
    static getAuthHeader() {
        const token = this.getAccessToken();
        return token ? `Bearer ${token}` : null;
    }

    /**
     * Hace un fetch protegido con manejo automático de refresh de token
     * Si recibe 401, automáticamente intenta renovar el token y reintentar
     * @param {string} url - URL a la que hacer fetch
     * @param {object} options - Opciones de fetch (method, body, headers, etc)
     * @param {boolean} retried - Indica si ya fue reintentado (evita loops infinitos)
     * @returns {Promise<Response>}
     */
    static async protectedFetch(url, options = {}, retried = false) {
        // Agregar token al header
        if (!options.headers) {
            options.headers = {};
        }
        
        const authHeader = this.getAuthHeader();
        if (authHeader) {
            options.headers['Authorization'] = authHeader;
        }

        let response = await fetch(url, options);

        // Si recibe 401 y aún no ha reintentado
        if (response.status === 401 && !retried) {
            console.warn('Token expirado, intentando renovar...');
            
            try {
                const refreshToken = this.getRefreshToken();
                if (!refreshToken) {
                    // No hay refresh token - redirigir al login
                    this.logout();
                    window.location.href = '/';
                    throw new Error('No hay refresh token disponible');
                }

                // Intentar renovar el token
                await this.refreshAccessToken(refreshToken);
                console.log('✅ Token renovado exitosamente');

                // Reintentar la petición original con el nuevo token
                return this.protectedFetch(url, options, true);
            } catch (error) {
                console.error('❌ Error al renovar token:', error.message);
                // Si falla la renovación, limpiar y redirigir al login
                this.logout();
                window.location.href = '/';
                throw error;
            }
        }

        return response;
    }

    /**
     * Hace una petición a un endpoint protegido SIN renovación automática
     * Útil para demostrar qué pasa cuando el token expira
     * @param {string} url - URL a la que hacer fetch
     * @param {object} options - Opciones de fetch
     * @returns {Promise<Response>}
     */
    static async makeProtectedRequest(url, options = {}) {
        // Agregar token al header
        if (!options.headers) {
            options.headers = {};
        }
        
        const authHeader = this.getAuthHeader();
        if (!authHeader) {
            throw new Error('No hay token disponible. Por favor inicia sesión primero.');
        }

        options.headers['Authorization'] = authHeader;
        return fetch(url, options);
    }
}

/**
 * JWT Decoder - Decodifica y analiza JWT
 * Un JWT está compuesto por 3 partes separadas por puntos:
 * header.payload.signature
 */

class JwtDecoder {
    /**
     * Decodifica un JWT y retorna sus partes
     * @param {string} token - El token JWT
     * @returns {object} Objeto con header, payload y signature decodificados
     */
    static decode(token) {
        try {
            const parts = token.split('.');
            
            if (parts.length !== 3) {
                throw new Error('Token JWT inválido: debe tener 3 partes');
            }

            const [headerBase64, payloadBase64, signatureBase64] = parts;

            return {
                header: this.decodeBase64Url(headerBase64),
                payload: this.decodeBase64Url(payloadBase64),
                signature: signatureBase64,
                raw: {
                    header: headerBase64,
                    payload: payloadBase64,
                    signature: signatureBase64
                }
            };
        } catch (error) {
            console.error('Error decodificando JWT:', error);
            throw error;
        }
    }

    /**
     * Decodifica una cadena Base64 URL (usada en JWT)
     * @private
     */
    static decodeBase64Url(base64Url) {
        // Convertir Base64 URL a Base64 regular
        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Decodificar Base64 a string
        const jsonStr = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        // Convertir string JSON a objeto
        return JSON.parse(jsonStr);
    }

    /**
     * Convierte timestamp Unix a fecha legible
     * @param {number} timestamp - Timestamp Unix en segundos
     * @returns {string} Fecha en formato legible
     */
    static formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Calcula el tiempo restante hasta la expiración
     * @param {number} expTimestamp - Timestamp Unix de expiración
     * @returns {string} Tiempo restante en formato legible
     */
    static getTimeRemaining(expTimestamp) {
        const now = Math.floor(Date.now() / 1000);
        const remaining = expTimestamp - now;

        if (remaining <= 0) {
            return 'Token expirado';
        }

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }

    /**
     * Verifica si un token está expirado
     * @param {number} expTimestamp - Timestamp Unix de expiración
     * @returns {boolean}
     */
    static isExpired(expTimestamp) {
        const now = Math.floor(Date.now() / 1000);
        return expTimestamp < now;
    }
}

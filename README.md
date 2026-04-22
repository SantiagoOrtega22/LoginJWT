# 🔐 JWT Taller - Sistema de Autenticación

---

## 📚 ¿Qué es JWT y su Importancia?

**JWT** (JSON Web Token) es un token digital de acceso que:

- **Identifica al usuario** - contiene información (ID, username, email)
- **Es seguro** - está firmado criptográficamente, imposible falsificar
- **Es autocontenido** - incluye toda la información sin consultar la BD
- **Mejora rendimiento** - elimina consultas a BD en cada request

### Estructura: 3 Partes Separadas por Puntos

```
Header.Payload.Signature

Header:     { "alg": "HS256", "typ": "JWT" }
Payload:    { "userId": 1, "username": "john", "email": "john@example.com", "exp": 1234571490 }
Signature:  (Firma criptográfica - solo servidor puede crear)
```

### Ventajas sobre Sesiones Tradicionales

| Aspecto | Sesiones | JWT |
|---------|----------|-----|
| **BD en cada request** | ❌ Sí | ✅ No |
| **Múltiples servidores** | ❌ Sincronización | ✅ Sin sincronización |
| **CORS** | ❌ Limitado | ✅ Cualquier dominio |
| **Móviles/APIs** | ❌ Problemático | ✅ Perfecto |

---

## 🔧 Implementación del Login a JWT

### Flujo de Autenticación

```
1. Usuario envía email + password
        ↓
2. Backend valida en BD (BCrypt)
        ↓
3. Backend genera:
   - Access Token (15 min) ← para acceder a recursos
   - Refresh Token (7 días) ← para renovar access token
        ↓
4. Frontend almacena en localStorage
        ↓
5. Frontend envía en header: Authorization: Bearer {token}
        ↓
6. Backend verifica firma criptográfica (sin consultar BD)
        ↓
7. Si válido → acceso permitido ✅
   Si expirado → error 401 ❌
```

### Componentes Implementados

**Backend (Spring Boot):**
- `JwtProvider.java` - Genera y valida JWT
- `JwtAuthenticationFilter.java` - Valida token en cada request
- `AuthController.java` - Endpoints de login, register, refresh
- `SecurityConfig.java` - Configuración de seguridad
- `User.java` + `UserRepository.java` - Almacenamiento de usuarios

**Frontend (JavaScript):**
- `authService.js` - Lógica de login, register, refresh
- `jwtDecoder.js` - Decodifica JWT (Header, Payload, Signature)
- `main.js` - Manejo de UI y eventos

**Seguridad:**
- ✅ Contraseñas encriptadas con BCrypt
- ✅ Tokens firmados criptográficamente (HS256)
- ✅ CORS habilitado para solicitudes del frontend
- ✅ Validación JWT en cada request protegido

---

## 📦 Qué Contiene la Aplicación

### ✅ Funcionalidades

- Registro de nuevos usuarios
- Login con email y contraseña
- Visualización decodificada del JWT (Header, Payload, Signature)
- Renovación automática de tokens
- Endpoint protegido para demostrar expiración
- Contador regresivo de tiempo de expiración
- Manejo de errores 401 (token expirado)

### 📁 Estructura

```
backend/                              # Spring Boot
├── config/SecurityConfig.java        # Configuración de seguridad
├── controller/AuthController.java    # Endpoints (/api/auth/*)
├── filter/JwtAuthenticationFilter.java # Valida JWT
├── provider/JwtProvider.java         # Genera/valida JWT
├── entity/User.java                  # Modelo de usuario
├── service/AuthService.java          # Lógica de autenticación
├── repository/UserRepository.java    # Acceso a BD
└── application.properties            # Configuración

frontend/                             # JavaScript Vanilla
├── index.html                        # Interfaz
├── css/styles.css                    # Estilos
└── js/
    ├── authService.js                # Login, register, refresh
    ├── jwtDecoder.js                 # Decodifica JWT
    └── main.js                       # Eventos y UI
```

---

## 🚀 Cómo Ejecutarla

### Requisitos Previos

```bash
java -version          # Debe ser 17+
mvn -version          # Debe ser 3.8+
mysql --version       # MySQL activo
```

### Pasos

**1. Crear base de datos:**
```bash
mysql -u root -p -e "CREATE DATABASE jwt_taller;"
```

**2. Iniciar backend:**
```bash
cd backend
mvn spring-boot:run
```

Espera a ver: `Tomcat started on port(s): 8080`

**3. Abrir frontend en navegador:**
```
file:///ruta/a/tu/TallerJWT/frontend/index.html
```

**4. Probar:**
- Haz clic en "Registrarse"
- Completa: usuario `test`, email `test@test.com`, contraseña `test123`
- Haz clic en "Iniciar Sesión"
- ¡Verás tu JWT decodificado! 🎉

### Configuración Opcional

**Cambiar tiempos de expiración** en `backend/src/main/resources/application.properties`:

```properties
jwt.expiration.access=900000      # Access token (15 minutos)
jwt.expiration.refresh=604800000  # Refresh token (7 días)
```

**Cambiar credenciales MySQL:**

```properties
spring.datasource.password=tu_password
```

---

## 📝 Endpoints

**Públicos:**
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token

**Protegidos (requieren JWT válido):**
- `GET /api/auth/me` - Información del usuario autenticado

---

## 🎓 Conceptos Clave

- **Access Token** - Token de corta vida para acceder a recursos
- **Refresh Token** - Token de larga vida para renovar el access token
- **Payload** - Información dentro del token (claims)
- **Signature** - Firma criptográfica que valida autenticidad
- **Bearer Token** - Formato de envío: `Authorization: Bearer {token}`
- **Stateless** - No requiere sesiones en servidor

---

**Creado para:** Entornos de Programación 2026-1
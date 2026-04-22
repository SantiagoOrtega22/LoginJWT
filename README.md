# 🔐 JWT Taller - Sistema de Autenticación

Sistema educativo completo para entender cómo funcionan los **JSON Web Tokens (JWT)** con un backend en **Spring Boot** y un frontend en **JavaScript Vanilla**.

---

## 📚 ¿Qué es JWT?

**JWT** (JSON Web Token) es un token de acceso digital que:

- **Identifica al usuario** - contiene información sobre quién es (ID, username, email)
- **Es seguro** - está firmado criptográficamente, no se puede falsificar
- **Es autocontenido** - incluye toda la información necesaria sin consultar la BD
- **Es portátil** - funciona en cualquier dominio (móviles, SPAs, APIs)

### Analogía: Pasaporte Digital

```
JWT es como un pasaporte:
- Contiene tu identidad (foto, nombre, datos)
- Está sellado por una autoridad (firma criptográfica)
- Lo llevas contigo para probar quién eres
- Los aduaneros lo verifican sin contactar al gobierno
```

### Estructura: 3 Partes Separadas por Puntos

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJ1c2VySWQiOjEsIm5hbWUiOiJKb2huIn0 . TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
^                                         ^                                           ^
HEADER (algoritmo, tipo)                  PAYLOAD (información del usuario)           SIGNATURE (firma criptográfica)
```

**Header:**
```json
{
  "alg": "HS256",  // Algoritmo para firmar
  "typ": "JWT"     // Tipo de token
}
```

**Payload (Claims):**
```json
{
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "iat": 1234567890,    // Emitido en
  "exp": 1234571490     // Expira en
}
```

**Signature:** Solo el servidor puede crear (clave secreta privada)

---

## 🎯 ¿Por qué JWT?

| Aspecto | Sesiones Tradicionales | JWT |
|--------|----------------------|-----|
| **Base de Datos** | ❌ Consulta en cada request | ✅ Verificación criptográfica (sin BD) |
| **Escalabilidad** | ❌ Sincronización entre servidores | ✅ Funciona en múltiples servidores |
| **CORS** | ❌ Limitado a mismo dominio | ✅ Funciona con cualquier dominio |
| **Móvil** | ❌ Cookies problemáticas | ✅ Perfect para APIs REST |
| **Rendimiento** | ❌ Más lento (BD en cada request) | ✅ Más rápido (verificación local) |

---

## 📋 Qué Contiene Esta Aplicación

### ✅ Características Implementadas

- **Registro de usuarios** - crear nueva cuenta
- **Login** - autenticación con email y contraseña
- **Generación de tokens** - Access Token (15 min) y Refresh Token (7 días)
- **Renovación de tokens** - obtener nuevo token cuando expira
- **Visualización decodificada** - ver qué contiene el JWT (Header, Payload, Signature)
- **Seguridad con BCrypt** - contraseñas encriptadas
- **JWT Filter** - valida tokens en cada request
- **Endpoint protegido** - prueba que el token expira y se rechaza
- **Indicador de expiración** - cuenta regresiva del tiempo restante

### 🏗️ Estructura del Proyecto

```
TallerJWT/
├── backend/                    # Spring Boot
│   ├── pom.xml                # Dependencias Maven
│   └── src/main/java/com/jwt/
│       ├── JwtTallerApplication.java
│       ├── config/
│       │   └── SecurityConfig.java        # Configuración de seguridad
│       ├── controller/
│       │   └── AuthController.java        # Endpoints (/api/auth/*)
│       ├── filter/
│       │   └── JwtAuthenticationFilter.java # Valida JWT en cada request
│       ├── provider/
│       │   └── JwtProvider.java           # Genera y valida JWT
│       ├── entity/
│       │   └── User.java                  # Modelo de usuario
│       ├── service/
│       │   ├── AuthService.java           # Lógica de autenticación
│       │   └── UserService.java
│       ├── repository/
│       │   └── UserRepository.java        # Acceso a BD
│       └── dto/
│           ├── LoginRequest/Response.java
│           ├── RegisterRequest.java
│           └── RefreshTokenRequest.java
│
└── frontend/                   # JavaScript Vanilla
    ├── index.html              # Interfaz (login, registro, JWT visualizador)
    ├── css/
    │   └── styles.css          # Estilos (gradientes, animaciones)
    └── js/
        ├── authService.js      # Lógica de autenticación (login, register, refresh)
        ├── jwtDecoder.js       # Decodifica JWT a Header, Payload, Signature
        └── main.js             # Manejo de eventos y UI
```

---

## 🚀 Inicio Rápido (5 minutos)

### Requisitos Previos

```bash
java -version          # Debe ser 17+
mvn -version          # Debe ser 3.8+
mysql --version       # MySQL activo
```

### 1. Crear Base de Datos

```bash
mysql -u root -p -e "CREATE DATABASE jwt_taller;"
```

Si MySQL tiene contraseña: `mysql -u root -pTU_PASSWORD -e "CREATE DATABASE jwt_taller;"`

### 2. Iniciar Backend

```bash
cd backend
mvn spring-boot:run
```

Espera a ver: `Tomcat started on port(s): 8080`

### 3. Abrir Frontend

Abre en tu navegador:
```
file:///ruta/a/tu/TallerJWT/frontend/index.html
```

### 4. Probar la Aplicación

**Registro:**
- Usuario: `test`
- Email: `test@test.com`
- Contraseña: `test123`

**Login:**
- Email: `test@test.com`
- Contraseña: `test123`

**Verás:**
- ✅ JWT completo
- ✅ Header decodificado
- ✅ Payload con tu información
- ✅ Tiempo de expiración en cuenta regresiva

---

## ⚙️ Configuración

### Editar Tiempos de Expiración

En `backend/src/main/resources/application.properties`:

```properties
# Tiempo de expiración del access token (milisegundos)
jwt.expiration.access=900000    # 15 minutos

# Tiempo de expiración del refresh token (milisegundos)
jwt.expiration.refresh=604800000 # 7 días
```

**Ejemplos:**
- 5 minutos = `300000`
- 1 hora = `3600000`
- 1 día = `86400000`

### Cambiar Credenciales MySQL

En `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jwt_taller
spring.datasource.username=root
spring.datasource.password=tu_password
```

---

## 🔒 Seguridad Implementada

### Backend
- ✅ **BCrypt** - contraseñas encriptadas
- ✅ **JWT Signature** - tokens firmados criptográficamente
- ✅ **CORS** - habilitado para solicitudes del frontend
- ✅ **Spring Security** - autorización en endpoints
- ✅ **Validación JWT** - cada request verifica token válido

### Frontend
- ✅ **localStorage** - almacenamiento seguro de tokens
- ✅ **Bearer Token** - envío correcto en headers Authorization
- ✅ **Manejo de errores 401** - detección de tokens expirados

---

## 🧪 Probar Expiración de Token

1. **Edita `application.properties`** para un tiempo corto:
   ```properties
   jwt.expiration.access=10000  # 10 segundos
   ```

2. **Reinicia el backend** y haz login

3. **Espera 10 segundos** para que expire el token

4. **Haz click en "🔒 Probar Endpoint Protegido"**

5. **Verás:**
   - ✅ Funciona mientras sea válido
   - ❌ Error 401 cuando expira
   - 🔄 Al renovar, vuelve a funcionar

---

## 📝 Endpoints Disponibles

### Públicos (sin token)

```
POST /api/auth/register
  Body: { username, email, password, passwordConfirm }
  Response: { success, message }

POST /api/auth/login
  Body: { email, password }
  Response: { success, data: { accessToken, refreshToken, expiresIn, user } }

POST /api/auth/refresh
  Body: { refreshToken }
  Response: { success, data: { accessToken, refreshToken, expiresIn } }
```

### Protegidos (requieren JWT válido)

```
GET /api/auth/me
  Header: Authorization: Bearer {token}
  Response: { success, message, data: { username, timestamp, info } }
  Error 401: Token expirado o inválido
```

---

## 🐛 Solucionar Problemas

### "Error: Cannot connect to localhost:8080"
```bash
# Verifica que el backend está corriendo
# Terminal 1: cd backend && mvn spring-boot:run
```

### "Error: Access denied for user 'root'"
```bash
# Edita application.properties con tu contraseña MySQL
spring.datasource.password=tu_password
```

### "Error: Database doesn't exist"
```bash
# Crea la BD
mysql -u root -p -e "CREATE DATABASE jwt_taller;"
```

### Frontend no se conecta al backend
1. Abre consola (F12)
2. Busca errores CORS
3. Verifica que el backend está en puerto 8080
4. Recarga la página

---

## 🎓 Conceptos Clave Aprendidos

| Concepto | Descripción |
|----------|------------|
| **JWT** | Token de acceso autenticado |
| **Bearer Token** | Envío en header `Authorization: Bearer {token}` |
| **Access Token** | Token de corta vida para acceder a recursos |
| **Refresh Token** | Token de larga vida para renovar el access token |
| **Payload** | Información dentro del token (claims) |
| **Signature** | Firma criptográfica que valida la autenticidad |
| **CORS** | Permite solicitudes desde diferentes dominios |
| **BCrypt** | Algoritmo de hash seguro para contraseñas |
| **Stateless** | No requiere mantener sesiones en servidor |

---

## 📚 Para Aprender Más

- [JWT Official](https://jwt.io) - Especificación oficial
- [Spring Security JWT](https://spring.io/projects/spring-security)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Estándar oficial de JWT
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📄 Licencia

Proyecto educativo - Uso libre para aprendizaje

---

**Creado para:** Entornos de Programación 2026-1
**Última actualización:** 22 de abril de 2026
- Seguridad en JWT

## 📚 Endpoints de la API

### 1. Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Respuesta (201 Created)**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Ahora puedes iniciar sesión."
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta (200 OK)**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@example.com"
    }
  }
}
```

### 3. Renovar Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Respuesta (200 OK)**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@example.com"
    }
  }
}
```

## 🧪 Testing Manual

### Con cURL

```bash
# Registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "test123",
    "passwordConfirm": "test123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# Refresh Token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN"
  }'
```

### Con el Frontend
1. Abre `frontend/index.html` en tu navegador
2. Regístrate con un nuevo usuario
3. Inicia sesión
4. Observa cómo se decodifica el JWT en tiempo real
5. Prueba renovar el token
6. Cierra sesión

## 🔧 Configuración Personalizada

### Cambiar tiempo de expiración de tokens

En `backend/src/main/resources/application.properties`:

```properties
# Access token: 15 minutos (900000 ms)
jwt.expiration.access=900000

# Refresh token: 7 días (604800000 ms)
jwt.expiration.refresh=604800000
```

### Cambiar clave secreta JWT

En el mismo archivo:

```properties
# IMPORTANTE: Cambiar en producción
jwt.secret=TuClaveSecretaAquiQueTengaAlMenos32Caracteres
```

### Cambiar credenciales de MySQL

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jwt_taller
spring.datasource.username=root
spring.datasource.password=tuPassword
```

## ⚠️ Notas de Seguridad

### Para Desarrollo
- Este proyecto almacena tokens en `localStorage` (NO SEGURO para producción)
- La contraseña de MySQL es vacía por defecto
- La clave secreta JWT es una cadena débil

### Para Producción
- ✅ Usar `httpOnly cookies` en lugar de `localStorage`
- ✅ Usar HTTPS en lugar de HTTP
- ✅ Cambiar la clave secreta JWT a una cadena larga y aleatoria
- ✅ Implementar tasa de límite (rate limiting) en los endpoints
- ✅ Usar CORS restrictivo (no `*`)
- ✅ Implementar CSRF protection
- ✅ Validar y sanitizar todas las entradas
- ✅ Usar variables de entorno para credenciales

## 📊 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRO Y LOGIN                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario se registra con email y contraseña              │
│     └─> Backend hashea contraseña con BCrypt               │
│         └─> Usuario guardado en MySQL                       │
│                                                              │
│  2. Usuario inicia sesión                                   │
│     └─> Backend valida email y contraseña                   │
│         └─> Genera Access Token (15 min)                    │
│             └─> Genera Refresh Token (7 días)               │
│                 └─> Retorna tokens al frontend              │
│                                                              │
│  3. Frontend almacena tokens en localStorage                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              REQUESTS CON JWT AUTENTICADO                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend agrega header a cada request:                     │
│  Authorization: Bearer {accessToken}                        │
│                                                              │
│  Backend recibe request:                                    │
│  └─> JwtAuthenticationFilter intercepta                     │
│      └─> Extrae token del header                            │
│          └─> JwtProvider valida token                       │
│              └─> Extrae claims (userId, username, email)    │
│                  └─> Autoriza el request                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           RENOVACIÓN DE ACCESS TOKEN EXPIRADO               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Access Token expira (después de 15 minutos)                │
│  └─> Frontend detecta error 401 Unauthorized                │
│      └─> Usa Refresh Token para obtener nuevo Access Token  │
│          └─> Backend valida Refresh Token                   │
│              └─> Genera nuevo Access Token                  │
│                  └─> Frontend actualiza token en localStorage│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎓 Conceptos Clave para Entender

### ¿Qué es JWT?
Un JWT (JSON Web Token) es un estándar para crear tokens de acceso seguros que pueden ser verificados y confiables.

### ¿Por qué JWT?
- ✅ **Stateless**: No requiere sesión en el servidor
- ✅ **Seguro**: Firmado criptográficamente
- ✅ **Autocontenido**: Incluye información del usuario
- ✅ **Compatible**: Funciona en cualquier dominio (CORS)

### Estructura del JWT
```
header.payload.signature

Header:    {"alg": "HS256", "typ": "JWT"}
Payload:   {"userId": 1, "username": "user", "email": "user@example.com", "exp": 1234567890}
Signature: HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)
```

## 📞 Soporte y Contacto

Este es un proyecto educativo. Para dudas sobre JWT, consulta la documentación oficial en [jwt.io](https://jwt.io)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Creado para:** Taller de Entornos de Programación - Semestre 2026-1

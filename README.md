# Aplicacion Web de Registro Diario de Peso, Altura e IMC

Aplicacion web para registrar peso y altura, calcular automaticamente el IMC y consultar el historial de registros.

## Caracteristicas Principales

- Registro diario de peso y altura
- Calculo automatico del IMC
- Guardado de fecha y hora del registro
- Visualizacion del historial completo
- Autenticacion de usuarios
- Documentacion OpenAPI con Swagger UI

## Tecnologias Utilizadas

- Frontend: React, Vite y Tailwind
- Backend: Express
- Base de datos: SQLite
- Proteccion perimetral: OWASP ModSecurity CRS con Nginx
- Contenedores: Docker Compose

## Mockups y Capturas

### Pantalla principal
![Mockup Pantalla 1](docs/assets/pantalla%20principal.png)

### Pantalla de registro
![Mockup Pantalla 2](docs/assets/pantalla%20de%20registro.png)

### Pantalla de inicio de sesion
![Mockup Pantalla 3](docs/assets/pantalla%20inicio%20de%20sesion.png)

## Diagrama de flujo

![Diagrama de Secuencia](docs/mockups/Diagrama%20de%20comportamiento.png)

## Instalacion y Ejecucion

### Opcion recomendada

Levantar backend y WAF con Docker Compose, y el frontend con Vite.

### 1. Levantar backend + WAF

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Esto levanta:

- `backend`: API Express
- `waf`: Nginx + ModSecurity delante de la API

### 2. Levantar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

## URLs de acceso

- Frontend: `http://localhost:5173`
- API a traves del WAF: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/docs`
- OpenAPI JSON: `http://localhost:8080/api/openapi.json`

## Notas importantes

- El backend escucha dentro del contenedor en `3001`, pero desde el navegador debes entrar por `8080`, que es el puerto publicado del WAF.
- Si `8080` esta ocupado por otra app, por otro proyecto Docker o por Burp Suite, primero libera ese puerto.
- Si cambias configuracion del backend o del WAF, vuelve a reconstruir con `docker compose up --build`.

## Seguridad de contraseñas

La API implementa:

- Multiusuario
- Politica configurable de contrasenas con endpoint `GET /api/auth/policy`
- Almacenamiento seguro con `scrypt` y `salt` por usuario
- Pepper mediante `PASSWORD_PEPPER`
- Bloqueo temporal por fallos repetidos

Variables de entorno utiles:

```bash
PASSWORD_PEPPER="<valor largo y aleatorio>"
PASSWORD_MIN_LENGTH=12
PASSWORD_MAX_LENGTH=128
PASSWORD_ALLOW_LOWER=true
PASSWORD_ALLOW_UPPER=true
PASSWORD_ALLOW_DIGITS=true
PASSWORD_ALLOW_SYMBOLS=true
AUTH_MAX_FAILURES=5
AUTH_LOCK_MINUTES=15
SCRYPT_N=32768
SCRYPT_R=8
SCRYPT_P=1
```

## Documentacion Swagger

La documentacion de la API esta disponible en:

- Swagger UI: `http://localhost:8080/api/docs`
- OpenAPI JSON: `http://localhost:8080/api/openapi.json`

Si quieres importarla en SwaggerHub o Swagger Editor, usa la URL del `openapi.json`.

## Ejecucion de Tests

### Backend

```bash
cd backend
npm run test
```

### Frontend

```bash
cd frontend
npm run cy:run
```

Para abrir Cypress en modo visual:

```bash
npm run cy:open
```

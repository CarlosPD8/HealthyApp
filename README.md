
#  Aplicación Web de Registro Diario de Peso, Altura e IMC

Aplicación web que permite registrar el peso y la altura de un usuario, calculando automáticamente el Índice de Masa Corporal (IMC).  
Los datos quedan guardados junto con la fecha y hora, permitiendo consultar la evolución a lo largo del tiempo.  


## 🚀 Características Principales

- Registro diario de **peso y altura**.  
- Cálculo automático del **IMC (Índice de Masa Corporal)**.  
- Guardado de **fecha y hora** del registro.  
- **Restricción diaria**: solo un registro por día.  
- Visualización del **historial completo** de datos.  
- Interfaz sencilla y visual.
- 
## 🧠 Tecnologías Utilizadas

- **Frontend:** React con vite y Tailwind
- **Base de datos:** SQLite
- **Control de versiones:** Git y GitHub

## 🖥️ Mockups y Capturas
### Pantalla principal (Registro diario)
![Mockup Pantalla 1](docs/assets/pantalla%20principal.png)

### Pantalla de registro
![Mockup Pantalla 2](docs/assets/pantalla%20de%20registro.png)
### Pantalla de inicio de sesion
![Mockup Pantalla 3](docs/assets/pantalla%20inicio%20de%20sesion.png)

## 🔄 Diagrama de flujo
![Diagrama de Secuencia](docs/mockups/Diagrama%20de%20comportamiento.png)


## 🧩 Instalación y Ejecución

- Descarga la carpeta comprimida **HealthyApp.zip**  
- Levantar servicio **backend**:
    1. Abrir **cmd**
    2. Dirigirse a `HealthyApp\backend`
    3. Ejecutar el comando:

        ```bash
        npm start
        ```

### 🔐 Seguridad de contraseñas (implementación del ejercicio)

La API implementa:

- **Multiusuario** (ya existía).
- **Política configurable** de contraseña (longitud y tipos de caracteres) + endpoint `GET /api/auth/policy`.
- **Almacenamiento seguro** usando **KDF scrypt** + **salt** por usuario.
- **Pepper (EXTRA)** mediante HMAC con secreto del servidor (`PASSWORD_PEPPER`).
- **Bloqueo por fallos repetidos (EXTRA)** (por defecto: 5 fallos → 15 min).

Variables de entorno útiles (opcional):

```bash
# OBLIGATORIO en producción
PASSWORD_PEPPER="<valor largo y aleatorio>"

# Política
PASSWORD_MIN_LENGTH=12
PASSWORD_MAX_LENGTH=128
PASSWORD_ALLOW_LOWER=true
PASSWORD_ALLOW_UPPER=true
PASSWORD_ALLOW_DIGITS=true
PASSWORD_ALLOW_SYMBOLS=true

# Lockout
AUTH_MAX_FAILURES=5
AUTH_LOCK_MINUTES=15

# KDF scrypt (coste)
SCRYPT_N=32768
SCRYPT_R=8
SCRYPT_P=1
```
- En **Linux:**
  1. rm -rf node_modules package-lock.json
  2. npm cache clean --force
  3. npm install
  4. npm start
- Levantar servicio **frontend**:
    1. Abrir **cmd**
    2. Dirigirse a `HealthyApp\frontend`
    3. Ejecutar los comandos:

        ```bash
        npm install
        npm run dev
        ```

## 🧪 Ejecución de Tests

-  Para ejecutar los test del **backend**:
    1. Abrir **cmd**
    2. Dirigirse a `HealthyApp\backend`
    3. Ejecutar el comando:

```bash
  npm run test
```

- Para ejecutar los test del **frontend**:
    1. Abrir **cmd**
    2. Dirigirse a `HealthyApp\frontend`
    3. Ejecutar el comando:

```bash
  npm run cy:run
```

- Si queremos ver la ejecución de los test de manera mas visual podemos ejecutar el comando:

```bash
  npm run cy:open
```

Con este comando utilizamos **Cypress**, una herramienta de testing end-to-end que nos permite automatizar pruebas que simulan la interacción real de un usuario con la aplicación en el navegador.

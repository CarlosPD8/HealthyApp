# HealthyApp Mobile (Flutter)

Cliente móvil Flutter para HealthyApp que reutiliza el backend Node/Express existente.

## Requisitos

- Flutter estable (probado con `Flutter 3.29.2`)
- Dart incluido con Flutter
- Backend/WAF de este repo funcionando en `http://localhost:8080` (docker-compose), o backend directo en `http://localhost:3001`

## Estructura

```text
lib/
  main.dart
  app/
  core/
    constants/
    theme/
    utils/
    errors/
  data/
    models/
    services/
    repositories/
  features/
    auth/
    entries/
    home/
  shared/
    widgets/
```

## Configuración de URL base API

La app usa `--dart-define=API_BASE_URL`.

Valor por defecto:

- `http://10.0.2.2:8080` (emulador Android con docker-compose + WAF)

Ejemplos:

- Emulador Android (docker-compose + WAF):
  - `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080`
- Emulador Android (backend directo fuera de Docker):
  - `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001`
- Dispositivo físico (misma red local):
  - `flutter run --dart-define=API_BASE_URL=http://192.168.1.50:8080` (si usas WAF)
  - `flutter run --dart-define=API_BASE_URL=http://192.168.1.50:3001` (si publicas backend directo)

## Levantar backend + app móvil

1. Backend:
   - `cd ../backend`
   - Configura `.env` con `JWT_SECRET` y `PASSWORD_PEPPER`.
   - `npm install`
   - `npm run dev` (o script equivalente del proyecto)
2. App Flutter:
   - `cd ../mobile_app`
   - `flutter pub get`
   - `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080`

## Flujos implementados

- Splash con comprobación de token persistido
- Login (`POST /api/auth/login`)
- Registro (`GET /api/auth/policy` + `POST /api/auth/register`)
- Home con resumen y navegación
- Añadir entrada (`POST /api/entries`)
- Historial (`GET /api/entries`, orden descendente)
- Logout (limpieza de token en `flutter_secure_storage`)

## Pruebas manuales recomendadas

1. Registro de usuario nuevo
2. Login con el usuario
3. Crear entrada de peso/altura
4. Ver historial y validar IMC mostrado
5. Cerrar y abrir app para comprobar persistencia de sesión
6. Logout y verificar redirección a login

## Notas de integración

- El backend actual ya acepta payload de login/registro sin requerir cambios para móvil.
- La web envía `captchaToken`, pero el backend actual no lo valida, por lo que móvil no requiere reCAPTCHA.
- La autorización en endpoints protegidos se envía como `Authorization: Bearer <token>`.

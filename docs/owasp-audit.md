# Auditoria de Seguridad OWASP de la API

## Referencias oficiales

- OWASP Web Security Testing Guide v4.2:
  - WSTG-IDNT-04: Testing for Account Enumeration and Guessable User Account
  - WSTG-AUTH-02: Testing for Bypassing Authorization Schema
  - WSTG-CRYP-03: Testing for Sensitive Information Sent via Unencrypted Channels
- OWASP API Security Top 10:
  - API1:2023 Broken Object Level Authorization
  - API2:2023 Broken Authentication
  - API8:2023 Security Misconfiguration

## Alcance evaluado

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/policy`
- `GET /api/entries`
- `POST /api/entries`
- `GET /api/admin/users`
- Despliegue mediante `docker-compose` con backend + WAF

## Metodologia

Se reviso el codigo fuente y se ejecutaron pruebas locales contra la API en memoria con `supertest`, usando variables temporales de auditoria. Resultados observados:

- `register_user`: `201`
- `duplicate_register`: `409`
- `lockout_after_5_failures`: `401`
- `login_while_locked`: `429`
- `register_user_2`: `201`
- `user_access_admin_route`: `403`
- `entries_without_token`: `401`
- `create_entry_ignores_body_user_id`: `201`
- `user2_entries_count`: `1`
- `valid_login_user2`: `200`

## Resultados

### 1. WSTG-IDNT-04 / API2: Robustez de la autenticacion

Resultado: `Parcialmente superado`

Evidencias favorables:

- El login devuelve mensajes genericos para credenciales incorrectas: `Credenciales invalidas`.
- Existe bloqueo temporal por cuenta tras multiples fallos:
  - quinto intento fallido: `401`
  - intento posterior con credenciales correctas: `429`
- Las passwords se almacenan con `scrypt` + `salt` + `pepper`.
- Los JWT tienen expiracion, `issuer` y `audience`.

Hallazgos:

- `POST /api/auth/register` devuelve `409 Email ya registrado`, por lo que permite enumeracion de cuentas.
- El backend acepta `register` y `login` sin validar realmente `captchaToken`; el frontend lo envia, pero el servidor no lo comprueba.
- No hay rate limiting por IP o global, solo bloqueo por cuenta.

Conclusión:

La autenticacion es razonablemente robusta para un proyecto academico, pero no cumple del todo con OWASP por enumeracion de usuarios y ausencia de verificacion efectiva de CAPTCHA/rate limiting.

### 2. WSTG-AUTH-02 / API1: Controles de autorizacion e IDOR

Resultado: `Superado para las rutas expuestas actualmente`

Evidencias favorables:

- Un usuario normal no puede acceder a la ruta administrativa:
  - `GET /api/admin/users` con token de usuario normal devuelve `403`.
- `GET /api/entries` y `POST /api/entries` usan `req.user.id` obtenido del JWT, no un `user_id` enviado por el cliente.
- En la prueba, enviar `user_id: 9999` en el body no permitió escribir sobre otra cuenta; la entrada se creo para el usuario autenticado.

Observaciones:

- No existe actualmente una ruta tipo `GET /api/entries/:id` o `DELETE /api/entries/:id` activa que exponga un caso clasico de IDOR.
- Si en el futuro se reactivan rutas por identificador, habra que validar que el recurso pertenezca al usuario autenticado antes de devolverlo o modificarlo.

Conclusión:

Con las rutas publicadas ahora mismo, no se ha encontrado un IDOR explotable.

### 3. WSTG-CRYP-03 / API8: Seguridad en el transporte (TLS/HTTPS)

Resultado: `No superado en el despliegue actual`

Evidencias:

- El WAF publica `8080:8080` en `docker-compose.yml`.
- La configuracion de Nginx en `waf/default.conf.template` escucha solo en `8080`.
- En ese mismo fichero se indica expresamente: "Aqui solo HTTP local".
- No hay listener TLS/HTTPS ni certificados configurados para el acceso a la API.

Impacto:

- Credenciales, JWT y datos de usuario pueden viajar sin cifrado si el entorno no esta completamente aislado.
- HSTS en el backend no compensa la ausencia de TLS en el proxy frontal.

Conclusión:

Para la entrega academica puedes justificar que el despliegue actual es local y de laboratorio, pero segun OWASP este control no pasa mientras no exista HTTPS real.

## Resumen ejecutivo

- WSTG-IDNT-04: `Parcialmente superado`
- WSTG-AUTH-02: `Superado`
- WSTG-CRYP-03: `No superado`

## Recomendaciones prioritarias

1. Unificar la respuesta de registro para no revelar si un email existe ya.
2. Validar `captchaToken` en backend o añadir rate limiting por IP.
3. Mantener los controles RBAC y el uso de `req.user.id` en todas las rutas futuras por identificador.
4. Añadir HTTPS en el WAF o reverse proxy si se quiere cumplir WSTG-CRYP-03.

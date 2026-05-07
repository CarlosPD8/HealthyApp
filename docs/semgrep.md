# Semgrep

Esta actividad integra Semgrep en el proyecto para realizar analisis estatico de seguridad sobre el codigo.

Semgrep es una herramienta SAST que analiza el codigo entendiendo su estructura sintactica. A diferencia de una busqueda de texto normal, Semgrep interpreta patrones de codigo y permite detectar vulnerabilidades, malas practicas y usos peligrosos de APIs.

## Archivos anadidos

- `.github/workflows/semgrep.yml`: workflow de GitHub Actions para ejecutar Semgrep.
- `.semgrepignore`: rutas excluidas del analisis para evitar ruido en artefactos generados.
- `semgrep-rules/healthyapp-security.yml`: reglas personalizadas del proyecto.
- `docs/semgrep.md`: documentacion de uso.

## Integracion en GitHub Actions

El workflow se ejecuta en:

- Pull requests.
- Ejecucion manual con `workflow_dispatch`.
- Cambios en `main` que afecten al workflow, reglas o ignore.
- Ejecucion programada diaria.

El job usa la imagen oficial:

```yaml
image: semgrep/semgrep
```

Y ejecuta:

```bash
semgrep scan --config auto --config semgrep-rules --error
```

Esto combina:

- `--config auto`: reglas recomendadas por Semgrep segun los lenguajes detectados.
- `--config semgrep-rules`: reglas personalizadas del proyecto.
- `--error`: hace fallar el job si se detectan hallazgos.

## Escaneo manual

En Windows, Semgrep recomienda usar Python con UTF-8 y una instalacion aislada mediante `pipx` o `uv`.

Configurar UTF-8 en PowerShell:

```powershell
[System.Environment]::SetEnvironmentVariable('PYTHONUTF8', '1', 'User')
```

Instalar Semgrep con `pipx`:

```powershell
pipx install semgrep
```

O con `uv`:

```powershell
uv tool install semgrep
```

Comprobar la instalacion:

```bash
semgrep --version
```

Ejecutar un analisis automatico:

```bash
semgrep scan --config auto
```

Ejecutar el mismo analisis que usa CI:

```bash
semgrep scan --config auto --config semgrep-rules --error
```

Ejecutar solo las reglas personalizadas:

```bash
semgrep scan --config semgrep-rules
```

## Reglas personalizadas

El proyecto incluye una regla propia:

```text
healthyapp-no-eval
```

Esta regla detecta el uso de:

```javascript
eval(...)
```

`eval` es peligroso porque puede ejecutar codigo construido dinamicamente. Si ese contenido procede de una entrada de usuario, puede provocar ejecucion de codigo arbitrario.

La regla esta definida en:

```text
semgrep-rules/healthyapp-security.yml
```

## Prueba de vulnerabilidad

Para demostrar la deteccion sin dejar codigo vulnerable en el repositorio final, se puede crear un archivo temporal:

```bash
echo "const input = req.query.code; eval(input);" > semgrep-vulnerable-demo.js
```

Ejecutar:

```bash
semgrep scan --config semgrep-rules semgrep-vulnerable-demo.js
```

Resultado esperado:

```text
healthyapp-no-eval
No uses eval() para ejecutar datos dinamicos. Puede permitir ejecucion de codigo arbitrario.
```

Despues de la captura para documentar la actividad, eliminar el archivo:

```bash
rm semgrep-vulnerable-demo.js
```

En Windows CMD:

```cmd
del semgrep-vulnerable-demo.js
```

## Rutas excluidas

El archivo `.semgrepignore` excluye rutas que no aportan valor al analisis:

- Cobertura de tests.
- Bases de datos locales.
- PDFs e imagenes de documentacion.
- `node_modules`.
- Artefactos generados de Flutter y Gradle.

Esto reduce falsos positivos y acelera el escaneo.

## Managed scans

Semgrep tambien permite escaneos gestionados desde Semgrep AppSec Platform. Para ello se necesita:

1. Crear cuenta en Semgrep.
2. Conectar el repositorio de GitHub.
3. Generar un token `SEMGREP_APP_TOKEN`.
4. Guardarlo en GitHub como secreto del repositorio.
5. Usar `semgrep ci` en el workflow.

En este proyecto se ha integrado la version OSS mediante `semgrep scan`, porque funciona sin token y es suficiente para demostrar SAST en CI/CD.

## Evidencias para entregar

Capturas recomendadas:

- Workflow `.github/workflows/semgrep.yml`.
- Ejecucion de GitHub Actions con el job `semgrep/scan`.
- Regla personalizada `healthyapp-no-eval`.
- Ejecucion manual detectando `eval(...)` en el archivo temporal.
- `.semgrepignore` mostrando las rutas excluidas.

# Gitleaks

Gitleaks es una herramienta SAST de codigo abierto que busca secretos en repositorios Git: contrasenas, claves API, tokens, claves privadas y otros valores sensibles. Usa reglas basadas en expresiones regulares y entropia para detectar cadenas que parecen credenciales.

En este proyecto se usa en dos puntos:

- En GitHub Actions, para bloquear `push` a `main` y pull requests con secretos.
- En local, mediante `pre-commit`, para detectar el problema antes de crear el commit.

## Configuracion del repositorio

Archivos anadidos:

- `.github/workflows/gitleaks.yml`: ejecuta `gitleaks/gitleaks-action@v2`.
- `.gitleaks.toml`: extiende la configuracion por defecto de Gitleaks, anade allowlists para artefactos generados/binarios y define una regla propia para tokens `HEALTHYAPP_`.
- `.pre-commit-config.yaml`: activa Gitleaks como hook local de pre-commit.
- `.githooks/pre-commit`: alternativa directa con Git hooks si no se usa el framework `pre-commit`.

## GitHub Actions

La Action se ejecuta en:

- `pull_request`
- `push` sobre `main`
- `workflow_dispatch`, por si se quiere lanzar manualmente

El workflow descarga todo el historial con `fetch-depth: 0` para que Gitleaks pueda revisar commits anteriores, no solo el ultimo snapshot.

Si detecta un secreto, el job falla y GitHub muestra el error en la pestana **Actions** y en el pull request.

## Uso local con pre-commit

Instalar `pre-commit` una vez:

```bash
pip install pre-commit
```

Activar el hook en este repositorio:

```bash
pre-commit install
```

A partir de ese momento, cada `git commit` ejecuta Gitleaks sobre los cambios preparados en staging. Si encuentra un secreto, el commit se bloquea.

Ejecucion manual del hook:

```bash
pre-commit run gitleaks --all-files
```

## Uso local con Git hooks

Tambien se incluye un hook directo en `.githooks/pre-commit`. Para activarlo:

```bash
git config core.hooksPath .githooks
```

Este hook usa el comando oficial de Gitleaks para revisar los cambios en staging:

```bash
gitleaks git --pre-commit --redact --staged --verbose
```

Si Gitleaks no esta instalado, el hook bloquea el commit y muestra un mensaje de instalacion.

## Escaneo manual con Gitleaks

Con Gitleaks instalado en el sistema:

```bash
gitleaks git --verbose
```

El comando antiguo indicado en muchos materiales tambien puede aparecer como:

```bash
gitleaks detect --verbose
```

En Gitleaks v8.19.0 y posteriores `detect` quedo deprecado, por eso se recomienda `gitleaks git --verbose`.

## Crear una baseline

Si el repositorio ya tuviera hallazgos historicos revisados, se puede crear una baseline:

```bash
gitleaks git --report-path gitleaks-baseline.json
```

Y despues revisar solo nuevos hallazgos:

```bash
gitleaks git --baseline-path gitleaks-baseline.json --report-path gitleaks-findings.json
```

Los reportes locales estan ignorados en `.gitignore` para evitar subirlos por error.

## Falsos positivos

La configuracion `.gitleaks.toml` mantiene las reglas por defecto con:

```toml
[extend]
useDefault = true
```

Tambien ignora rutas que no son codigo fuente, como `coverage`, bases de datos locales, documentos PDF, imagenes y artefactos generados de Flutter/Gradle.

Solo se debe anadir algo a la allowlist si se ha comprobado que no es un secreto real.

## Prueba de funcionamiento

Para probarlo sin dejar secretos en el historial final:

1. Crear una rama temporal:

```bash
git checkout -b test/gitleaks-demo
```

2. Crear un archivo temporal con un secreto de prueba:

```bash
printf "HEALTHYAPP_TOKEN=HEALTHYAPP_1234567890ABCDEF1234567890ABCDEF\n" > gitleaks-demo-secret.txt # gitleaks:allow
git add gitleaks-demo-secret.txt
git commit -m "test: comprobar gitleaks"
```

3. Resultado esperado en local:

```text
Detect hardcoded secrets.................................................Failed
```

4. Si se hace push de esa rama y se abre un pull request, la Action `gitleaks` debe fallar y mostrar el hallazgo.

5. Despues de la prueba, eliminar el archivo y no mezclar esa rama en `main`.

```bash
git rm gitleaks-demo-secret.txt
git commit -m "test: eliminar secreto de prueba"
```

Si el secreto hubiera sido real, no basta con borrar el archivo: primero se debe revocar o cambiar el secreto, y despues limpiar el historial si es necesario con herramientas como `git filter-repo` o BFG Repo-Cleaner.

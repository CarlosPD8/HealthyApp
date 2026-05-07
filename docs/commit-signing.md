# Firma de commits con GPG

Esta actividad configura Git para firmar commits con una clave GPG. La firma permite comprobar dos cosas:

- Identidad: el commit fue creado por la persona que posee la clave privada.
- Integridad: el contenido del commit no ha sido modificado despues de firmarse.

En GitHub, los commits firmados correctamente aparecen con la etiqueta **Verified**.

## 1. Instalar GPG en Windows

En Windows se puede instalar GPG con GPG4Win:

```cmd
winget install --id GnuPG.Gpg4win -e
```

Despues de instalarlo, cerrar y abrir la terminal y comprobar:

```cmd
gpg --version
```

## 2. Comprobar la identidad configurada en Git

El correo de Git debe coincidir con uno asociado a la cuenta de GitHub. En este proyecto se comprobo:

```cmd
git config --global user.name
git config --global user.email
```

Valores configurados:

```text
user.name = Sr-Croqueta
user.email = 118274139+Sr-Croqueta@users.noreply.github.com
```

## 3. Generar la clave GPG

Ejecutar:

```cmd
gpg --full-generate-key
```

Opciones usadas:

- Tipo de clave: RSA and RSA, opcion por defecto.
- Tamano: 4096 bits.
- Caducidad: sin caducidad, o una fecha futura si se prefiere rotacion.
- Nombre: el mismo nombre configurado en Git.
- Email: el mismo email configurado en GitHub y Git.
- Passphrase: contrasena privada para proteger la clave.

## 4. Obtener el ID de la clave

Ejecutar:

```cmd
gpg --list-secret-keys --keyid-format=LONG
```

Ejemplo de salida:

```text
sec   rsa4096/ABCDEF1234567890 2026-05-07 [SC]
      0123456789ABCDEF0123456789ABCDEF1234567890
uid                 [ultimate] Sr-Croqueta <118274139+Sr-Croqueta@users.noreply.github.com>
ssb   rsa4096/1234567890ABCDEF 2026-05-07 [E]
```

El ID de la clave es la parte larga que aparece despues de `rsa4096/`. En el ejemplo:

```text
ABCDEF1234567890
```

## 5. Configurar Git para firmar commits

Sustituir `ABCDEF1234567890` por el ID real:

```cmd
git config --global user.signingkey ABCDEF1234567890
git config --global commit.gpgsign true
```

Comprobar la configuracion:

```cmd
git config --global --get user.signingkey
git config --global --get commit.gpgsign
```

El segundo comando debe devolver:

```text
true
```

## 6. Exportar la clave publica

Sustituir `ABCDEF1234567890` por el ID real:

```cmd
gpg --armor --export ABCDEF1234567890
```

Copiar todo el bloque, desde:

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----
```

hasta:

```text
-----END PGP PUBLIC KEY BLOCK-----
```

## 7. Anadir la clave a GitHub

En GitHub:

1. Ir a **Settings**.
2. Entrar en **SSH and GPG keys**.
3. Pulsar **New GPG key**.
4. Pegar la clave publica exportada.
5. Guardar.

GitHub solo mostrara **Verified** si el email de la clave GPG coincide con un email verificado en la cuenta.

## 8. Crear un commit firmado

Si se activo `commit.gpgsign true`, basta con hacer un commit normal:

```cmd
git commit -m "docs: add commit signing documentation"
```

Si no se activo la firma automatica, se firma manualmente con `-S`:

```cmd
git commit -S -m "docs: add commit signing documentation"
```

## 9. Verificar la firma en local

Ver el ultimo commit con la firma:

```cmd
git log --show-signature -1
```

Tambien se puede comprobar con:

```cmd
git verify-commit HEAD
```

Si la firma es correcta, Git mostrara un mensaje indicando una firma GPG valida.

## 10. Verificar la firma en GitHub

Despues de subir el commit:

```cmd
git push
```

En GitHub, abrir el historial de commits del repositorio. El commit debe aparecer con la etiqueta:

```text
Verified
```

Evidencia para entregar:

- Captura de `git log --show-signature -1`.
- Captura del commit en GitHub con el badge **Verified**.
- Captura de la clave GPG anadida en **Settings > SSH and GPG keys**.

## 11. Vigilant Mode

GitHub permite activar **Vigilant Mode** en la configuracion de seguridad de la cuenta.

Sin Vigilant Mode:

- Los commits firmados aparecen como **Verified**.
- Los commits no firmados aparecen sin marca especial.

Con Vigilant Mode:

- Los commits firmados aparecen como **Verified**.
- Los commits no firmados o mal firmados aparecen como **Unverified**.

Esto ayuda a detectar commits sospechosos en proyectos donde se exige una trazabilidad estricta.

## Resultado esperado

Al finalizar, Git queda configurado para firmar automaticamente los commits y GitHub puede verificar la firma usando la clave publica GPG asociada a la cuenta.

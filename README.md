
#  Aplicación Web de Registro Diario de Peso, Altura e IMC

Aplicación web que permite registrar el peso y la altura de un usuario, calculando automáticamente el Índice de Masa Corporal (IMC).  
Los datos quedan guardados junto con la fecha y hora, permitiendo consultar la evolución a lo largo del tiempo.  
Solo se puede realizar un registro por día.


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

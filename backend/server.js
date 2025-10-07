import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

// Abrir base de datos SQLite
const dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

// Crear tabla si no existe
(async () => {
  const db = await dbPromise;
  await db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      peso REAL,
      altura REAL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// Endpoint para insertar datos
app.post("/api/guardar", async (req, res) => {
  const { peso, altura } = req.body;
  if (!peso || !altura) return res.status(400).json({ error: "Faltan datos" });

  const db = await dbPromise;
  await db.run("INSERT INTO registros (peso, altura) VALUES (?, ?)", [peso, altura]);
  res.json({ message: "Guardado correctamente" });
});

// Endpoint para obtener todos los registros
app.get("/api/registros", async (req, res) => {
  const db = await dbPromise;
  const registros = await db.all("SELECT * FROM registros ORDER BY fecha DESC");
  res.json(registros);
});

app.listen(4000, () => console.log("Servidor escuchando en http://localhost:4000"));

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "data.db");


// Inicializa DB
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(DB_PATH);


// Crea tabla si no existe
const initSQL = `
CREATE TABLE IF NOT EXISTS entries (
id INTEGER PRIMARY KEY AUTOINCREMENT,
weight REAL NOT NULL,
height REAL NOT NULL,
created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;


db.serialize(() => {
db.run(initSQL);
});


const app = express();
app.use(cors());
app.use(express.json());


// Validación simple
function toNumber(value) {
if (value === null || value === undefined || value === "") return NaN;
const n = Number(value);
return Number.isFinite(n) ? n : NaN;
}


// Crear registro: { weight, height }
app.post("/api/entries", (req, res) => {
const weight = toNumber(req.body.weight);
const height = toNumber(req.body.height);


if (!Number.isFinite(weight) || !Number.isFinite(height)) {
return res.status(400).json({ error: "weight y height deben ser números" });
}
if (weight <= 0 || height <= 0) {
return res.status(400).json({ error: "weight y height deben ser > 0" });
}


const sql = "INSERT INTO entries (weight, height) VALUES (?, ?)";
db.run(sql, [weight, height], function (err) {
if (err) return res.status(500).json({ error: err.message });
return res.status(201).json({ id: this.lastID, weight, height, created_at: new Date().toISOString() });
});
});


// Listar registros (más nuevos primero)
app.get("/api/entries", (req, res) => {
const sql = "SELECT id, weight, height, created_at FROM entries ORDER BY datetime(created_at) DESC, id DESC";
db.all(sql, [], (err, rows) => {
if (err) return res.status(500).json({ error: err.message });
res.json(rows);
});
});




// Salud
app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.listen(PORT, () => {
console.log(`API escuchando en http://localhost:${PORT}`);
});
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "data.db");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-super-cambia-esto";

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(DB_PATH);

// --- Esquema ---
const initSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  weight REAL NOT NULL,
  height REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;
db.serialize(() => db.exec(initSQL));

const app = express();
app.use(cors());
app.use(express.json());

// Utils
function toNumber(v){ if(v===null||v===undefined||v==="") return NaN; const n=Number(v); return Number.isFinite(n)?n:NaN; }
function signToken(user){ return jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn:"7d" }); }

function normalizeEmail(email){
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email){
  if (typeof email !== "string") return false;
  const e = normalizeEmail(email);
  if (e.length < 3 || e.length > 254) return false;

  const at = e.indexOf("@");
  if (at <= 0 || at !== e.lastIndexOf("@") || at === e.length - 1) return false;

  const local = e.slice(0, at);
  const domain = e.slice(at + 1);

  if (local.length > 64) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;

  // Domain must have at least one dot and valid labels
  if (!domain.includes(".")) return false;
  const labels = domain.split(".");
  if (labels.some(l => l.length === 0 || l.length > 63)) return false;
  const labelRe = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!labels.every(l => labelRe.test(l))) return false;

  // Basic sanity check for local part characters (allows common RFC characters without going full RFC)
  const localRe = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRe.test(local)) return false;

  return true;
}


// Auth middleware
function auth(req,res,next){
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({ error:"No autorizado" });
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  }catch(e){
    return res.status(401).json({ error:"Token inválido o expirado" });
  }
}

// ---- Rutas de autenticación ----
app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return res.status(400).json({ error: "email y password requeridos" });
  if (!isValidEmail(normalizedEmail)) return res.status(400).json({ error: "Email inválido" });
  const password_hash = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (email, password_hash) VALUES (?, ?)";
  db.run(sql, [normalizedEmail, password_hash], function (err) {
    if (err) {
      if (String(err.message).includes("UNIQUE")) return res.status(409).json({ error: "Email ya registrado" });
      return res.status(500).json({ error: err.message });
    }
    const user = { id: this.lastID, email: normalizedEmail };
    const token = signToken(user);
    res.status(201).json({ token, user });
  });
});

app.post("/api/auth/login", (req,res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return res.status(400).json({ error: "email y password requeridos" });
  if (!isValidEmail(normalizedEmail)) return res.status(400).json({ error: "Email inválido" });
  db.get("SELECT id, email, password_hash FROM users WHERE email = ?", [normalizedEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Credenciales inválidas" });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    const token = signToken({ id: row.id, email: row.email });
    res.json({ token, user: { id: row.id, email: row.email } });
  });
});

// ---- Rutas protegidas de entries ----
app.post("/api/entries", auth, (req, res) => {
  const weight = toNumber(req.body.weight);
  const height = toNumber(req.body.height);
  if (!Number.isFinite(weight) || !Number.isFinite(height)) {
    return res.status(400).json({ error: "weight y height deben ser números" });
  }
  if (weight <= 2 || height <= 0 || height >= 3) {
  return res.status(400).json({
    error: "Valores inválidos: peso > 2 kg, 0 m < altura < 3 m"
  });
}
  const sql = "INSERT INTO entries (user_id, weight, height) VALUES (?, ?, ?)";
  db.run(sql, [req.user.id, weight, height], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, weight, height, created_at: new Date().toISOString() });
  });
});

app.get("/api/entries", auth, (_req, res) => {
  const sql = "SELECT id, weight, height, created_at FROM entries WHERE user_id = ? ORDER BY datetime(created_at) DESC, id DESC";
  db.all(sql, [_req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// app.delete("/api/entries/:id", auth, (req, res) => {
//   const id = Number(req.params.id);
//   if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });
//   db.run("DELETE FROM entries WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     if (this.changes === 0) return res.status(404).json({ error: "Registro no encontrado" });
//     res.json({ deleted: true, id });
//   });
// });

// Salud
app.get("/api/health", (_req, res) => res.json({ ok: true }));


export default app;


if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}



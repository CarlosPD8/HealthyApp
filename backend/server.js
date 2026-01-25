import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "data.db");
const JWT_SECRET = process.env.JWT_SECRET || "Q7!aX0%M$K2n#8ZrP@HfE9WJY1sD5L6C";

// ---- Password hardening ("estado del arte") ----
// Pepper (EXTRA): secreto a nivel de servidor, NO se guarda en BD.
// En producción debe venir por variable de entorno.
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || "8F#kPz3!Lr9w@YvD7A0sM2qXcB$E%N1H";

// Política de contraseña (longitud + tipos de caracteres permitidos)
// Nota: además de validar, el front ofrece un generador para que el usuario elija longitud y conjuntos.
const PASSWORD_POLICY = {
  minLength: Number(process.env.PASSWORD_MIN_LENGTH || 12),
  maxLength: Number(process.env.PASSWORD_MAX_LENGTH || 128),
  // Conjuntos permitidos
  allowLower: process.env.PASSWORD_ALLOW_LOWER !== "false",
  allowUpper: process.env.PASSWORD_ALLOW_UPPER !== "false",
  allowDigits: process.env.PASSWORD_ALLOW_DIGITS !== "false",
  allowSymbols: process.env.PASSWORD_ALLOW_SYMBOLS !== "false",
  // Requisitos mínimos (puedes ajustarlos según apuntes)
  requireLower: process.env.PASSWORD_REQUIRE_LOWER !== "false",
  requireUpper: process.env.PASSWORD_REQUIRE_UPPER !== "false",
  requireDigits: process.env.PASSWORD_REQUIRE_DIGITS !== "false",
  requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== "false",
};

// Bloqueo ante fallos repetidos (EXTRA)
const AUTH_LOCKOUT = {
  maxFailures: Number(process.env.AUTH_MAX_FAILURES || 5),
  lockMinutes: Number(process.env.AUTH_LOCK_MINUTES || 15),
};

// KDF (estado del arte sin dependencias nativas): scrypt (RFC 7914) con parámetros de coste
// N debe ser potencia de 2. Por defecto ~ 2^15, r=8, p=1 (ajustable por env).
const SCRYPT_PARAMS = {
  N: Number(process.env.SCRYPT_N || 32768),
  r: Number(process.env.SCRYPT_R || 8),
  p: Number(process.env.SCRYPT_P || 1),
  keylen: Number(process.env.SCRYPT_KEYLEN || 32),
  saltBytes: Number(process.env.SCRYPT_SALT_BYTES || 16),
  // límite de memoria para evitar DoS (en bytes)
  maxmem: Number(process.env.SCRYPT_MAXMEM || 128 * 1024 * 1024),
};

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(DB_PATH);

// --- Esquema ---
const initSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lock_until TEXT,
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

// --- Migración suave (por si la BD ya existía sin columnas extra) ---
function ensureUserColumns() {
  db.all("PRAGMA table_info(users)", (err, cols) => {
    if (err) return;
    const names = new Set((cols || []).map(c => c.name));
    if (!names.has("failed_attempts")) {
      db.run("ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0");
    }
    if (!names.has("lock_until")) {
      db.run("ALTER TABLE users ADD COLUMN lock_until TEXT");
    }
  });
}
ensureUserColumns();

const app = express();
app.use(cors());
app.use(express.json());

// Utils
function toNumber(v){ if(v===null||v===undefined||v==="") return NaN; const n=Number(v); return Number.isFinite(n)?n:NaN; }
function signToken(user){ return jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn:"7d" }); }

function normalizeEmail(email){
  return String(email || "").trim().toLowerCase();
}

// ---- Password validation & hashing helpers ----
const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/\\|~`\"'<>",
};

function validatePasswordAgainstPolicy(pw) {
  if (typeof pw !== "string") return { ok: false, error: "Contraseña inválida" };
  if (pw.length < PASSWORD_POLICY.minLength) {
    return { ok: false, error: `La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres` };
  }
  if (pw.length > PASSWORD_POLICY.maxLength) {
    return { ok: false, error: `La contraseña no puede superar ${PASSWORD_POLICY.maxLength} caracteres` };
  }

  // Allowed characters
  const allowed =
    (PASSWORD_POLICY.allowLower ? CHARSETS.lower : "") +
    (PASSWORD_POLICY.allowUpper ? CHARSETS.upper : "") +
    (PASSWORD_POLICY.allowDigits ? CHARSETS.digits : "") +
    (PASSWORD_POLICY.allowSymbols ? CHARSETS.symbols : "");
  if (!allowed) return { ok: false, error: "Política inválida: no hay caracteres permitidos" };

  // Check every character is within allowed set
  const allowedSet = new Set(allowed.split(""));
  for (const ch of pw) {
    if (!allowedSet.has(ch)) {
      return { ok: false, error: "La contraseña contiene caracteres no permitidos por la política" };
    }
  }

  // Requirements
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);

  if (PASSWORD_POLICY.requireLower && !hasLower) return { ok: false, error: "Debe incluir al menos una minúscula" };
  if (PASSWORD_POLICY.requireUpper && !hasUpper) return { ok: false, error: "Debe incluir al menos una mayúscula" };
  if (PASSWORD_POLICY.requireDigits && !hasDigit) return { ok: false, error: "Debe incluir al menos un número" };
  if (PASSWORD_POLICY.requireSymbols && !hasSymbol) return { ok: false, error: "Debe incluir al menos un símbolo" };

  return { ok: true };
}

function pepperedPassword(pw) {
  // Pepper: HMAC para mezclar con secreto del servidor sin guardar el pepper ni concatenar a pelo.
  // Esto reduce riesgo de ataques offline si la BD se filtra.
  return crypto.createHmac("sha256", PASSWORD_PEPPER).update(pw, "utf8").digest();
}

async function hashPassword(pw) {
  const salt = crypto.randomBytes(SCRYPT_PARAMS.saltBytes);
  const dk = await new Promise((resolve, reject) => {
    crypto.scrypt(
      pepperedPassword(pw),
      salt,
      SCRYPT_PARAMS.keylen,
      { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p, maxmem: SCRYPT_PARAMS.maxmem },
      (err, derivedKey) => (err ? reject(err) : resolve(derivedKey))
    );
  });
  // Formato: scrypt$N$r$p$saltB64$dkB64
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString("base64")}$${Buffer.from(dk).toString("base64")}`;
}

async function verifyPassword(pw, storedHash) {
  if (typeof storedHash !== "string") return { ok: false };

  // Soporte legacy bcrypt (por si hay usuarios existentes)
  const looksBcrypt = storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");
  if (looksBcrypt) {
    const ok = bcrypt.compareSync(pw, storedHash);
    return { ok, needsRehash: ok }; // si ok, migraremos a scrypt (KDF)
  }

  // Formato actual (scrypt)
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 6) return { ok: false };
    const [, N, r, p, saltB64, dkB64] = parts;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(dkB64, "base64");
    const derived = await new Promise((resolve, reject) => {
      crypto.scrypt(
        pepperedPassword(pw),
        salt,
        expected.length,
        { N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT_PARAMS.maxmem },
        (err, dk) => (err ? reject(err) : resolve(dk))
      );
    });

    const ok = crypto.timingSafeEqual(expected, Buffer.from(derived));
    const needsRehash =
      ok &&
      (Number(N) !== SCRYPT_PARAMS.N || Number(r) !== SCRYPT_PARAMS.r || Number(p) !== SCRYPT_PARAMS.p || expected.length !== SCRYPT_PARAMS.keylen);
    return { ok, needsRehash };
  }

  return { ok: false };
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
// Para el front: exponer política actual (longitud y conjuntos permitidos/requeridos)
app.get("/api/auth/policy", (_req, res) => {
  res.json({
    minLength: PASSWORD_POLICY.minLength,
    maxLength: PASSWORD_POLICY.maxLength,
    allowLower: PASSWORD_POLICY.allowLower,
    allowUpper: PASSWORD_POLICY.allowUpper,
    allowDigits: PASSWORD_POLICY.allowDigits,
    allowSymbols: PASSWORD_POLICY.allowSymbols,
    requireLower: PASSWORD_POLICY.requireLower,
    requireUpper: PASSWORD_POLICY.requireUpper,
    requireDigits: PASSWORD_POLICY.requireDigits,
    requireSymbols: PASSWORD_POLICY.requireSymbols,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return res.status(400).json({ error: "email y password requeridos" });
  if (!isValidEmail(normalizedEmail)) return res.status(400).json({ error: "Email inválido" });

  const v = validatePasswordAgainstPolicy(password);
  if (!v.ok) return res.status(400).json({ error: v.error });

  try {
    const password_hash = await hashPassword(password);
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
  } catch (e) {
    return res.status(500).json({ error: "No se pudo procesar la contraseña" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return res.status(400).json({ error: "email y password requeridos" });
  if (!isValidEmail(normalizedEmail)) return res.status(400).json({ error: "Email inválido" });

  db.get(
    "SELECT id, email, password_hash, failed_attempts, lock_until FROM users WHERE email = ?",
    [normalizedEmail],
    async (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: "Credenciales inválidas" });

      // Lockout (EXTRA)
      if (row.lock_until) {
        const untilMs = Date.parse(row.lock_until);
        if (Number.isFinite(untilMs) && untilMs > Date.now()) {
          return res.status(429).json({
            error: `Cuenta bloqueada temporalmente. Intenta de nuevo tras ${new Date(untilMs).toLocaleString()}`,
          });
        }
      }

      const { ok, needsRehash } = await verifyPassword(password, row.password_hash);
      if (!ok) {
        const nextFailures = Number(row.failed_attempts || 0) + 1;
        let lock_until = null;
        if (nextFailures >= AUTH_LOCKOUT.maxFailures) {
          lock_until = new Date(Date.now() + AUTH_LOCKOUT.lockMinutes * 60_000).toISOString();
        }
        db.run(
          "UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?",
          [nextFailures, lock_until, row.id]
        );
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      // Éxito: reset contador y bloqueo
      db.run("UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?", [row.id]);

      // Rehash (si venía de bcrypt o si cambiaron params)
      if (needsRehash) {
        try {
          const newHash = await hashPassword(password);
          db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, row.id]);
        } catch {
          // no bloqueamos el login si falla la migración
        }
      }

      const token = signToken({ id: row.id, email: row.email });
      res.json({ token, user: { id: row.id, email: row.email } });
    }
  );
});

// ---- Rutas protegidas de entries ----
app.post("/api/entries", auth, (req, res) => {
  const weight = toNumber(req.body.weight);
  const height = toNumber(req.body.height);
  if (!Number.isFinite(weight) || !Number.isFinite(height)) {
    return res.status(400).json({ error: "weight y height deben ser números" });
  }
  if (weight <= 2 || weight > 300 || height <= 0 || height >= 3) {
  return res.status(400).json({
    error: "Valores inválidos: 2 kg < peso ≤ 300 kg, 0 m < altura < 3 m"
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



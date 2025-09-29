// server.cjs — RFID Watchman Backend (Express + SQLite + Serial + SSE)
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const PORT = process.env.PORT || 3000;
const SERIAL_PATH = process.env.SERIAL_PATH || null;

// ===================== App & CORS =====================
const app = express();
app.use(express.json());
app.use(cors({
  // Permite cualquier puerto de localhost (incluye 8080, 5173, etc.)
  origin: /http:\/\/localhost:\d+$/,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// ===================== DB (SQLite) =====================
const db = new Database('attendance.db'); // ./backend/attendance.db
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  card_uid TEXT UNIQUE NOT NULL,
  active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  direction TEXT CHECK(direction IN ('IN','OUT')) NOT NULL,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

const qUserByUID   = db.prepare('SELECT id, name FROM users WHERE card_uid = ? AND active = 1');
const qLastDir     = db.prepare('SELECT direction FROM attendance WHERE user_id = ? ORDER BY ts DESC, id DESC LIMIT 1');
const qInsertAtt   = db.prepare('INSERT INTO attendance (user_id, direction) VALUES (?, ?)');
const qListUsers   = db.prepare('SELECT id, name, card_uid, active FROM users ORDER BY id ASC');
const qCreateUser  = db.prepare('INSERT INTO users (name, card_uid, active) VALUES (?, ?, COALESCE(?,1))');
const qListAtt     = db.prepare(`
  SELECT a.id, a.ts, a.direction, u.id AS user_id, u.name, u.card_uid
  FROM attendance a JOIN users u ON u.id = a.user_id
  ORDER BY a.ts DESC, a.id DESC LIMIT ?
`);
// --- EXTRA QUERIES PARA USUARIOS ---
const qUpdateUser        = db.prepare('UPDATE users SET name = COALESCE(?, name), card_uid = COALESCE(?, card_uid), active = COALESCE(?, active) WHERE id = ?');
const qDeleteUser        = db.prepare('DELETE FROM users WHERE id = ?');
const qCountAttByUser    = db.prepare('SELECT COUNT(*) AS n FROM attendance WHERE user_id = ?');
const qDeleteAttByUser   = db.prepare('DELETE FROM attendance WHERE user_id = ?');


// ===================== SSE (Server-Sent Events) =====================
const clients = new Set();

function sseSend(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
function broadcast(event, data) {
  for (const res of clients) sseSend(res, event, data);
}

// keep-alive cada 15s para que proxies no cierren la conexión
setInterval(() => broadcast('ping', { ts: new Date().toISOString() }), 15000);

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  clients.add(res);
  req.on('close', () => clients.delete(res));
  sseSend(res, 'ping', { connected: true, ts: new Date().toISOString() });
});

// ===================== REST API =====================
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/users', (req, res) => {
  res.json(qListUsers.all());
});

app.post('/api/users', (req, res) => {
  const { name, card_uid, active } = req.body || {};
  if (!name || !card_uid) return res.status(400).json({ error: 'name y card_uid requeridos' });
  try {
    const uid = String(card_uid).toUpperCase();
    const info = qCreateUser.run(name, uid, active ?? 1);
    res.status(201).json({ id: info.lastInsertRowid, name, card_uid: uid, active: active ?? 1 });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'card_uid ya registrado' });
    res.status(500).json({ error: 'DB error', detail: e.message });
  }
});
// Actualizar usuario (editar nombre, UID, o activar/desactivar)
app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });

  // Acepta active como 1/0 o true/false
  const { name, card_uid, active } = req.body || {};
  const activeNorm =
    typeof active === 'boolean' ? (active ? 1 : 0)
    : typeof active === 'number' ? (active ? 1 : 0)
    : null;

  try {
    qUpdateUser.run(
      name ?? null,
      card_uid ? String(card_uid).toUpperCase() : null,
      activeNorm,
      id
    );
    res.json({ id, updated: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE') && card_uid) {
      return res.status(409).json({ error: 'card_uid ya registrado' });
    }
    res.status(500).json({ error: 'DB error', detail: e.message });
  }
});

// Deshabilitar / Habilitar (endpoints cómodos por si el front los usa)
app.post('/api/users/:id/disable', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });
  try {
    qUpdateUser.run(null, null, 0, id);
    res.json({ id, active: 0 });
  } catch (e) {
    res.status(500).json({ error: 'DB error', detail: e.message });
  }
});

app.post('/api/users/:id/enable', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });
  try {
    qUpdateUser.run(null, null, 1, id);
    res.json({ id, active: 1 });
  } catch (e) {
    res.status(500).json({ error: 'DB error', detail: e.message });
  }
});

// Eliminar usuario (con borrado seguro de sus asistencias)
// Nota: sin ON DELETE CASCADE en la tabla, SQLite impide borrar si tiene attendance.
// Aquí hacemos "cascade" manual: primero borramos sus asistencias y luego el usuario.
app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });

  try {
    const count = qCountAttByUser.get(id)?.n ?? 0;

    const tx = db.transaction((uid) => {
      if (count > 0) qDeleteAttByUser.run(uid);
      qDeleteUser.run(uid);
    });

    tx(id);
    res.json({ id, deleted: true, removed_attendance: count });
  } catch (e) {
    res.status(500).json({ error: 'DB error', detail: e.message });
  }
});

app.get('/api/attendance', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  res.json(qListAtt.all(limit));
});

app.get('/api/present', (req, res) => {
  const users = qListUsers.all();
  const present = [];
  for (const u of users) {
    const last = qLastDir.get(u.id);
    if (last?.direction === 'IN') present.push(u);
  }
  res.json(present);
});

// ===================== Serial (Arduino/RC522) =====================
// Ajustes anti-rebote/cooldown:
const ANTIBURST_MS = 600;        // Ignora lecturas duplicadas del MISMO toque < 600 ms
const KNOWN_COOLDOWN_MS = 1500;  // Tras registrar IN/OUT, espera 1.5 s para aceptar otra del MISMO UID

let port = null;
let isPortOpen = false;

const lastSeenMs = new Map();          // registro del último instante visto por UID
const knownCooldownUntil = new Map();  // cooldown por UID (solo conocidas)

function normalizeUID(text) {
  // Convierte "63 5A 73 29" / "635A7329" / "63:5A:73:29" → "635A7329"
  return String(text).toUpperCase().replace(/[^0-9A-F]/g, '');
}

function handleUID(raw) {
  const uid = normalizeUID(raw);
  if (!uid || uid.length < 8) return;

  const now = Date.now();

  // 1) Anti-rebote global (para no duplicar el mismo toque)
  const last = lastSeenMs.get(uid) || 0;
  if (now - last < ANTIBURST_MS) {
    // broadcast('ignored', { uid, reason: 'burst', ts: new Date().toISOString() });
    return;
  }
  lastSeenMs.set(uid, now);

  // 2) ¿Usuario registrado?
  const user = qUserByUID.get(uid);

  if (!user) {
    // Desconocidas: SIEMPRE emite 'unknown' (sin cooldown), para que la UI avise cada vez
    console.log(`[RFID] UNKNOWN ${uid}`);
    broadcast('unknown', { uid, ts: new Date().toISOString() });
    return;
  }

  // 3) Cooldown SOLO para conocidas (evita doble IN/OUT del mismo toque)
  const cdUntil = knownCooldownUntil.get(uid) || 0;
  if (now < cdUntil) {
    // broadcast('ignored', { uid, reason: 'cooldown', until: cdUntil, ts: new Date().toISOString() });
    return;
  }

  // 4) Alternar IN/OUT y registrar
  const lastDir = qLastDir.get(user.id)?.direction;
  const nextDir = lastDir === 'IN' ? 'OUT' : 'IN';
  qInsertAtt.run(user.id, nextDir);
  knownCooldownUntil.set(uid, now + KNOWN_COOLDOWN_MS);

  const payload = { uid, user: { id: user.id, name: user.name }, direction: nextDir, ts: new Date().toISOString() };
  console.log(`[RFID] ${uid} ${user.name} -> ${nextDir}`);
  broadcast('attendance', payload);
}

// Abrir puerto serie (si se definió SERIAL_PATH)
if (SERIAL_PATH) {
  port = new SerialPort({ path: SERIAL_PATH, baudRate: 115200 }, (err) => {
    if (err) console.error('[Serial] Error al abrir:', err.message);
  });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  port.on('open',  () => { isPortOpen = true;  console.log(`[Serial] Abierto en ${SERIAL_PATH} @115200`); });
  port.on('close', () => { isPortOpen = false; console.log('[Serial] Cerrado'); });
  port.on('error', (e) => console.error('[Serial] Error:', e.message));

  parser.on('data', (line) => handleUID(String(line).trim()));
} else {
  console.warn('[Serial] SERIAL_PATH no definido. Arranco sin lector.');
}

// Estado del serial para depurar desde el front o curl
app.get('/api/serial/status', (req, res) => {
  res.json({ path: SERIAL_PATH || null, isOpen: isPortOpen });
});

// ===================== Arranque =====================
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});

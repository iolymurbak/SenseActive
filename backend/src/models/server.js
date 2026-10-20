require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'senseactiv-secret';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'senseactiv.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const dbDir = path.dirname(DB_PATH);
require('fs').mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      cpf_matricula TEXT UNIQUE,
      birth_date TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration_days INTEGER,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS user_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS rfid_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      uid TEXT UNIQUE NOT NULL,
      active INTEGER DEFAULT 1,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      machine_name TEXT NOT NULL,
      default_series INTEGER DEFAULT 3,
      default_repetitions INTEGER DEFAULT 12,
      default_carga REAL DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      series INTEGER DEFAULT 3,
      repetitions INTEGER DEFAULT 12,
      carga REAL DEFAULT 30,
      rest_seconds INTEGER DEFAULT 60,
      order_num INTEGER DEFAULT 1,
      FOREIGN KEY(workout_id) REFERENCES workouts(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      machine_name TEXT NOT NULL,
      series_number INTEGER,
      repetitions INTEGER,
      carga REAL,
      logged_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      checkin_date TEXT,
      checkin_time TEXT,
      entry_method TEXT,
      status TEXT,
      device TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      reason TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weight_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      record_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      goal_type TEXT,
      target_value INTEGER,
      start_date TEXT,
      end_date TEXT,
      created_by INTEGER,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_id INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      status TEXT DEFAULT 'IN_PROGRESS',
      achieved_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(goal_id) REFERENCES goals(id)
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS goal_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      FOREIGN KEY(goal_id) REFERENCES goals(id),
      FOREIGN KEY(reward_id) REFERENCES rewards(id)
    );

    CREATE TABLE IF NOT EXISTS user_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      unlocked_at TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      redeemed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(goal_id) REFERENCES goals(id),
      FOREIGN KEY(reward_id) REFERENCES rewards(id)
    );

    CREATE TABLE IF NOT EXISTS avatars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      style TEXT,
      skin_color TEXT,
      hair_style TEXT,
      accessory TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  await run(`INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'ADMIN'), (2, 'ALUNO')`);
  await run(`INSERT OR IGNORE INTO plans (id, name, description, duration_days, status) VALUES (1, 'Plano Premium', 'Acesso completo', 30, 'ACTIVE')`);
  await run(`INSERT OR IGNORE INTO exercises (id, name, machine_name, default_series, default_repetitions, default_carga) VALUES (1, 'Fly', 'FLY', 3, 12, 30), (2, 'Leg Press 45', 'LEGPRESS', 3, 10, 40), (3, 'Pulley', 'PULLY', 3, 12, 25)`);
  await run(`INSERT OR IGNORE INTO rewards (id, name, description) VALUES (1, 'Whey Protein', 'Recompensa para meta atingida'), (2, 'Desconto', 'Desconto em mensalidade')`);

  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', ['admin@senseactiv.com']);
  if (!existingAdmin) {
    const pass = bcrypt.hashSync('123456', 10);
    const adminResult = await run(`INSERT INTO users (full_name, cpf_matricula, email, phone, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`, ['Administrador SenseActiv', '00000000000', 'admin@senseactiv.com', '11999990000', pass, 1, 'ACTIVE']);
    const adminId = adminResult.lastID;
    await run(`INSERT INTO user_plans (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`, [adminId, 1, '2026-01-01', '2026-12-31', 'ACTIVE']);
    await run(`INSERT INTO rfid_cards (user_id, uid, active) VALUES (?, ?, 1)`, [adminId, 'ADMIN001']);
  }

  const existingStudent = await get('SELECT id FROM users WHERE email = ?', ['lucas@senseactiv.com']);
  if (!existingStudent) {
    const pass = bcrypt.hashSync('123456', 10);
    const studentResult = await run(`INSERT INTO users (full_name, cpf_matricula, email, phone, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`, ['Lucas Almeida', '12345678900', 'lucas@senseactiv.com', '11988880000', pass, 2, 'ACTIVE']);
    const studentId = studentResult.lastID;
    await run(`INSERT INTO user_plans (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`, [studentId, 1, '2026-07-01', '2026-08-01', 'ACTIVE']);
    await run(`INSERT INTO rfid_cards (user_id, uid, active) VALUES (?, ?, 1)`, [studentId, 'A1B2C3']);
    await run(`INSERT INTO weight_records (user_id, weight, record_date) VALUES (?, ?, ?)`, [studentId, 78.5, '2026-07-01']);
    await run(`INSERT INTO checkins (user_id, checkin_date, checkin_time, entry_method, status, device) VALUES (?, ?, ?, ?, ?, ?)`, [studentId, '2026-07-28', '08:10', 'FACIAL_RECOGNITION', 'AUTHORIZED', 'WEB_CAM']);
    const workoutResult = await run(`INSERT INTO workouts (user_id, name, description) VALUES (?, ?, ?)`, [studentId, 'Treino A', 'Treino para força e mobilidade']);
    const workoutId = workoutResult.lastID;
    await run(`INSERT INTO workout_exercises (workout_id, exercise_id, series, repetitions, carga, rest_seconds, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)`, [workoutId, 1, 3, 12, 30, 60, 1]);
    await run(`INSERT INTO workout_exercises (workout_id, exercise_id, series, repetitions, carga, rest_seconds, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)`, [workoutId, 2, 3, 10, 40, 60, 2]);
    const goalResult = await run(`INSERT INTO goals (name, description, goal_type, target_value, start_date, end_date, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['Treinar 10 vezes', 'Completar 10 check-ins', 'CHECKINS', 10, '2026-07-01', '2026-07-31', 1, 'ACTIVE']);
    const goalId = goalResult.lastID;
    await run(`INSERT INTO user_goals (user_id, goal_id, current_value, status) VALUES (?, ?, ?, ?)`, [studentId, goalId, 4, 'IN_PROGRESS']);
    await run(`INSERT INTO goal_rewards (goal_id, reward_id) VALUES (?, ?)`, [goalId, 1]);
    await run(`INSERT INTO user_rewards (user_id, goal_id, reward_id, unlocked_at, status) VALUES (?, ?, ?, ?, ?)`, [studentId, goalId, 1, '2026-07-28', 'AVAILABLE']);
  }
}

initDb().catch(err => console.error(err));

function issueToken(user) {
  return jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 1) return res.status(403).json({ error: 'Acesso restrito' });
  next();
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ token: issueToken(user), user: { id: user.id, full_name: user.full_name, email: user.email, role_id: user.role_id } });
});

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, cpf_matricula, phone } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`INSERT INTO users (full_name, cpf_matricula, email, phone, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(full_name, cpf_matricula, email, phone, hash, 2, 'ACTIVE');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, full_name, cpf_matricula, email, phone, status, role_id FROM users ORDER BY id').all();
  res.json(users);
});

app.post('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  const { full_name, email, password, cpf_matricula, phone } = req.body;
  const hash = bcrypt.hashSync(password || '123456', 10);
  const result = db.prepare(`INSERT INTO users (full_name, cpf_matricula, email, phone, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(full_name, cpf_matricula, email, phone, hash, 2, 'ACTIVE');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/workouts/user/:userId', authMiddleware, (req, res) => {
  const workout = db.prepare(`SELECT w.id, w.name, w.description, we.series, we.repetitions, we.carga, we.rest_seconds, e.name AS exercise_name, e.machine_name FROM workouts w JOIN workout_exercises we ON w.id = we.workout_id JOIN exercises e ON e.id = we.exercise_id WHERE w.user_id = ? ORDER BY we.order_num`).all(req.params.userId);
  res.json(workout);
});

app.post('/api/workouts', authMiddleware, adminMiddleware, (req, res) => {
  const { user_id, name, description, exercises } = req.body;
  const workout = db.prepare(`INSERT INTO workouts (user_id, name, description) VALUES (?, ?, ?)`).run(user_id, name, description);
  const stmt = db.prepare(`INSERT INTO workout_exercises (workout_id, exercise_id, series, repetitions, carga, rest_seconds, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  exercises.forEach((ex, idx) => stmt.run(workout.lastInsertRowid, ex.exercise_id, ex.series, ex.repetitions, ex.carga, ex.rest_seconds, idx + 1));
  io.emit('workout:update', { user_id });
  res.status(201).json({ id: workout.lastInsertRowid });
});

app.get('/api/exercises', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM exercises').all());
});

app.post('/api/workout-logs', authMiddleware, (req, res) => {
  const { user_id, exercise_id, machine_name, series_number, repetitions, carga } = req.body;
  const result = db.prepare(`INSERT INTO workout_logs (user_id, exercise_id, machine_name, series_number, repetitions, carga) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(user_id, exercise_id, machine_name, series_number, repetitions, carga);
  io.emit('workout:log', { user_id, exercise_id });
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/workout-logs/:userId', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM workout_logs WHERE user_id = ? ORDER BY logged_at DESC').all(req.params.userId));
});

app.post('/api/access/identify', authMiddleware, (req, res) => {
  const { user_id, reason } = req.body;
  const user = db.prepare('SELECT id, full_name, status FROM users WHERE id = ?').get(user_id);
  if (!user) return res.status(404).json({ approved: false, reason: 'Usuário não identificado' });
  const plan = db.prepare('SELECT * FROM user_plans WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1').get(user_id, 'ACTIVE');
  if (!plan) return res.status(200).json({ approved: false, reason: 'Plano indisponível', user });
  const today = new Date().toISOString().slice(0, 10);
  if (plan.end_date && today > plan.end_date) return res.status(200).json({ approved: false, reason: 'Plano vencido', user });
  db.prepare(`INSERT INTO checkins (user_id, checkin_date, checkin_time, entry_method, status, device) VALUES (?, ?, ?, ?, ?, ?)`).run(user_id, today, new Date().toTimeString().slice(0, 5), 'FACIAL_RECOGNITION', 'AUTHORIZED', 'WEB_CAM');
  db.prepare(`INSERT INTO access_logs (user_id, reason, status) VALUES (?, ?, ?)`).run(user_id, reason || 'Acesso liberado', 'AUTHORIZED');
  io.emit('access:authorized', { user_id });
  res.json({ approved: true, user, plan });
});

app.post('/api/rfid/identify', (req, res) => {
  const { uid } = req.body;
  const card = db.prepare('SELECT * FROM rfid_cards WHERE uid = ? AND active = 1').get(uid);
  if (!card) return res.status(404).json({ approved: false, reason: 'RFID não encontrado' });
  const user = db.prepare('SELECT id, full_name, email, status FROM users WHERE id = ?').get(card.user_id);
  const plan = db.prepare('SELECT * FROM user_plans WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1').get(card.user_id, 'ACTIVE');
  res.json({ approved: true, user, plan });
});

app.post('/api/machines/identify', (req, res) => {
  const { uid, machine_name } = req.body;
  const card = db.prepare('SELECT * FROM rfid_cards WHERE uid = ? AND active = 1').get(uid);
  if (!card) return res.status(404).json({ approved: false, reason: 'RFID não encontrado' });
  const user = db.prepare('SELECT id, full_name FROM users WHERE id = ?').get(card.user_id);
  const exercise = db.prepare('SELECT * FROM exercises WHERE machine_name = ?').get(machine_name.toUpperCase());
  res.json({ approved: true, user, exercise, machine_name });
});

app.post('/api/machines/load', authMiddleware, (req, res) => {
  const { user_id, machine_name, carga } = req.body;
  io.emit('machine:load', { user_id, machine_name, carga });
  res.json({ ok: true });
});

app.get('/api/weight/:userId', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM weight_records WHERE user_id = ? ORDER BY record_date').all(req.params.userId));
});

app.post('/api/weight', authMiddleware, (req, res) => {
  const { user_id, weight, record_date } = req.body;
  const result = db.prepare(`INSERT INTO weight_records (user_id, weight, record_date) VALUES (?, ?, ? )`).run(user_id, weight, record_date || new Date().toISOString().slice(0, 10));
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/goals', authMiddleware, (req, res) => {
  const goals = db.prepare('SELECT * FROM goals').all();
  const userGoals = db.prepare('SELECT * FROM user_goals').all();
  res.json({ goals, userGoals });
});

app.post('/api/goals', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description, goal_type, target_value, start_date, end_date, created_by } = req.body;
  const result = db.prepare(`INSERT INTO goals (name, description, goal_type, target_value, start_date, end_date, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(name, description, goal_type, target_value, start_date, end_date, created_by || req.user.id, 'ACTIVE');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/goals/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { current_value, status } = req.body;
  db.prepare(`UPDATE user_goals SET current_value = ?, status = ? WHERE goal_id = ?`).run(current_value, status, req.params.id);
  res.json({ ok: true });
});

app.get('/api/rewards', authMiddleware, (req, res) => {
  const rewards = db.prepare('SELECT * FROM rewards').all();
  const userRewards = db.prepare('SELECT * FROM user_rewards').all();
  res.json({ rewards, userRewards });
});

app.post('/api/rewards', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description } = req.body;
  const result = db.prepare(`INSERT INTO rewards (name, description) VALUES (?, ?)`).run(name, description);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/checkins/:userId', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY id DESC').all(req.params.userId));
});

app.get('/api/dashboard/admin', authMiddleware, adminMiddleware, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  const activeUsers = db.prepare("SELECT COUNT(*) AS total FROM users WHERE status = 'ACTIVE'").get().total;
  const todayCheckins = db.prepare("SELECT COUNT(*) AS total FROM checkins WHERE checkin_date = ?").get(new Date().toISOString().slice(0, 10)).total;
  const workoutsDone = db.prepare('SELECT COUNT(*) AS total FROM workout_logs').get().total;
  const goalsCompleted = db.prepare("SELECT COUNT(*) AS total FROM user_goals WHERE status = 'COMPLETED'").get().total;
  const rewardsUnlocked = db.prepare("SELECT COUNT(*) AS total FROM user_rewards WHERE status = 'AVAILABLE'").get().total;
  res.json({ totalUsers, activeUsers, todayCheckins, workoutsDone, goalsCompleted, rewardsUnlocked });
});

app.get('*', (req, res) => {
  if (req.path === '/admin' || req.path === '/admin/') res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'index.html'));
  if (req.path === '/user' || req.path === '/user/') res.sendFile(path.join(__dirname, '..', 'frontend', 'user', 'index.html'));
  if (req.path === '/totem' || req.path === '/totem/') res.sendFile(path.join(__dirname, '..', 'frontend', 'totem', 'index.html'));
  if (req.path === '/machine' || req.path === '/machine/') res.sendFile(path.join(__dirname, '..', 'frontend', 'machine', 'index.html'));
  res.status(404).send('Página não encontrada');
});

io.on('connection', (socket) => {
  console.log('cliente conectado', socket.id);
  socket.on('disconnect', () => console.log('cliente desconectado', socket.id));
});

server.listen(PORT, () => {
  console.log(`SenseActiv rodando em http://localhost:${PORT}`);
  console.log(`Painel admin: http://localhost:${PORT}/admin`);
  console.log(`Painel usuário: http://localhost:${PORT}/user`);
  console.log(`Totem: http://localhost:${PORT}/totem`);
  console.log(`Máquina: http://localhost:${PORT}/machine`);
});

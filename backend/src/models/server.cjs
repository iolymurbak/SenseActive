require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'senseactiv-secret';
const DATA_FILE = process.env.DB_PATH || path.join(__dirname, 'data', 'senseactiv.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

let state = {
  roles: [{ id: 1, name: 'ADMIN' }, { id: 2, name: 'ALUNO' }],
  users: [],
  plans: [{ id: 1, name: 'Plano Premium', description: 'Acesso completo', duration_days: 30, status: 'ACTIVE' }],
  user_plans: [],
  rfid_cards: [],
  exercises: [
    { id: 1, name: 'Fly', machine_name: 'FLY', default_series: 3, default_repetitions: 12, default_carga: 30 },
    { id: 2, name: 'Leg Press 45', machine_name: 'LEGPRESS', default_series: 3, default_repetitions: 10, default_carga: 40 },
    { id: 3, name: 'Pulley', machine_name: 'PULLY', default_series: 3, default_repetitions: 12, default_carga: 25 }
  ],
  workouts: [],
  workout_exercises: [],
  workout_logs: [],
  checkins: [],
  access_logs: [],
  weight_records: [],
  goals: [],
  user_goals: [],
  rewards: [{ id: 1, name: 'Whey Protein', description: 'Recompensa para meta atingida' }, { id: 2, name: 'Desconto', description: 'Desconto em mensalidade' }],
  goal_rewards: [],
  user_rewards: [],
  avatars: []
};

function loadState() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      state = { ...state, ...saved };
    } catch (err) {
      console.error('Erro ao carregar estado:', err.message);
    }
  }
}

function saveState() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

function getNextId(collection) {
  const list = state[collection] || [];
  return list.length ? Math.max(...list.map(item => item.id || 0)) + 1 : 1;
}

function findOne(collection, predicate = () => true) {
  return (state[collection] || []).find(predicate) || null;
}

function findAll(collection, predicate = () => true) {
  return (state[collection] || []).filter(predicate);
}

function insert(collection, item) {
  const list = state[collection] || [];
  const newItem = { id: getNextId(collection), ...item };
  list.push(newItem);
  state[collection] = list;
  saveState();
  return newItem;
}

function seed() {
  const existingAdmin = findOne('users', u => u.email === 'admin@senseactiv.com');
  if (!existingAdmin) {
    const adminUser = insert('users', {
      full_name: 'Administrador SenseActiv',
      cpf_matricula: '00000000000',
      email: 'admin@senseactiv.com',
      phone: '11999990000',
      password_hash: bcrypt.hashSync('123456', 10),
      role_id: 1,
      status: 'ACTIVE'
    });
    insert('user_plans', { user_id: adminUser.id, plan_id: 1, start_date: '2026-01-01', end_date: '2026-12-31', status: 'ACTIVE' });
    insert('rfid_cards', { user_id: adminUser.id, uid: 'ADMIN001', active: 1 });
  }

  const existingStudent = findOne('users', u => u.email === 'lucas@senseactiv.com');
  if (!existingStudent) {
    const studentUser = insert('users', {
      full_name: 'Lucas Almeida',
      cpf_matricula: '12345678900',
      email: 'lucas@senseactiv.com',
      phone: '11988880000',
      password_hash: bcrypt.hashSync('123456', 10),
      role_id: 2,
      status: 'ACTIVE'
    });
    insert('user_plans', { user_id: studentUser.id, plan_id: 1, start_date: '2026-07-01', end_date: '2026-08-01', status: 'ACTIVE' });
    insert('rfid_cards', { user_id: studentUser.id, uid: 'A1B2C3', active: 1 });
    insert('weight_records', { user_id: studentUser.id, weight: 78.5, record_date: '2026-07-01' });
    insert('checkins', { user_id: studentUser.id, checkin_date: '2026-07-28', checkin_time: '08:10', entry_method: 'FACIAL_RECOGNITION', status: 'AUTHORIZED', device: 'WEB_CAM' });
    const workout = insert('workouts', { user_id: studentUser.id, name: 'Treino A', description: 'Treino para força e mobilidade' });
    insert('workout_exercises', { workout_id: workout.id, exercise_id: 1, series: 3, repetitions: 12, carga: 30, rest_seconds: 60, order_num: 1 });
    insert('workout_exercises', { workout_id: workout.id, exercise_id: 2, series: 3, repetitions: 10, carga: 40, rest_seconds: 60, order_num: 2 });
    const goal = insert('goals', { name: 'Treinar 10 vezes', description: 'Completar 10 check-ins', goal_type: 'CHECKINS', target_value: 10, start_date: '2026-07-01', end_date: '2026-07-31', created_by: 1, status: 'ACTIVE' });
    insert('user_goals', { user_id: studentUser.id, goal_id: goal.id, current_value: 4, status: 'IN_PROGRESS' });
    insert('goal_rewards', { goal_id: goal.id, reward_id: 1 });
    insert('user_rewards', { user_id: studentUser.id, goal_id: goal.id, reward_id: 1, unlocked_at: '2026-07-28', status: 'AVAILABLE' });
  }
}

loadState();
seed();
saveState();

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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = findOne('users', u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ token: issueToken(user), user: { id: user.id, full_name: user.full_name, email: user.email, role_id: user.role_id } });
});

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, cpf_matricula, phone } = req.body;
  if (findOne('users', u => u.email === email)) return res.status(409).json({ error: 'Email já cadastrado' });
  const hash = bcrypt.hashSync(password, 10);
  const created = insert('users', { full_name, cpf_matricula, email, phone, password_hash: hash, role_id: 2, status: 'ACTIVE' });
  res.status(201).json({ id: created.id });
});

app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json(findAll('users').map(u => ({ id: u.id, full_name: u.full_name, cpf_matricula: u.cpf_matricula, email: u.email, phone: u.phone, status: u.status, role_id: u.role_id })));
});

app.post('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  const { full_name, email, password, cpf_matricula, phone } = req.body;
  const hash = bcrypt.hashSync(password || '123456', 10);
  const created = insert('users', { full_name, cpf_matricula, email, phone, password_hash: hash, role_id: 2, status: 'ACTIVE' });
  res.status(201).json({ id: created.id });
});

app.get('/api/workouts/user/:userId', authMiddleware, (req, res) => {
  const workouts = findAll('workouts', w => w.user_id === Number(req.params.userId));
  const result = [];
  workouts.forEach(workout => {
    const exercises = findAll('workout_exercises', ex => ex.workout_id === workout.id).map(ex => {
      const exercise = findOne('exercises', e => e.id === ex.exercise_id);
      return { ...ex, exercise_name: exercise?.name, machine_name: exercise?.machine_name };
    });
    result.push({ workout, exercises });
  });
  res.json(result);
});

app.post('/api/workouts', authMiddleware, adminMiddleware, (req, res) => {
  const { user_id, name, description, exercises } = req.body;
  const workout = insert('workouts', { user_id, name, description });
  exercises.forEach((ex, idx) => insert('workout_exercises', { workout_id: workout.id, exercise_id: ex.exercise_id, series: ex.series, repetitions: ex.repetitions, carga: ex.carga, rest_seconds: ex.rest_seconds, order_num: idx + 1 }));
  io.emit('workout:update', { user_id });
  res.status(201).json({ id: workout.id });
});

app.get('/api/exercises', authMiddleware, (req, res) => {
  res.json(state.exercises);
});

app.post('/api/workout-logs', authMiddleware, (req, res) => {
  const { user_id, exercise_id, machine_name, series_number, repetitions, carga } = req.body;
  const created = insert('workout_logs', { user_id, exercise_id, machine_name, series_number, repetitions, carga });
  io.emit('workout:log', { user_id, exercise_id });
  res.status(201).json({ id: created.id });
});

app.get('/api/workout-logs/:userId', authMiddleware, (req, res) => {
  res.json(findAll('workout_logs', log => log.user_id === Number(req.params.userId)).sort((a, b) => b.id - a.id));
});

app.post('/api/access/identify', authMiddleware, (req, res) => {
  const { user_id, reason } = req.body;
  const user = findOne('users', u => u.id === Number(user_id));
  if (!user) return res.status(404).json({ approved: false, reason: 'Usuário não identificado' });
  const plan = findAll('user_plans', p => p.user_id === Number(user_id) && p.status === 'ACTIVE').sort((a, b) => b.id - a.id)[0];
  if (!plan) return res.status(200).json({ approved: false, reason: 'Plano indisponível', user });
  const today = new Date().toISOString().slice(0, 10);
  if (plan.end_date && today > plan.end_date) return res.status(200).json({ approved: false, reason: 'Plano vencido', user });
  insert('checkins', { user_id: Number(user_id), checkin_date: today, checkin_time: new Date().toTimeString().slice(0, 5), entry_method: 'FACIAL_RECOGNITION', status: 'AUTHORIZED', device: 'WEB_CAM' });
  insert('access_logs', { user_id: Number(user_id), reason: reason || 'Acesso liberado', status: 'AUTHORIZED' });
  io.emit('access:authorized', { user_id: Number(user_id) });
  res.json({ approved: true, user, plan });
});

app.post('/api/rfid/identify', (req, res) => {
  const { uid } = req.body;
  const card = findOne('rfid_cards', c => c.uid === uid && c.active === 1);
  if (!card) return res.status(404).json({ approved: false, reason: 'RFID não encontrado' });
  const user = findOne('users', u => u.id === card.user_id);
  const plan = findAll('user_plans', p => p.user_id === card.user_id && p.status === 'ACTIVE').sort((a, b) => b.id - a.id)[0];
  res.json({ approved: true, user, plan });
});

app.post('/api/machines/identify', (req, res) => {
  const { uid, machine_name } = req.body;
  const card = findOne('rfid_cards', c => c.uid === uid && c.active === 1);
  if (!card) return res.status(404).json({ approved: false, reason: 'RFID não encontrado' });
  const user = findOne('users', u => u.id === card.user_id);
  const exercise = findOne('exercises', e => e.machine_name === machine_name.toUpperCase());
  res.json({ approved: true, user, exercise, machine_name });
});

app.post('/api/machines/load', authMiddleware, (req, res) => {
  const { user_id, machine_name, carga } = req.body;
  io.emit('machine:load', { user_id, machine_name, carga });
  res.json({ ok: true });
});

app.get('/api/weight/:userId', authMiddleware, (req, res) => {
  res.json(findAll('weight_records', w => w.user_id === Number(req.params.userId)).sort((a, b) => a.id - b.id));
});

app.post('/api/weight', authMiddleware, (req, res) => {
  const { user_id, weight, record_date } = req.body;
  const created = insert('weight_records', { user_id: Number(user_id), weight: Number(weight), record_date: record_date || new Date().toISOString().slice(0, 10) });
  res.status(201).json({ id: created.id });
});

app.get('/api/goals', authMiddleware, (req, res) => {
  res.json({ goals: state.goals, userGoals: state.user_goals });
});

app.post('/api/goals', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description, goal_type, target_value, start_date, end_date, created_by } = req.body;
  const created = insert('goals', { name, description, goal_type, target_value, start_date, end_date, created_by: created_by || req.user.id, status: 'ACTIVE' });
  res.status(201).json({ id: created.id });
});

app.put('/api/goals/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { current_value, status } = req.body;
  const updated = (state.user_goals || []).find(item => item.goal_id === Number(req.params.id));
  if (!updated) return res.status(404).json({ ok: false });
  updated.current_value = current_value;
  updated.status = status;
  saveState();
  res.json(updated);
});

app.get('/api/rewards', authMiddleware, (req, res) => {
  res.json({ rewards: state.rewards, userRewards: state.user_rewards });
});

app.post('/api/rewards', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description } = req.body;
  const created = insert('rewards', { name, description });
  res.status(201).json({ id: created.id });
});

app.get('/api/checkins/:userId', authMiddleware, (req, res) => {
  res.json(findAll('checkins', c => c.user_id === Number(req.params.userId)).sort((a, b) => b.id - a.id));
});

app.get('/api/dashboard/admin', authMiddleware, adminMiddleware, (req, res) => {
  const totalUsers = state.users.length;
  const activeUsers = state.users.filter(u => u.status === 'ACTIVE').length;
  const todayCheckins = state.checkins.filter(c => c.checkin_date === new Date().toISOString().slice(0, 10)).length;
  const workoutsDone = state.workout_logs.length;
  const goalsCompleted = state.user_goals.filter(g => g.status === 'COMPLETED').length;
  const rewardsUnlocked = state.user_rewards.filter(r => r.status === 'AVAILABLE').length;
  res.json({ totalUsers, activeUsers, todayCheckins, workoutsDone, goalsCompleted, rewardsUnlocked });
});

app.get('*', (req, res) => {
  if (req.path === '/admin' || req.path === '/admin/') return res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'index.html'));
  if (req.path === '/user' || req.path === '/user/') return res.sendFile(path.join(__dirname, '..', 'frontend', 'user', 'index.html'));
  if (req.path === '/totem' || req.path === '/totem/') return res.sendFile(path.join(__dirname, '..', 'frontend', 'totem', 'index.html'));
  if (req.path === '/machine' || req.path === '/machine/') return res.sendFile(path.join(__dirname, '..', 'frontend', 'machine', 'index.html'));
  res.status(404).send('Página não encontrada');
});

io.on('connection', socket => {
  console.log('cliente conectado', socket.id);
});

server.listen(PORT, () => {
  console.log(`SenseActiv rodando em http://localhost:${PORT}`);
  console.log(`Painel admin: http://localhost:${PORT}/admin`);
  console.log(`Painel usuário: http://localhost:${PORT}/user`);
  console.log(`Totem: http://localhost:${PORT}/totem`);
  console.log(`Máquina: http://localhost:${PORT}/machine`);
});

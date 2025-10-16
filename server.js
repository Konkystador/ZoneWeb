const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      upgradeInsecureRequests: null // Отключаем принудительное перенаправление на HTTPS
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: 'window-repair-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Database initialization
const db = new sqlite3.Database('window_repair.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    full_name TEXT,
    phone TEXT,
    telegram TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
  )`);

  // Roles table
  db.run(`CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    permissions TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_telegram TEXT,
    address TEXT NOT NULL,
    city TEXT,
    street TEXT,
    house TEXT,
    entrance TEXT,
    floor TEXT,
    apartment TEXT,
    intercom TEXT,
    latitude REAL,
    longitude REAL,
    problem_description TEXT,
    visit_date DATETIME,
    status TEXT DEFAULT 'pending',
    assigned_to INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);

  // Estimates table
  db.run(`CREATE TABLE IF NOT EXISTS estimates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    estimate_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  // Estimate items table
  db.run(`CREATE TABLE IF NOT EXISTS estimate_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estimate_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    unit_type TEXT,
    profile_type TEXT,
    system_type TEXT,
    sash_type TEXT,
    notes TEXT,
    photos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id)
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Services table
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    base_price REAL NOT NULL,
    calculation_type TEXT DEFAULT 'fixed',
    formula TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Service profiles table
  db.run(`CREATE TABLE IF NOT EXISTS service_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_type TEXT NOT NULL,
    system_type TEXT NOT NULL,
    sash_type TEXT,
    complexity_coefficient REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Order statuses table
  db.run(`CREATE TABLE IF NOT EXISTS order_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6c757d',
    is_active BOOLEAN DEFAULT 1
  )`);

  // Order cards table (расширенная информация о заказах)
  db.run(`CREATE TABLE IF NOT EXISTS order_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    card_type TEXT DEFAULT 'measurement',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  // Sash information table
  db.run(`CREATE TABLE IF NOT EXISTS sash_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_card_id INTEGER NOT NULL,
    sash_number INTEGER NOT NULL,
    profile_type TEXT,
    system_type TEXT,
    sash_type TEXT,
    dimensions TEXT,
    notes TEXT,
    photos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_card_id) REFERENCES order_cards(id)
  )`);

  // Insert default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
          VALUES ('admin', ?, 'admin', 'Администратор')`, [adminPassword]);

  // Insert default roles
  db.run(`INSERT OR IGNORE INTO roles (name, permissions) VALUES 
          ('admin', '["all"]'),
          ('senior_manager', '["view_all_orders", "assign_orders", "create_estimates", "view_reports"]'),
          ('manager', '["view_assigned_orders", "create_estimates"]'),
          ('worker', '["view_own_orders", "create_estimates"]')`);

  // Insert default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
          ('company_name', 'ООО "Оконные Мастера"'),
          ('currency', 'RUB'),
          ('tax_system', 'AUSN'),
          ('rounding', 'up')`);

  // Insert default services
  db.run(`INSERT OR IGNORE INTO services (name, category, unit_type, base_price, calculation_type) VALUES 
          ('Москитная сетка стандартная', 'mosquito', 'шт', 1500, 'fixed'),
          ('Москитная сетка антикошка', 'mosquito', 'шт', 2500, 'fixed'),
          ('Рулонная штора стандартная', 'blinds', 'шт', 3000, 'fixed'),
          ('Рулонная штора блэкаут', 'blinds', 'шт', 4000, 'fixed'),
          ('Замена уплотнителя', 'repair', 'м.п.', 150, 'linear'),
          ('Регулировка фурнитуры', 'repair', 'шт', 800, 'fixed'),
          ('Замена стеклопакета', 'repair', 'шт', 5000, 'fixed'),
          ('Ремонт рамы', 'repair', 'м²', 2000, 'area')`);

  // Insert default service profiles
  db.run(`INSERT OR IGNORE INTO service_profiles (profile_type, system_type, sash_type, complexity_coefficient) VALUES 
          ('plastic', 'Rehau', 'поворотная', 1.0),
          ('plastic', 'Rehau', 'поворотно-откидная', 1.2),
          ('plastic', 'Rehau', 'откидная', 0.8),
          ('plastic', 'Veka', 'поворотная', 1.0),
          ('plastic', 'Veka', 'поворотно-откидная', 1.2),
          ('wood', 'Стандарт', 'поворотная', 1.5),
          ('wood', 'Стандарт', 'поворотно-откидная', 1.8),
          ('aluminum', 'Стандарт', 'поворотная', 1.3),
          ('aluminum', 'Стандарт', 'поворотно-откидная', 1.5)`);

  // Insert default order statuses
  db.run(`INSERT OR IGNORE INTO order_statuses (name, color) VALUES 
          ('Ожидает', '#ffc107'),
          ('В работе', '#17a2b8'),
          ('Завершен', '#28a745'),
          ('Отменен', '#dc3545'),
          ('Отказ', '#6c757d')`);
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Требуется авторизация' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.session.userRole && roles.includes(req.session.userRole)) {
      next();
    } else {
      res.status(403).json({ error: 'Недостаточно прав доступа' });
    }
  };
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.username = user.username;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.userRole
  });
});

// Orders routes
app.get('/api/orders', requireAuth, (req, res) => {
  let query = 'SELECT o.*, u.full_name as assigned_name FROM orders o LEFT JOIN users u ON o.assigned_to = u.id';
  let params = [];
  
  // Filter by role
  if (req.session.userRole === 'worker') {
    query += ' WHERE o.assigned_to = ?';
    params.push(req.session.userId);
  } else if (req.session.userRole === 'manager') {
    query += ' WHERE o.assigned_to = ? OR o.created_by = ?';
    params.push(req.session.userId, req.session.userId);
  }
  
  query += ' ORDER BY o.created_at DESC';
  
  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения заказов' });
    }
    res.json(orders);
  });
});

app.post('/api/orders', requireAuth, (req, res) => {
  const {
    client_name, client_phone, client_telegram, address, city, street, house,
    entrance, floor, apartment, intercom, latitude, longitude, problem_description,
    visit_date, assigned_to
  } = req.body;
  
  const orderNumber = 'ORD-' + Date.now();
  
  db.run(`INSERT INTO orders (
    order_number, client_name, client_phone, client_telegram, address, city, street,
    house, entrance, floor, apartment, intercom, latitude, longitude, problem_description,
    visit_date, assigned_to, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [orderNumber, client_name, client_phone, client_telegram, address, city, street,
   house, entrance, floor, apartment, intercom, latitude, longitude, problem_description,
   visit_date, assigned_to, req.session.userId],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка создания заказа' });
    }
    res.json({ id: this.lastID, order_number: orderNumber });
  });
});

// Estimates routes
app.get('/api/estimates/:orderId', requireAuth, (req, res) => {
  const orderId = req.params.orderId;
  
  db.get('SELECT * FROM estimates WHERE order_id = ?', [orderId], (err, estimate) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения сметы' });
    }
    
    if (!estimate) {
      return res.json(null);
    }
    
    // Get estimate items
    db.all('SELECT * FROM estimate_items WHERE estimate_id = ?', [estimate.id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка получения позиций сметы' });
      }
      
      estimate.items = items;
      res.json(estimate);
    });
  });
});

app.post('/api/estimates', requireAuth, (req, res) => {
  const { order_id, items, discount_percent, discount_amount } = req.body;
  
  // Calculate totals
  let totalAmount = 0;
  items.forEach(item => {
    totalAmount += item.quantity * item.unit_price;
  });
  
  const discount = discount_percent ? (totalAmount * discount_percent / 100) : (discount_amount || 0);
  const finalAmount = Math.ceil(totalAmount - discount); // Round up
  
  const estimateNumber = 'EST-' + Date.now();
  
  db.run(`INSERT INTO estimates (
    order_id, estimate_number, total_amount, discount_percent, discount_amount, final_amount
  ) VALUES (?, ?, ?, ?, ?, ?)`,
  [order_id, estimateNumber, totalAmount, discount_percent || 0, discount || 0, finalAmount],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка создания сметы' });
    }
    
    const estimateId = this.lastID;
    
    // Insert estimate items
    const stmt = db.prepare(`INSERT INTO estimate_items (
      estimate_id, category, item_name, quantity, unit_price, total_price, unit_type,
      profile_type, system_type, sash_type, notes, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    items.forEach(item => {
      stmt.run([
        estimateId, item.category, item.item_name, item.quantity, item.unit_price,
        item.quantity * item.unit_price, item.unit_type, item.profile_type,
        item.system_type, item.sash_type, item.notes, item.photos
      ]);
    });
    
    stmt.finalize();
    res.json({ id: estimateId, estimate_number: estimateNumber });
  });
});

// Settings routes
app.get('/api/settings', requireAuth, (req, res) => {
  db.all('SELECT * FROM settings', (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения настроек' });
    }
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json(settingsObj);
  });
});

app.put('/api/settings', requireAuth, requireRole(['admin']), (req, res) => {
  const settings = req.body;
  
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  
  Object.keys(settings).forEach(key => {
    stmt.run([key, settings[key]]);
  });
  
  stmt.finalize();
  res.json({ success: true });
});

// File upload route
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path
  });
});

// Users routes
app.get('/api/users', requireAuth, requireRole(['admin']), (req, res) => {
  db.all('SELECT id, username, role, full_name, phone, telegram, is_active, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
    res.json(users);
  });
});

app.post('/api/users', requireAuth, requireRole(['admin']), (req, res) => {
  const { username, password, full_name, role, phone, telegram } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run(`INSERT INTO users (username, password, full_name, role, phone, telegram) 
          VALUES (?, ?, ?, ?, ?, ?)`,
  [username, hashedPassword, full_name, role, phone, telegram],
  function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
      }
      return res.status(500).json({ error: 'Ошибка создания пользователя' });
    }
    res.json({ id: this.lastID, username });
  });
});

app.put('/api/users/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const userId = req.params.id;
  const { username, full_name, role, phone, telegram, is_active } = req.body;
  
  let query = 'UPDATE users SET username = ?, full_name = ?, role = ?, phone = ?, telegram = ?, is_active = ?';
  let params = [username, full_name, role, phone, telegram, is_active];
  
  // If password is provided, update it
  if (req.body.password) {
    query += ', password = ?';
    params.push(bcrypt.hashSync(req.body.password, 10));
  }
  
  query += ' WHERE id = ?';
  params.push(userId);
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обновления пользователя' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/users/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const userId = req.params.id;
  
  // Don't allow deleting admin users
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка проверки пользователя' });
    }
    
    if (user && user.role === 'admin') {
      return res.status(400).json({ error: 'Нельзя удалить администратора' });
    }
    
    db.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка удаления пользователя' });
      }
      res.json({ success: true });
    });
  });
});

// Get users for assignment dropdown
app.get('/api/users/assignable', requireAuth, (req, res) => {
  const query = `SELECT id, username, full_name, role FROM users 
                 WHERE is_active = 1 AND role IN ('worker', 'manager', 'senior_manager') 
                 ORDER BY role, full_name`;
  
  db.all(query, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
    res.json(users);
  });
});

// Services routes
app.get('/api/services', requireAuth, (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM services WHERE is_active = 1';
  let params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY category, name';
  
  db.all(query, params, (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения услуг' });
    }
    res.json(services);
  });
});

app.post('/api/services', requireAuth, requireRole(['admin']), (req, res) => {
  const { name, category, unit_type, base_price, calculation_type, formula } = req.body;
  
  db.run(`INSERT INTO services (name, category, unit_type, base_price, calculation_type, formula) 
          VALUES (?, ?, ?, ?, ?, ?)`,
  [name, category, unit_type, base_price, calculation_type, formula],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка создания услуги' });
    }
    res.json({ id: this.lastID, name });
  });
});

app.put('/api/services/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const serviceId = req.params.id;
  const { name, category, unit_type, base_price, calculation_type, formula, is_active } = req.body;
  
  db.run(`UPDATE services SET name = ?, category = ?, unit_type = ?, base_price = ?, 
          calculation_type = ?, formula = ?, is_active = ? WHERE id = ?`,
  [name, category, unit_type, base_price, calculation_type, formula, is_active, serviceId],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обновления услуги' });
    }
    res.json({ success: true });
  });
});

// Service profiles routes
app.get('/api/service-profiles', requireAuth, (req, res) => {
  const { profile_type } = req.query;
  let query = 'SELECT * FROM service_profiles WHERE is_active = 1';
  let params = [];
  
  if (profile_type) {
    query += ' AND profile_type = ?';
    params.push(profile_type);
  }
  
  query += ' ORDER BY profile_type, system_type';
  
  db.all(query, params, (err, profiles) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения профилей' });
    }
    res.json(profiles);
  });
});

app.post('/api/service-profiles', requireAuth, requireRole(['admin']), (req, res) => {
  const { profile_type, system_type, sash_type, complexity_coefficient } = req.body;
  
  db.run(`INSERT INTO service_profiles (profile_type, system_type, sash_type, complexity_coefficient) 
          VALUES (?, ?, ?, ?)`,
  [profile_type, system_type, sash_type, complexity_coefficient],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка создания профиля' });
    }
    res.json({ id: this.lastID });
  });
});

// Order cards routes
app.get('/api/order-cards', requireAuth, (req, res) => {
  const { status } = req.query;
  let query = `SELECT oc.*, o.*, u.full_name as assigned_name 
               FROM order_cards oc 
               JOIN orders o ON oc.order_id = o.id 
               LEFT JOIN users u ON o.assigned_to = u.id`;
  let params = [];
  
  if (status) {
    query += ' WHERE oc.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY oc.created_at DESC';
  
  db.all(query, params, (err, cards) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения карточек заказов' });
    }
    res.json(cards);
  });
});

app.post('/api/order-cards', requireAuth, (req, res) => {
  const { order_id, card_type, status } = req.body;
  
  db.run(`INSERT INTO order_cards (order_id, card_type, status) VALUES (?, ?, ?)`,
  [order_id, card_type, status || 'pending'],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка создания карточки заказа' });
    }
    res.json({ id: this.lastID });
  });
});

// Sash info routes
app.get('/api/sash-info/:orderCardId', requireAuth, (req, res) => {
  const orderCardId = req.params.orderCardId;
  
  db.all('SELECT * FROM sash_info WHERE order_card_id = ? ORDER BY sash_number', [orderCardId], (err, sashInfo) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения информации о створках' });
    }
    res.json(sashInfo);
  });
});

app.post('/api/sash-info', requireAuth, (req, res) => {
  const { order_card_id, sash_number, profile_type, system_type, sash_type, dimensions, notes, photos } = req.body;
  
  db.run(`INSERT INTO sash_info (order_card_id, sash_number, profile_type, system_type, sash_type, dimensions, notes, photos) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [order_card_id, sash_number, profile_type, system_type, sash_type, dimensions, notes, photos],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сохранения информации о створке' });
    }
    res.json({ id: this.lastID });
  });
});

// PDF generation route
app.get('/api/estimate/:id/pdf', requireAuth, (req, res) => {
  const estimateId = req.params.id;
  
  db.get(`SELECT e.*, o.* FROM estimates e 
          JOIN orders o ON e.order_id = o.id 
          WHERE e.id = ?`, [estimateId], (err, estimate) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения сметы' });
    }
    
    if (!estimate) {
      return res.status(404).json({ error: 'Смета не найдена' });
    }
    
    // Get estimate items
    db.all('SELECT * FROM estimate_items WHERE estimate_id = ?', [estimateId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка получения позиций сметы' });
      }
      
      // Generate PDF (simplified version)
      res.json({
        success: true,
        estimate: estimate,
        items: items
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Откройте http://localhost:${PORT} в браузере`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  db.close();
  process.exit(0);
});

// Подключение необходимых модулей для работы сервера
const express = require('express');           // Веб-фреймворк для Node.js
const session = require('express-session');   // Управление сессиями пользователей
const bcrypt = require('bcryptjs');           // Хеширование паролей для безопасности
const sqlite3 = require('sqlite3').verbose(); // База данных SQLite
const multer = require('multer');             // Обработка загрузки файлов
const path = require('path');                 // Работа с путями файлов
const fs = require('fs');                     // Работа с файловой системой
const cors = require('cors');                 // Cross-Origin Resource Sharing
const helmet = require('helmet');             // Безопасность HTTP заголовков
const rateLimit = require('express-rate-limit'); // Ограничение частоты запросов
const { v4: uuidv4 } = require('uuid');       // Генерация уникальных идентификаторов
const moment = require('moment');             // Работа с датами и временем

// Создание экземпляра Express приложения
const app = express();

// Настройка trust proxy для работы за Nginx
app.set('trust proxy', 1);

// Порт для запуска сервера (по умолчанию 3000)
const PORT = process.env.PORT || 3000;

// Настройка middleware (промежуточного ПО)
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
      scriptSrcAttr: ["'unsafe-inline'"], // Разрешаем inline event handlers
      upgradeInsecureRequests: null // Отключаем принудительное перенаправление на HTTPS
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate limiting - отключаем для устранения ошибки с trust proxy
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

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
    // Удаляем неиспользуемые поля координат из таблицы orders (если они существуют)
    db.run(`ALTER TABLE orders DROP COLUMN latitude`, (err) => {
      if (err && !err.message.includes('no such column')) {
        console.error('Ошибка удаления поля latitude:', err);
      }
    });
    
    db.run(`ALTER TABLE orders DROP COLUMN longitude`, (err) => {
      if (err && !err.message.includes('no such column')) {
        console.error('Ошибка удаления поля longitude:', err);
      }
    });
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    full_name TEXT,
    phone TEXT,
    telegram TEXT,
    manager_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (manager_id) REFERENCES users(id)
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

  // Note: updated_at column already exists in orders table

  // User prefixes table for order numbering
  db.run(`CREATE TABLE IF NOT EXISTS user_prefixes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prefix TEXT UNIQUE NOT NULL,
    last_number INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // User profiles table for additional user information
  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT,
    phone1 TEXT,
    phone2 TEXT,
    phone3 TEXT,
    telegram TEXT,
    whatsapp TEXT,
    vk TEXT,
    max TEXT,
    other_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Order history table for tracking changes
  db.run(`CREATE TABLE IF NOT EXISTS order_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    action_text TEXT NOT NULL,
    changes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Insert default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
          VALUES ('admin', ?, 'admin', 'Администратор')`, [adminPassword]);

  // Insert default prefix for admin
  db.run(`INSERT OR IGNORE INTO user_prefixes (user_id, prefix) 
          VALUES (1, 'ADM')`);

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

// Check authentication status
app.get('/api/auth/check', (req, res) => {
  if (req.session.userId) {
    // Get user details from database
    db.get('SELECT id, username, role, full_name FROM users WHERE id = ? AND is_active = 1', [req.session.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      
      if (user) {
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name
          }
        });
      } else {
        res.json({ success: false });
      }
    });
  } else {
    res.json({ success: false });
  }
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
  let query = `SELECT o.*, 
    u.full_name as assigned_name,
    creator.full_name as created_by_name,
    assigner.full_name as assigned_by_name
    FROM orders o 
    LEFT JOIN users u ON o.assigned_to = u.id
    LEFT JOIN users creator ON o.created_by = creator.id
    LEFT JOIN users assigner ON o.assigned_to = assigner.id`;
  let params = [];
  let whereConditions = [];
  
  // Filter by role hierarchy
  if (req.session.userRole === 'admin') {
    // Администратор видит все заказы
    // Никаких дополнительных условий
  } else if (req.session.userRole === 'senior_manager') {
    // Старший менеджер видит свои заказы, назначенные им, и заказы своих подчиненных
    whereConditions.push(`(o.created_by = ? OR o.assigned_to = ? OR o.created_by IN (
      SELECT id FROM users WHERE manager_id = ? OR id IN (
        SELECT id FROM users WHERE manager_id IN (
          SELECT id FROM users WHERE manager_id = ?
        )
      )
    ))`);
    params.push(req.session.userId, req.session.userId, req.session.userId, req.session.userId);
  } else if (req.session.userRole === 'manager') {
    // Менеджер видит свои заказы, назначенные ему, и заказы своих подчиненных
    whereConditions.push(`(o.created_by = ? OR o.assigned_to = ? OR o.created_by IN (
      SELECT id FROM users WHERE manager_id = ?
    ))`);
    params.push(req.session.userId, req.session.userId, req.session.userId);
  } else if (req.session.userRole === 'worker') {
    // Работник видит только свои заказы и назначенные ему
    whereConditions.push('(o.created_by = ? OR o.assigned_to = ?)');
    params.push(req.session.userId, req.session.userId);
  }
  
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' OR ');
  }
  
  query += ' ORDER BY o.created_at DESC';
  
  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Ошибка получения заказов:', err);
      return res.status(500).json({ error: 'Ошибка получения заказов' });
    }
    res.json(orders);
  });
});

app.post('/api/orders', requireAuth, (req, res) => {
  const {
    client_name, client_phone, client_telegram, address, city, street, house,
    entrance, floor, apartment, intercom, problem_description,
    visit_date, assigned_to
  } = req.body;
  
  // Generate order number with user prefix
  db.get('SELECT prefix, last_number FROM user_prefixes WHERE user_id = ?', [req.session.userId], (err, prefixRow) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения префикса пользователя' });
    }
    
    if (!prefixRow) {
      return res.status(400).json({ error: 'Префикс пользователя не настроен. Обратитесь к администратору.' });
    }
    
    const newNumber = prefixRow.last_number + 1;
    const orderNumber = `${prefixRow.prefix}-${newNumber.toString().padStart(6, '0')}`;
    
    // Update last number and create order
    db.run(`UPDATE user_prefixes SET last_number = ? WHERE user_id = ?`, [newNumber, req.session.userId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка обновления номера заказа' });
      }
      
      // Если исполнитель не указан, назначаем создателя заказа
      const finalAssignedTo = assigned_to || req.session.userId;
      
      db.run(`INSERT INTO orders (
        order_number, client_name, client_phone, client_telegram, address, city, street,
        house, entrance, floor, apartment, intercom, problem_description,
        visit_date, assigned_to, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, client_name, client_phone, client_telegram, address, city, street,
       house, entrance, floor, apartment, intercom, problem_description,
       visit_date, finalAssignedTo, req.session.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка создания заказа' });
        }
        
        // Логируем создание заказа
        logOrderHistory(this.lastID, req.session.userId, 'created', 'Заказ создан', `Номер: ${orderNumber}, Клиент: ${client_name}`);
        
        res.json({ id: this.lastID, order_number: orderNumber });
      });
    });
  });
});

// Get order by ID
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const orderId = req.params.id;
  
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) {
      console.error('Ошибка получения заказа:', err);
      return res.status(500).json({ error: 'Ошибка получения заказа' });
    }
    
    if (!order) {
      console.log('Заказ не найден:', orderId);
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    console.log('Заказ найден:', order);
    res.json(order);
  });
});

// Update order status or full order data
app.put('/api/orders/:id', requireAuth, (req, res) => {
  const orderId = req.params.id;
  const { status, client_name, client_phone, client_telegram, city, street, house, apartment, entrance, floor, intercom, problem_description, visit_date } = req.body;
  
  // Если передается только статус, обновляем только статус
  if (status && Object.keys(req.body).length === 1) {
    // Проверяем, что статус валидный
    const validStatuses = ['pending', 'in_progress', 'estimate_sent', 'completed', 'cancelled', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус заказа' });
    }
    
    // Обновляем только статус заказа
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка обновления статуса заказа' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      
      // Логируем изменение статуса
      const statusTexts = {
        'pending': 'Ожидает',
        'in_progress': 'В работе',
        'estimate_sent': 'Смета отправлена',
        'completed': 'Завершен',
        'cancelled': 'Отменен',
        'declined': 'Отказ клиента'
      };
      logOrderHistory(orderId, req.session.userId, 'status_changed', `Статус изменен на: ${statusTexts[status] || status}`);
      
      res.json({ success: true, message: 'Статус заказа обновлен' });
    });
  } else {
    // Обновляем полные данные заказа
    const updateQuery = `
      UPDATE orders SET 
        client_name = ?, 
        client_phone = ?, 
        client_telegram = ?, 
        city = ?, 
        street = ?, 
        house = ?, 
        apartment = ?, 
        entrance = ?, 
        floor = ?, 
        intercom = ?, 
        problem_description = ?, 
        visit_date = ?,
        updated_at = datetime("now")
      WHERE id = ?
    `;
    
    const updateParams = [
      client_name, client_phone, client_telegram, city, street, house, 
      apartment, entrance, floor, intercom, problem_description, visit_date, orderId
    ];
    
    db.run(updateQuery, updateParams, function(err) {
      if (err) {
        console.error('Ошибка обновления заказа:', err);
        return res.status(500).json({ error: 'Ошибка обновления заказа' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      
      // Логируем обновление данных заказа
      logOrderHistory(orderId, req.session.userId, 'updated', 'Данные заказа обновлены', `Клиент: ${client_name}, Телефон: ${client_phone}`);
      
      res.json({ success: true, message: 'Заказ обновлен' });
    });
  }
});

// Delete order (permanent deletion)
app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const orderId = req.params.id;
  
  // Проверяем права доступа (только админ может удалять заказы)
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав для удаления заказов' });
  }
  
  // Сначала удаляем связанные данные
  db.run('DELETE FROM order_cards WHERE order_id = ?', [orderId], (err) => {
    if (err) {
      console.error('Ошибка удаления карточек заказа:', err);
    }
    
    // Удаляем информацию о створках
    db.run('DELETE FROM sash_info WHERE order_card_id IN (SELECT id FROM order_cards WHERE order_id = ?)', [orderId], (err) => {
      if (err) {
        console.error('Ошибка удаления информации о створках:', err);
      }
      
      // Удаляем сам заказ
      db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка удаления заказа' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        res.json({ success: true, message: 'Заказ удален навсегда' });
      });
    });
  });
});

// Update user
app.put('/api/users/:id', requireAuth, (req, res) => {
  const userId = req.params.id;
  const { username, full_name, role, password, manager_id } = req.body;
  
  // Проверяем права доступа (только админ может редактировать пользователей)
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав для редактирования пользователей' });
  }
  
  // Проверяем, что пользователь не редактирует сам себя
  if (parseInt(userId) === req.session.userId) {
    return res.status(400).json({ error: 'Нельзя редактировать собственный профиль через админку' });
  }
  
  let updateQuery = 'UPDATE users SET username = ?, full_name = ?, role = ?, manager_id = ?';
  let updateParams = [username, full_name, role, manager_id || null];
  
  // Добавляем пароль, если он указан
  if (password && password.trim()) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    updateQuery += ', password = ?';
    updateParams.push(hashedPassword);
  }
  
  updateQuery += ' WHERE id = ?';
  updateParams.push(userId);
  
  db.run(updateQuery, updateParams, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обновления пользователя' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ success: true, message: 'Пользователь обновлен' });
  });
});

// Delete user (deactivate)
app.delete('/api/users/:id', requireAuth, (req, res) => {
  const userId = req.params.id;
  
  // Проверяем права доступа (только админ может удалять пользователей)
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав для удаления пользователей' });
  }
  
  // Проверяем, что пользователь не удаляет сам себя
  if (parseInt(userId) === req.session.userId) {
    return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
  }
  
  db.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка деактивации пользователя' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ success: true, message: 'Пользователь деактивирован' });
  });
});

// User profile routes
app.get('/api/user/profile', requireAuth, (req, res) => {
  const userId = req.session.userId;
  
  db.get(`SELECT up.*, u.username, u.role 
          FROM user_profiles up 
          JOIN users u ON up.user_id = u.id 
          WHERE up.user_id = ?`, [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения профиля' });
    }
    
    if (!profile) {
      // Create empty profile if doesn't exist
      db.run(`INSERT INTO user_profiles (user_id, full_name) VALUES (?, ?)`, 
        [userId, req.session.userFullName || ''], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка создания профиля' });
        }
        
        db.get(`SELECT up.*, u.username, u.role 
                FROM user_profiles up 
                JOIN users u ON up.user_id = u.id 
                WHERE up.user_id = ?`, [userId], (err, newProfile) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка получения профиля' });
          }
          res.json(newProfile);
        });
      });
    } else {
      res.json(profile);
    }
  });
});

app.put('/api/user/profile', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { full_name, phone1, phone2, phone3, telegram, whatsapp, vk, max, other_info } = req.body;
  
  db.run(`UPDATE user_profiles SET 
          full_name = ?, phone1 = ?, phone2 = ?, phone3 = ?, 
          telegram = ?, whatsapp = ?, vk = ?, max = ?, other_info = ?,
          updated_at = datetime("now")
          WHERE user_id = ?`, 
    [full_name, phone1, phone2, phone3, telegram, whatsapp, vk, max, other_info, userId], 
    function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
    
    if (this.changes === 0) {
      // Create profile if doesn't exist
      db.run(`INSERT INTO user_profiles 
              (user_id, full_name, phone1, phone2, phone3, telegram, whatsapp, vk, max, other_info) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [userId, full_name, phone1, phone2, phone3, telegram, whatsapp, vk, max, other_info], 
        function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка создания профиля' });
        }
        res.json({ success: true, message: 'Профиль создан' });
      });
    } else {
      res.json({ success: true, message: 'Профиль обновлен' });
    }
  });
});

app.put('/api/user/password', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body;
  
  // Verify current password
  db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка проверки пароля' });
    }
    
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }
    
    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка обновления пароля' });
      }
      res.json({ success: true, message: 'Пароль обновлен' });
    });
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

// Get users for assignment dropdown based on hierarchy
app.get('/api/users/assignable', requireAuth, (req, res) => {
  let query = 'SELECT id, username, full_name, role FROM users WHERE is_active = 1';
  let params = [];
  let whereConditions = [];
  
  // Filter by role hierarchy
  if (req.session.userRole === 'admin') {
    // Администратор может назначать всем
    // Никаких дополнительных условий
  } else if (req.session.userRole === 'senior_manager') {
    // Старший менеджер может назначать всем менеджерам и работникам
    whereConditions.push('role IN ("manager", "worker")');
  } else if (req.session.userRole === 'manager') {
    // Менеджер может назначать только своим подчиненным
    whereConditions.push('(id = ? OR manager_id = ?)');
    params.push(req.session.userId, req.session.userId);
  } else if (req.session.userRole === 'worker') {
    // Работник не может назначать никому
    return res.json([]);
  }
  
  if (whereConditions.length > 0) {
    query += ' AND ' + whereConditions.join(' AND ');
  }
  
  query += ' ORDER BY role, full_name';
  
  db.all(query, params, (err, users) => {
    if (err) {
      console.error('Ошибка получения пользователей для назначения:', err);
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

// Get user hierarchy
app.get('/api/users/:id/hierarchy', requireAuth, (req, res) => {
  const userId = req.params.id;
  
  // Получаем информацию о пользователе и его подчиненных
  const query = `
    WITH RECURSIVE user_hierarchy AS (
      SELECT id, username, full_name, role, manager_id, 0 as level
      FROM users 
      WHERE id = ?
      
      UNION ALL
      
      SELECT u.id, u.username, u.full_name, u.role, u.manager_id, uh.level + 1
      FROM users u
      INNER JOIN user_hierarchy uh ON u.manager_id = uh.id
    )
    SELECT * FROM user_hierarchy ORDER BY level, full_name
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Ошибка получения иерархии:', err);
      return res.status(500).json({ error: 'Ошибка получения иерархии' });
    }
    
    // Строим дерево иерархии
    const hierarchy = buildHierarchyTree(rows);
    res.json(hierarchy);
  });
});

// Update user hierarchy
app.put('/api/users/:id/hierarchy', requireAuth, (req, res) => {
  const userId = req.params.id;
  const { manager_id } = req.body;
  
  // Проверяем права доступа (только админ может управлять иерархией)
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав для управления иерархией' });
  }
  
  // Проверяем, что не создается циклическая зависимость
  if (manager_id) {
    const checkQuery = 'SELECT id FROM users WHERE manager_id = ? AND id = ?';
    db.get(checkQuery, [userId, manager_id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка проверки иерархии' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'Невозможно назначить подчиненного в качестве менеджера' });
      }
      
      // Обновляем иерархию
      updateUserHierarchy(userId, manager_id, res);
    });
  } else {
    // Убираем менеджера
    updateUserHierarchy(userId, null, res);
  }
});

// Helper function to update user hierarchy
function updateUserHierarchy(userId, managerId, res) {
  db.run('UPDATE users SET manager_id = ? WHERE id = ?', [managerId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обновления иерархии' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ success: true, message: 'Иерархия обновлена' });
  });
}

// Helper function to build hierarchy tree
function buildHierarchyTree(rows) {
  if (rows.length === 0) return null;
  
  const userMap = new Map();
  let root = null;
  
  // Создаем карту пользователей
  rows.forEach(row => {
    userMap.set(row.id, {
      id: row.id,
      username: row.username,
      full_name: row.full_name,
      role: row.role,
      manager_id: row.manager_id,
      subordinates: []
    });
  });
  
  // Строим дерево
  rows.forEach(row => {
    const user = userMap.get(row.id);
    if (row.level === 0) {
      root = user;
    } else if (user.manager_id) {
      const manager = userMap.get(user.manager_id);
      if (manager) {
        manager.subordinates.push(user);
      }
    }
  });
  
  return root;
}

// Get order history
app.get('/api/orders/:id/history', requireAuth, (req, res) => {
  const orderId = req.params.id;
  
  // Получаем историю изменений заказа
  const query = `
    SELECT 
      oh.id,
      oh.action,
      oh.action_text,
      oh.changes,
      oh.created_at,
      u.full_name as user_name,
      u.username
    FROM order_history oh
    LEFT JOIN users u ON oh.user_id = u.id
    WHERE oh.order_id = ?
    ORDER BY oh.created_at DESC
  `;
  
  db.all(query, [orderId], (err, rows) => {
    if (err) {
      console.error('Ошибка получения истории заказа:', err);
      return res.status(500).json({ error: 'Ошибка получения истории заказа' });
    }
    
    res.json(rows);
  });
});

// Search orders
app.get('/api/orders/search', requireAuth, (req, res) => {
  const { order_number, client_name, client_phone, address, status, date_from, date_to } = req.query;
  
  let whereConditions = [];
  let params = [];
  
  // Фильтрация по роли пользователя
  if (req.session.userRole === 'admin') {
    // Администратор видит все заказы
  } else if (req.session.userRole === 'senior_manager') {
    // Старший менеджер видит свои заказы и заказы подчиненных
    whereConditions.push(`(o.created_by = ? OR o.assigned_to = ? OR u.manager_id = ?)`);
    params.push(req.session.userId, req.session.userId, req.session.userId);
  } else if (req.session.userRole === 'manager') {
    // Менеджер видит свои заказы и заказы назначенных работников
    whereConditions.push(`(o.created_by = ? OR o.assigned_to = ? OR u.manager_id = ?)`);
    params.push(req.session.userId, req.session.userId, req.session.userId);
  } else {
    // Работник видит только свои заказы и назначенные ему
    whereConditions.push(`(o.created_by = ? OR o.assigned_to = ?)`);
    params.push(req.session.userId, req.session.userId);
  }
  
  // Поиск по номеру заказа
  if (order_number) {
    whereConditions.push(`o.order_number LIKE ?`);
    params.push(`%${order_number}%`);
  }
  
  // Поиск по имени клиента
  if (client_name) {
    whereConditions.push(`o.client_name LIKE ?`);
    params.push(`%${client_name}%`);
  }
  
  // Поиск по телефону
  if (client_phone) {
    whereConditions.push(`o.client_phone LIKE ?`);
    params.push(`%${client_phone}%`);
  }
  
  // Поиск по адресу
  if (address) {
    whereConditions.push(`(o.address LIKE ? OR o.city LIKE ? OR o.street LIKE ?)`);
    params.push(`%${address}%`, `%${address}%`, `%${address}%`);
  }
  
  // Фильтр по статусу
  if (status) {
    whereConditions.push(`o.status = ?`);
    params.push(status);
  }
  
  // Фильтр по дате от
  if (date_from) {
    whereConditions.push(`DATE(o.created_at) >= ?`);
    params.push(date_from);
  }
  
  // Фильтр по дате до
  if (date_to) {
    whereConditions.push(`DATE(o.created_at) <= ?`);
    params.push(date_to);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  const query = `
    SELECT 
      o.*,
      u1.full_name as assigned_name,
      u2.full_name as created_by_name,
      u3.full_name as assigned_by_name
    FROM orders o
    LEFT JOIN users u1 ON o.assigned_to = u1.id
    LEFT JOIN users u2 ON o.created_by = u2.id
    LEFT JOIN users u3 ON o.assigned_to = u3.id
    ${whereClause}
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Ошибка поиска заказов:', err);
      return res.status(500).json({ error: 'Ошибка поиска заказов' });
    }
    
    res.json(rows);
  });
});

// Helper function to log order history
function logOrderHistory(orderId, userId, action, actionText, changes = null) {
  const query = `INSERT INTO order_history (order_id, user_id, action, action_text, changes, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`;
  db.run(query, [orderId, userId, action, actionText, changes], (err) => {
    if (err) {
      console.error('Ошибка записи в историю заказа:', err);
    }
  });
}

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

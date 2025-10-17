# 📡 API Документация - Оконные Мастера

## 🔗 Базовый URL

```
http://188.120.240.71/api
```

## 🔐 Аутентификация

Все API endpoints (кроме `/login`) требуют аутентификации через сессию.

### Логин
```http
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "Администратор"
  }
}
```

### Выход
```http
POST /api/logout
```

**Ответ:**
```json
{
  "success": true,
  "message": "Выход выполнен"
}
```

## 👥 Пользователи

### Получить всех пользователей
```http
GET /api/users
```

**Ответ:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "Администратор",
    "is_active": 1,
    "created_at": "2024-10-17T18:00:00.000Z"
  }
]
```

### Создать пользователя
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "role": "worker",
  "full_name": "Новый пользователь",
  "manager_id": 1
}
```

### Обновить пользователя
```http
PUT /api/users/:id
Content-Type: application/json

{
  "full_name": "Обновленное имя",
  "role": "manager"
}
```

### Удалить пользователя
```http
DELETE /api/users/:id
```

## 📋 Заказы

### Получить все заказы
```http
GET /api/orders
```

**Параметры запроса:**
- `status` - фильтр по статусу
- `assigned_to` - фильтр по исполнителю
- `created_by` - фильтр по создателю

**Ответ:**
```json
[
  {
    "id": 1,
    "order_number": "ADM-000001",
    "client_name": "Иван Иванов",
    "client_phone": "+7-999-123-45-67",
    "client_telegram": "@ivan",
    "address": "Москва, ул. Тестовая, 123",
    "city": "Москва",
    "street": "ул. Тестовая",
    "house": "123",
    "entrance": "1",
    "floor": "5",
    "apartment": "50",
    "intercom": "1234",
    "problem_description": "Ремонт окна",
    "visit_date": "2024-10-20T10:00:00.000Z",
    "status": "pending",
    "assigned_to": 1,
    "created_by": 1,
    "created_at": "2024-10-17T18:00:00.000Z",
    "assigned_name": "Администратор",
    "created_by_name": "Администратор"
  }
]
```

### Получить заказ по ID
```http
GET /api/orders/:id
```

### Создать заказ
```http
POST /api/orders
Content-Type: application/json

{
  "client_name": "Иван Иванов",
  "client_phone": "+7-999-123-45-67",
  "client_telegram": "@ivan",
  "address": "Москва, ул. Тестовая, 123",
  "city": "Москва",
  "street": "ул. Тестовая",
  "house": "123",
  "entrance": "1",
  "floor": "5",
  "apartment": "50",
  "intercom": "1234",
  "problem_description": "Ремонт окна",
  "visit_date": "2024-10-20T10:00:00.000Z",
  "assigned_to": 1
}
```

### Обновить заказ
```http
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Или полное обновление:**
```json
{
  "client_name": "Обновленное имя",
  "client_phone": "+7-999-999-99-99",
  "status": "completed"
}
```

### Удалить заказ
```http
DELETE /api/orders/:id
```

### Поиск заказов
```http
GET /api/orders/search?client_name=Иван&status=pending
```

**Параметры поиска:**
- `order_number` - номер заказа
- `client_name` - имя клиента
- `client_phone` - телефон клиента
- `address` - адрес
- `status` - статус
- `date_from` - дата от
- `date_to` - дата до

## 👤 Профиль пользователя

### Получить профиль
```http
GET /api/user/profile
```

### Обновить профиль
```http
PUT /api/user/profile
Content-Type: application/json

{
  "full_name": "Полное имя",
  "phone1": "+7-999-123-45-67",
  "phone2": "+7-999-123-45-68",
  "phone3": "+7-999-123-45-69",
  "telegram": "@username",
  "whatsapp": "+7-999-123-45-67",
  "vk": "https://vk.com/username",
  "other_info": "Дополнительная информация"
}
```

### Изменить пароль
```http
PUT /api/user/password
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

## 🛠 Услуги и цены

### Получить услуги
```http
GET /api/services?category=repair
```

**Параметры:**
- `category` - категория услуг (repair, mosquito, blinds)

### Создать услугу
```http
POST /api/services
Content-Type: application/json

{
  "name": "Замена уплотнителя",
  "category": "repair",
  "calculation_type": "fixed_price",
  "base_price": 1500,
  "unit": "шт",
  "description": "Замена уплотнителя на створке"
}
```

### Получить профили систем
```http
GET /api/service-profiles?profile_type=plastic
```

## 📊 Статистика и отчеты

### Получить статистику заказов
```http
GET /api/orders/stats
```

**Ответ:**
```json
{
  "total": 100,
  "pending": 15,
  "in_progress": 25,
  "completed": 50,
  "cancelled": 5,
  "declined": 5
}
```

## 🔍 История изменений

### Получить историю заказа
```http
GET /api/orders/:id/history
```

**Ответ:**
```json
[
  {
    "id": 1,
    "order_id": 1,
    "user_id": 1,
    "action": "created",
    "action_text": "Заказ создан",
    "changes": "Номер: ADM-000001, Клиент: Иван Иванов",
    "created_at": "2024-10-17T18:00:00.000Z"
  }
]
```

## 📝 Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешно |
| 201 | Создано |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Не найдено |
| 500 | Внутренняя ошибка сервера |

## ⚠️ Ошибки

Все ошибки возвращаются в формате:
```json
{
  "error": "Описание ошибки",
  "details": "Дополнительная информация"
}
```

## 🔒 Роли и права доступа

### Администратор
- Полный доступ ко всем функциям
- Управление пользователями
- Настройка системы
- Просмотр всех заказов

### Старший менеджер
- Просмотр всех заказов
- Управление подчиненными
- Назначение исполнителей

### Менеджер
- Просмотр назначенных заказов
- Управление работниками
- Создание заказов

### Работник
- Просмотр назначенных заказов
- Выполнение задач
- Обновление статусов

## 📱 Примеры использования

### JavaScript (Fetch API)
```javascript
// Логин
const login = async (username, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

// Получить заказы
const getOrders = async () => {
  const response = await fetch('/api/orders', {
    credentials: 'include'
  });
  return response.json();
};

// Создать заказ
const createOrder = async (orderData) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(orderData)
  });
  return response.json();
};
```

### cURL
```bash
# Логин
curl -X POST http://188.120.240.71/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Получить заказы
curl -b cookies.txt http://188.120.240.71/api/orders

# Создать заказ
curl -X POST http://188.120.240.71/api/orders \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"client_name":"Тест","client_phone":"+7-999-123-45-67","address":"Тестовый адрес"}'
```

## 🚀 Rate Limiting

API не имеет ограничений по частоте запросов в текущей версии, но рекомендуется не превышать 100 запросов в минуту на пользователя.

## 📞 Поддержка

При возникновении проблем с API:
1. Проверьте коды ответов
2. Убедитесь в правильности аутентификации
3. Проверьте формат данных
4. Обратитесь к разработчикам

---

**Версия API:** 1.0  
**Последнее обновление:** 17 октября 2024

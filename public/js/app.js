/**
 * Основной класс приложения для управления заказами по ремонту окон
 * Содержит всю логику работы с заказами, сметами, пользователями и настройками
 */
class WindowRepairApp {
    /**
     * Конструктор класса - инициализация приложения
     * Создает пустые массивы для хранения данных и запускает инициализацию
     */
    constructor() {
        this.currentUser = null;        // Текущий авторизованный пользователь
        this.orders = [];              // Массив всех заказов
        this.estimates = [];           // Массив всех смет
        this.users = [];               // Массив всех пользователей системы
        this.settings = {};            // Настройки системы
        this.services = [];            // Массив услуг и цен
        this.serviceProfiles = [];     // Массив профилей систем
        this.currentWorkOrderId = null; // ID текущего заказа в работе
        
        this.init(); // Запуск инициализации приложения
    }

    /**
     * Инициализация приложения
     * Настраивает обработчики событий и проверяет авторизацию пользователя
     */
    init() {
        this.setupEventListeners(); // Настройка всех обработчиков событий
        this.checkAuth();           // Проверка авторизации пользователя
    }

    /**
     * Настройка всех обработчиков событий в приложении
     * Привязывает функции к кнопкам и формам на странице
     */
    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        // Обработчик формы входа в систему
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            this.login();       // Вызываем метод входа
        });

        // Обработчик кнопки выхода из системы
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout(); // Вызываем метод выхода
        });

        // Обработчики навигационных ссылок
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Предотвращаем переход по ссылке
                const page = e.target.getAttribute('data-page'); // Получаем название страницы
                this.showPage(page); // Показываем выбранную страницу
            });
        });

        // Обработчик кнопки сохранения заказа
        const saveOrderBtn = document.getElementById('saveOrderBtn');
        if (saveOrderBtn) {
            console.log('Кнопка сохранения заказа найдена, добавляем обработчик');
            saveOrderBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Предотвращаем стандартное поведение
                console.log('Кнопка сохранения заказа нажата!'); // Отладочное сообщение
                this.saveOrder(); // Вызываем метод сохранения заказа
            });
        } else {
            console.error('Кнопка saveOrderBtn не найдена!');
        }

        // Обработчик кнопки сохранения пользователя
        document.getElementById('saveUserBtn').addEventListener('click', () => {
            this.saveUser(); // Вызываем метод сохранения пользователя
        });

        // Обработчик формы настроек системы
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            this.saveSettings(); // Вызываем метод сохранения настроек
        });

        // Обработчик кнопки сохранения услуги
        document.getElementById('saveServiceBtn').addEventListener('click', () => {
            this.saveService(); // Вызываем метод сохранения услуги
        });

        // Обработчик кнопки сохранения профиля системы
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            this.saveProfile(); // Вызываем метод сохранения профиля
        });

        // Обработчик формы профиля пользователя
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            this.saveUserProfile(); // Вызываем метод сохранения профиля
        });

        // Обработчик формы смены пароля
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            this.changePassword(); // Вызываем метод смены пароля
        });
    }

    /**
     * Проверка авторизации пользователя при загрузке страницы
     * Отправляет запрос на сервер для проверки текущей сессии
     */
    async checkAuth() {
        try {
            // Отправляем запрос на сервер для получения информации о текущем пользователе
            const response = await fetch('/api/user');
            
            if (response.ok) {
                // Если пользователь авторизован, получаем его данные
                const user = await response.json();
                this.currentUser = user; // Сохраняем данные пользователя
                this.showMainApp();      // Показываем основное приложение
                this.loadDashboardData(); // Загружаем данные дашборда
            } else {
                // Если пользователь не авторизован, показываем форму входа
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            this.showLoginScreen(); // При ошибке показываем форму входа
        }
    }

    /**
     * Авторизация пользователя в системе
     * Отправляет логин и пароль на сервер для проверки
     */
    async login() {
        // Получаем данные из формы входа
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError'); // Элемент для отображения ошибок

        console.log('Попытка входа:', { username, password });

        try {
            // Отправляем запрос на сервер для авторизации
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Ответ сервера:', response.status, response.statusText);

            // Получаем ответ от сервера
            const data = await response.json();
            console.log('Данные ответа:', data);

            if (response.ok) {
                // Если авторизация успешна, сохраняем данные пользователя
                this.currentUser = data.user;
                console.log('Пользователь авторизован:', this.currentUser);
                this.showMainApp();      // Показываем основное приложение
                this.loadDashboardData(); // Загружаем данные дашборда
                errorDiv.style.display = 'none'; // Скрываем сообщение об ошибке
            } else {
                // Если авторизация не удалась, показываем ошибку
                console.error('Ошибка авторизации:', data);
                errorDiv.textContent = data.error || 'Ошибка входа';
                errorDiv.style.display = 'block'; // Показываем сообщение об ошибке
            }
        } catch (error) {
            // При ошибке соединения показываем соответствующее сообщение
            console.error('Ошибка входа:', error);
            errorDiv.textContent = 'Ошибка соединения с сервером';
            errorDiv.style.display = 'block';
        }
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            this.currentUser = null;
            this.showLoginScreen();
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }

    /**
     * Показ экрана входа в систему
     * Скрывает основное приложение и показывает форму авторизации
     */
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'block';  // Показываем экран входа
        document.getElementById('mainApp').style.display = 'none';       // Скрываем основное приложение
    }

    /**
     * Показ основного приложения после успешной авторизации
     * Скрывает экран входа и показывает интерфейс приложения
     */
    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';   // Скрываем экран входа
        document.getElementById('mainApp').style.display = 'block';      // Показываем основное приложение
        
        // Обновляем отображение имени пользователя в интерфейсе
        document.getElementById('userName').textContent = this.currentUser.username;
        
        // Показываем/скрываем административное меню в зависимости от роли пользователя
        const adminMenu = document.getElementById('adminMenu');
        if (this.currentUser.role === 'admin') {
            adminMenu.style.display = 'block'; // Показываем меню для администратора
        } else {
            adminMenu.style.display = 'none';  // Скрываем меню для обычных пользователей
        }
    }

    /**
     * Переключение между страницами приложения
     * Скрывает все страницы и показывает выбранную, обновляет навигацию
     * @param {string} pageName - Название страницы для отображения
     */
    showPage(pageName) {
        // Скрываем все страницы приложения
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // Показываем выбранную страницу
        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Обновляем активную ссылку в навигационном меню
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active'); // Убираем активный класс со всех ссылок
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active'); // Добавляем активный класс к выбранной ссылке

        // Загружаем данные для выбранной страницы
        switch (pageName) {
            case 'dashboard':
                this.loadDashboardData(); // Загружаем данные дашборда
                break;
            case 'orders':
                this.loadOrders(); // Загружаем список заказов
                break;
            case 'estimates':
                this.loadEstimates(); // Загружаем список смет
                break;
            case 'admin':
                this.loadAdminData(); // Загружаем административные данные
                break;
            case 'profile':
                this.loadProfileData(); // Загружаем данные профиля
                break;
            case 'work':
                this.loadWorkData(); // Загружаем данные для работы с заказом
                break;
            case 'declined':
                this.loadDeclinedOrders(); // Загружаем отказы клиентов
                break;
            case 'cancelled':
                this.loadCancelledOrders(); // Загружаем отмененные заказы
                break;
        }
    }

    /**
     * Загрузка данных для главной страницы (дашборда)
     * Получает статистику по заказам и сметам, обновляет счетчики
     */
    async loadDashboardData() {
        try {
            // Параллельно загружаем данные о заказах и сметах
            const [ordersResponse, estimatesResponse] = await Promise.all([
                fetch('/api/orders'),    // Запрос списка заказов
                fetch('/api/estimates')  // Запрос списка смет
            ]);

            // Обрабатываем ответ с заказами
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                this.orders = orders; // Сохраняем заказы в свойстве класса
                
                // Подсчитываем статистику по статусам заказов
                const newOrders = orders.filter(order => order.status === 'pending').length;        // Новые заказы
                const inProgress = orders.filter(order => order.status === 'in_progress').length;  // В работе
                const completed = orders.filter(order => order.status === 'completed').length;     // Завершенные
                
                // Обновляем счетчики на странице
                document.getElementById('newOrdersCount').textContent = newOrders;
                document.getElementById('inProgressCount').textContent = inProgress;
                document.getElementById('completedCount').textContent = completed;
            }

            // Обрабатываем ответ со сметами
            if (estimatesResponse.ok) {
                const estimates = await estimatesResponse.json();
                this.estimates = estimates; // Сохраняем сметы в свойстве класса
                document.getElementById('estimatesCount').textContent = estimates.length; // Обновляем счетчик смет
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    /**
     * Загрузка списка заказов с сервера
     * Получает все заказы и отображает их в интерфейсе
     */
    async loadOrders() {
        try {
            console.log('Загружаем список заказов...');
            // Отправляем запрос на сервер для получения списка заказов
            const response = await fetch('/api/orders');
            
            if (response.ok) {
                // Если запрос успешен, получаем данные заказов
                const orders = await response.json();
                console.log('Получены заказы:', orders);
                this.orders = orders; // Сохраняем заказы в свойстве класса
                this.renderOrderCards(orders); // Отображаем заказы в виде карточек
                console.log('Заказы отображены в интерфейсе');
            } else {
                console.error('Ошибка загрузки заказов:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            this.showAlert('Ошибка загрузки заказов', 'danger');
        }
    }

    renderOrdersTable(orders) {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.order_number}</td>
                <td>${order.client_name}</td>
                <td>${order.address}</td>
                <td>${order.visit_date ? new Date(order.visit_date).toLocaleString('ru-RU') : '-'}</td>
                <td><span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${order.assigned_name || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.createEstimate(${order.id})">
                        <i class="fas fa-calculator"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadEstimates() {
        try {
            const response = await fetch('/api/estimates');
            if (response.ok) {
                const estimates = await response.json();
                this.estimates = estimates;
                this.renderEstimatesTable(estimates);
            }
        } catch (error) {
            console.error('Ошибка загрузки смет:', error);
        }
    }

    renderEstimatesTable(estimates) {
        const tbody = document.querySelector('#estimatesTable tbody');
        tbody.innerHTML = '';

        estimates.forEach(estimate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${estimate.estimate_number}</td>
                <td>${estimate.order_number}</td>
                <td>${estimate.client_name}</td>
                <td>${estimate.final_amount.toLocaleString('ru-RU')} ₽</td>
                <td><span class="status-badge status-${estimate.status}">${this.getStatusText(estimate.status)}</span></td>
                <td>${new Date(estimate.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.viewEstimate(${estimate.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.downloadEstimatePDF(${estimate.id})">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadAdminData() {
        await this.loadUsers();
        await this.loadSettings();
        await this.loadAssignableUsers();
        await this.loadServices();
        await this.loadServiceProfiles();
    }

    async loadAssignableUsers() {
        try {
            const response = await fetch('/api/users/assignable');
            if (response.ok) {
                const users = await response.json();
                this.populateAssignableUsers(users);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей для назначения:', error);
        }
    }

    populateAssignableUsers(users) {
        const select = document.getElementById('assignedTo');
        select.innerHTML = '<option value="">Выберите исполнителя</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.full_name || user.username} (${this.getRoleText(user.role)})`;
            select.appendChild(option);
        });
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const users = await response.json();
                this.users = users;
                this.renderUsersTable(users);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    }

    renderUsersTable(users) {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.full_name || user.username}</td>
                <td><span class="role-badge role-${user.role}">${this.getRoleText(user.role)}</span></td>
                <td>${user.is_active ? 'Активен' : 'Заблокирован'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="app.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                this.settings = settings;
                
                // Заполняем форму настроек
                document.getElementById('companyName').value = settings.company_name || '';
                document.getElementById('currency').value = settings.currency || 'RUB';
                document.getElementById('taxSystem').value = settings.tax_system || 'AUSN';
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    // Сохранение нового заказа
    async saveOrder() {
        console.log('=== НАЧАЛО СОХРАНЕНИЯ ЗАКАЗА ===');
        
        // Проверяем, что все необходимые элементы существуют
        const clientNameEl = document.getElementById('clientName');
        const clientPhoneEl = document.getElementById('clientPhone');
        
        if (!clientNameEl || !clientPhoneEl) {
            console.error('Не найдены обязательные поля формы!');
            this.showAlert('Ошибка: форма не загружена правильно', 'danger');
            return;
        }
        
        // Собираем данные из формы
        const formData = {
            client_name: clientNameEl.value,
            client_phone: clientPhoneEl.value,
            client_telegram: document.getElementById('clientTelegram')?.value || '',
            address: `${document.getElementById('city')?.value || ''}, ${document.getElementById('street')?.value || ''}, ${document.getElementById('house')?.value || ''}`,
            city: document.getElementById('city')?.value || '',
            street: document.getElementById('street')?.value || '',
            house: document.getElementById('house')?.value || '',
            entrance: document.getElementById('entrance')?.value || '',
            floor: document.getElementById('floor')?.value || '',
            apartment: document.getElementById('apartment')?.value || '',
            intercom: document.getElementById('intercom')?.value || '',
            problem_description: document.getElementById('problemDescription')?.value || '',
            visit_date: document.getElementById('visitDate')?.value || '',
            assigned_to: document.getElementById('assignedTo')?.value || null
        };

        console.log('Данные для отправки:', formData);

        // Проверяем обязательные поля
        if (!formData.client_name || !formData.client_phone) {
            this.showAlert('Заполните обязательные поля: имя клиента и телефон', 'warning');
            return;
        }

        try {
            // Отправляем запрос на сервер
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Ответ сервера:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('Заказ создан:', data);
                
                // Создаем карточку заказа
                await this.createOrderCard(data.id);
                
                this.showAlert('Заказ успешно создан!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('newOrderModal')).hide();
                document.getElementById('newOrderForm').reset();
                console.log('Перезагружаем список заказов...');
                await this.loadOrders();
                console.log('Список заказов обновлен');
            } else {
                const error = await response.json();
                console.error('Ошибка создания заказа:', error);
                this.showAlert(error.error || 'Ошибка создания заказа', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения заказа:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    // Создание карточки заказа после создания заказа
    async createOrderCard(orderId) {
        try {
            const response = await fetch('/api/order-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: orderId,
                    card_type: 'measurement',
                    status: 'pending'
                })
            });

            if (response.ok) {
                console.log('Карточка заказа создана для заказа:', orderId);
            } else {
                console.error('Ошибка создания карточки заказа');
            }
        } catch (error) {
            console.error('Ошибка создания карточки заказа:', error);
        }
    }

    /**
     * Сохранение пользователя в системе (создание или редактирование)
     * Собирает данные из формы и отправляет на сервер
     */
    async saveUser() {
        // Проверяем, это редактирование или создание
        const editUserId = document.getElementById('editUserId');
        const isEdit = editUserId && editUserId.value;
        
        // Собираем данные из формы
        const formData = {
            username: document.getElementById('newUsername').value,     // Имя пользователя
            full_name: document.getElementById('newFullName').value,    // Полное имя
            role: document.getElementById('newUserRole').value          // Роль пользователя
        };

        // Добавляем пароль только при создании или если он указан
        const password = document.getElementById('newPassword').value;
        if (!isEdit || password) {
            formData.password = password;
        }

        try {
            let response;
            if (isEdit) {
                // Редактирование существующего пользователя
                response = await fetch(`/api/users/${editUserId.value}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Создание нового пользователя
                response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                // Если операция успешна
                const message = isEdit ? 'Пользователь успешно обновлен!' : 'Пользователь успешно создан!';
                this.showAlert(message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('newUserModal')).hide(); // Закрываем модальное окно
                document.getElementById('newUserForm').reset(); // Очищаем форму
                this.loadUsers(); // Перезагружаем список пользователей
                
                // Сбрасываем режим редактирования
                if (editUserId) {
                    editUserId.remove();
                }
                document.querySelector('#newUserModal .modal-title').textContent = 'Новый пользователь';
                document.getElementById('saveUserBtn').textContent = 'Сохранить';
            } else {
                // Если произошла ошибка
                const error = await response.json();
                const errorMessage = isEdit ? 'Ошибка обновления пользователя' : 'Ошибка создания пользователя';
                this.showAlert(error.error || errorMessage, 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    async saveSettings() {
        const settings = {
            company_name: document.getElementById('companyName').value,
            currency: document.getElementById('currency').value,
            tax_system: document.getElementById('taxSystem').value
        };

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showAlert('Настройки сохранены!', 'success');
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка сохранения настроек', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Ожидает',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен',
            'draft': 'Черновик',
            'approved': 'Утвержден'
        };
        return statusMap[status] || status;
    }

    getRoleText(role) {
        const roleMap = {
            'admin': 'Администратор',
            'senior_manager': 'Старший менеджер',
            'manager': 'Менеджер',
            'worker': 'Работник'
        };
        return roleMap[role] || role;
    }

    /**
     * Показ уведомления пользователю
     * Создает всплывающее уведомление в правом верхнем углу экрана
     * @param {string} message - Текст сообщения для отображения
     * @param {string} type - Тип уведомления (success, danger, warning, info)
     */
    showAlert(message, type = 'info') {
        // Создаем HTML-элемент для уведомления
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        // Заполняем содержимое уведомления
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Добавляем уведомление на страницу
        document.body.appendChild(alertDiv);
        
        // Автоматически скрываем уведомление через 5 секунд
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove(); // Удаляем уведомление из DOM
            }
        }, 5000);
    }

    // Заглушки для методов, которые будут реализованы позже
    viewOrder(orderId) {
        console.log('Просмотр заказа:', orderId);
        this.showAlert('Функция просмотра заказа в разработке', 'info');
    }

    createEstimate(orderId) {
        console.log('Создание сметы для заказа:', orderId);
        if (window.estimateManager) {
            estimateManager.createEstimate(orderId);
        } else {
            this.showAlert('Модуль смет не загружен', 'error');
        }
    }

    viewEstimate(estimateId) {
        console.log('Просмотр сметы:', estimateId);
        this.showAlert('Функция просмотра сметы в разработке', 'info');
    }

    downloadEstimatePDF(estimateId) {
        console.log('Скачивание PDF сметы:', estimateId);
        if (window.pdfExporter) {
            pdfExporter.exportEstimateToPDF(estimateId);
        } else {
            this.showAlert('Модуль PDF экспорта не загружен', 'error');
        }
    }

    /**
     * Редактирование пользователя
     * @param {number} userId - ID пользователя для редактирования
     */
    editUser(userId) {
        console.log('Редактирование пользователя:', userId);
        
        // Находим пользователя по ID
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Пользователь не найден', 'danger');
            return;
        }
        
        // Заполняем форму редактирования
        document.getElementById('newUsername').value = user.username;
        document.getElementById('newFullName').value = user.full_name || '';
        document.getElementById('newUserRole').value = user.role;
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('newUserModal'));
        modal.show();
        
        // Меняем заголовок и кнопку
        document.querySelector('#newUserModal .modal-title').textContent = 'Редактирование пользователя';
        document.getElementById('saveUserBtn').textContent = 'Сохранить изменения';
        
        // Добавляем скрытое поле с ID пользователя
        let hiddenId = document.getElementById('editUserId');
        if (!hiddenId) {
            hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.id = 'editUserId';
            document.getElementById('newUserForm').appendChild(hiddenId);
        }
        hiddenId.value = userId;
    }

    /**
     * Удаление пользователя (деактивация)
     * @param {number} userId - ID пользователя для удаления
     */
    async deleteUser(userId) {
        console.log('Удаление пользователя:', userId);
        
        if (!confirm('Вы уверены, что хотите деактивировать этого пользователя?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Пользователь деактивирован', 'success');
                this.loadUsers(); // Перезагружаем список пользователей
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка деактивации пользователя', 'danger');
            }
        } catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    // Services management
    async loadServices() {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const services = await response.json();
                this.services = services;
                this.renderServicesTable(services);
            }
        } catch (error) {
            console.error('Ошибка загрузки услуг:', error);
        }
    }

    renderServicesTable(services) {
        const tbody = document.querySelector('#servicesTable tbody');
        tbody.innerHTML = '';

        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.name}</td>
                <td><span class="badge bg-primary">${this.getCategoryText(service.category)}</span></td>
                <td>${service.unit_type}</td>
                <td>${service.base_price.toLocaleString('ru-RU')} ₽</td>
                <td>${this.getCalculationTypeText(service.calculation_type)}</td>
                <td>${service.is_active ? 'Активна' : 'Неактивна'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="app.editService(${service.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteService(${service.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Service profiles management
    async loadServiceProfiles() {
        try {
            const response = await fetch('/api/service-profiles');
            if (response.ok) {
                const profiles = await response.json();
                this.serviceProfiles = profiles;
                this.renderServiceProfilesTable(profiles);
            }
        } catch (error) {
            console.error('Ошибка загрузки профилей:', error);
        }
    }

    renderServiceProfilesTable(profiles) {
        const tbody = document.querySelector('#profilesTable tbody');
        tbody.innerHTML = '';

        profiles.forEach(profile => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.getProfileTypeText(profile.profile_type)}</td>
                <td>${profile.system_type}</td>
                <td>${profile.sash_type || '-'}</td>
                <td>${profile.complexity_coefficient}x</td>
                <td>${profile.is_active ? 'Активен' : 'Неактивен'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="app.editProfile(${profile.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteProfile(${profile.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Order cards management
    async showOrderCards(status = null) {
        try {
            const url = status ? `/api/order-cards?status=${status}` : '/api/order-cards';
            const response = await fetch(url);
            if (response.ok) {
                const cards = await response.json();
                this.renderOrderCards(cards);
            }
        } catch (error) {
            console.error('Ошибка загрузки карточек заказов:', error);
        }
    }

    /**
     * Отображение заказов в виде карточек
     * Очищает контейнер и создает HTML для каждой карточки заказа
     * @param {Array} cards - Массив заказов для отображения
     */
    renderOrderCards(cards) {
        // Получаем контейнер для карточек заказов
        const container = document.getElementById('orderCardsContainer');
        container.innerHTML = ''; // Очищаем контейнер

        // Создаем HTML для каждой карточки заказа
        cards.forEach(card => {
            const cardHtml = this.createOrderCardHtml(card); // Создаем HTML карточки
            container.insertAdjacentHTML('beforeend', cardHtml); // Добавляем в контейнер
        });
    }

    /**
     * Создание HTML-кода для карточки заказа
     * Генерирует Bootstrap-карточку с информацией о заказе и кнопками действий
     * @param {Object} card - Объект заказа с данными
     * @returns {string} HTML-код карточки
     */
    createOrderCardHtml(card) {
        // Цвета для статусов заказов
        const statusColors = {
            'pending': 'warning',      // Ожидает - желтый
            'in_progress': 'info',     // В работе - синий
            'completed': 'success',    // Завершен - зеленый
            'cancelled': 'danger'      // Отменен - красный
        };

        // Возвращаем HTML-код карточки заказа
        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <!-- Заголовок карточки с номером заказа и статусом -->
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${card.order_number}</h6>
                        <span class="badge bg-${statusColors[card.status] || 'secondary'}">${this.getStatusText(card.status)}</span>
                    </div>
                    
                    <!-- Основное содержимое карточки -->
                    <div class="card-body">
                        <h6 class="card-title">${card.client_name}</h6>
                        <p class="card-text">
                            <i class="fas fa-map-marker-alt"></i> ${card.address}<br>
                            <i class="fas fa-phone"></i> ${card.client_phone}<br>
                            <i class="fas fa-calendar"></i> ${card.visit_date ? new Date(card.visit_date).toLocaleString('ru-RU') : 'Не указано'}<br>
                            <i class="fas fa-user"></i> ${card.assigned_name || 'Не назначен'}
                        </p>
                        <p class="card-text"><small class="text-muted">${card.problem_description || 'Описание не указано'}</small></p>
                    </div>
                    
                    <!-- Подвал карточки с кнопками действий -->
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.viewOrderCard(${card.id})" title="Просмотр заказа">
                                <i class="fas fa-eye"></i> Просмотр
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="app.startWork(${card.id})" title="Начать работу">
                                <i class="fas fa-play"></i> В работу
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="app.declineOrder(${card.id})" title="Отказ клиента">
                                <i class="fas fa-ban"></i> Отказ
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.cancelOrder(${card.id})" title="Отменить заказ">
                                <i class="fas fa-times"></i> Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    getCategoryText(category) {
        const categories = {
            'mosquito': 'Москитные системы',
            'blinds': 'Рулонные шторы',
            'repair': 'Ремонт'
        };
        return categories[category] || category;
    }

    getCalculationTypeText(type) {
        const types = {
            'fixed': 'Фиксированная',
            'linear': 'За погонный метр',
            'area': 'За квадратный метр',
            'quantity': 'За количество'
        };
        return types[type] || type;
    }

    getProfileTypeText(type) {
        const types = {
            'plastic': 'Пластик',
            'wood': 'Дерево',
            'aluminum': 'Алюминий'
        };
        return types[type] || type;
    }

    // Placeholder methods for new functionality
    editService(serviceId) {
        console.log('Редактирование услуги:', serviceId);
        this.showAlert('Функция редактирования услуги в разработке', 'info');
    }

    deleteService(serviceId) {
        console.log('Удаление услуги:', serviceId);
        this.showAlert('Функция удаления услуги в разработке', 'info');
    }

    editProfile(profileId) {
        console.log('Редактирование профиля:', profileId);
        this.showAlert('Функция редактирования профиля в разработке', 'info');
    }

    deleteProfile(profileId) {
        console.log('Удаление профиля:', profileId);
        this.showAlert('Функция удаления профиля в разработке', 'info');
    }

    /**
     * Просмотр детальной информации о карточке заказа
     * @param {number} cardId - ID карточки заказа
     */
    viewOrderCard(cardId) {
        console.log('=== ПРОСМОТР КАРТОЧКИ ЗАКАЗА ===');
        console.log('ID карточки:', cardId);
        console.log('Доступные заказы:', this.orders);
        
        // Находим заказ по ID
        const order = this.orders.find(o => o.id === cardId);
        console.log('Найденный заказ:', order);
        
        if (!order) {
            console.error('Заказ не найден!');
            this.showAlert('Заказ не найден', 'danger');
            return;
        }
        
        // Создаем модальное окно для просмотра заказа
        this.showOrderDetailsModal(order);
    }

    /**
     * Начать работу с заказом (изменить статус на "В работе")
     * @param {number} cardId - ID карточки заказа
     */
    async startWork(cardId) {
        console.log('=== НАЧАЛО РАБОТЫ С ЗАКАЗОМ ===');
        console.log('ID заказа:', cardId);
        
        try {
            // Обновляем статус заказа на "В работе"
            console.log('Отправляем запрос на обновление статуса...');
            const response = await fetch(`/api/orders/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'in_progress' })
            });

            console.log('Ответ сервера:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('Результат обновления:', result);
                this.showAlert('Заказ переведен в работу!', 'success');
                this.loadOrders(); // Перезагружаем список заказов
                
                // Переходим на страницу работы с заказом
                this.currentWorkOrderId = cardId;
                this.showPage('work');
            } else {
                const error = await response.json();
                console.error('Ошибка обновления статуса:', error);
                this.showAlert(error.error || 'Ошибка обновления статуса', 'danger');
            }
        } catch (error) {
            console.error('Ошибка начала работы:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Отказ клиента от заказа
     * @param {number} cardId - ID карточки заказа
     */
    async declineOrder(cardId) {
        console.log('Отказ клиента от заказа:', cardId);
        
        if (!confirm('Вы уверены, что клиент отказался от заказа?')) {
            return;
        }
        
        try {
            // Обновляем статус заказа на "Отказ"
            const response = await fetch(`/api/orders/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'declined' })
            });

            if (response.ok) {
                this.showAlert('Заказ помечен как отказ клиента', 'warning');
                this.loadOrders(); // Перезагружаем список заказов
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка обновления статуса', 'danger');
            }
        } catch (error) {
            console.error('Ошибка отказа от заказа:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Отменить заказ (удалить в корзину)
     * @param {number} cardId - ID карточки заказа
     */
    async cancelOrder(cardId) {
        console.log('Отменить заказ:', cardId);
        
        if (!confirm('Вы уверены, что хотите отменить этот заказ? Заказ будет перемещен в корзину.')) {
            return;
        }
        
        try {
            // Обновляем статус заказа на "Отменен"
            const response = await fetch(`/api/orders/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (response.ok) {
                this.showAlert('Заказ отменен и перемещен в корзину', 'info');
                this.loadOrders(); // Перезагружаем список заказов
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка отмены заказа', 'danger');
            }
        } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Показ модального окна с детальной информацией о заказе
     * @param {Object} order - Объект заказа
     */
    showOrderDetailsModal(order) {
        // Создаем HTML для модального окна
        const modalHtml = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Детали заказа ${order.order_number}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Информация о клиенте</h6>
                                    <p><strong>Имя:</strong> ${order.client_name}</p>
                                    <p><strong>Телефон:</strong> ${order.client_phone}</p>
                                    <p><strong>Telegram:</strong> ${order.client_telegram || 'Не указан'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Адрес</h6>
                                    <p><strong>Полный адрес:</strong> ${order.address}</p>
                                    <p><strong>Город:</strong> ${order.city || 'Не указан'}</p>
                                    <p><strong>Улица:</strong> ${order.street || 'Не указана'}</p>
                                    <p><strong>Дом:</strong> ${order.house || 'Не указан'}</p>
                                    <p><strong>Подъезд:</strong> ${order.entrance || 'Не указан'}</p>
                                    <p><strong>Квартира:</strong> ${order.apartment || 'Не указана'}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6>Описание проблемы</h6>
                                    <p>${order.problem_description || 'Описание не указано'}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6>Дата выезда</h6>
                                    <p>${order.visit_date ? new Date(order.visit_date).toLocaleString('ru-RU') : 'Не указана'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Исполнитель</h6>
                                    <p>${order.assigned_name || 'Не назначен'}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6>Статус</h6>
                                    <span class="badge bg-${this.getStatusColor(order.status)}">${this.getStatusText(order.status)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                            <button type="button" class="btn btn-success" onclick="app.startWork(${order.id})" data-bs-dismiss="modal">
                                <i class="fas fa-play"></i> В работу
                            </button>
                            <button type="button" class="btn btn-warning" onclick="app.declineOrder(${order.id})" data-bs-dismiss="modal">
                                <i class="fas fa-ban"></i> Отказ
                            </button>
                            <button type="button" class="btn btn-danger" onclick="app.cancelOrder(${order.id})" data-bs-dismiss="modal">
                                <i class="fas fa-times"></i> Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Удаляем существующее модальное окно, если есть
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Добавляем новое модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }

    /**
     * Получение цвета для статуса заказа
     * @param {string} status - Статус заказа
     * @returns {string} CSS класс цвета
     */
    getStatusColor(status) {
        const statusColors = {
            'pending': 'warning',
            'in_progress': 'info',
            'completed': 'success',
            'cancelled': 'danger',
            'declined': 'secondary'
        };
        return statusColors[status] || 'secondary';
    }

    saveBranding() {
        console.log('Сохранение брендинга');
        this.showAlert('Функция сохранения брендинга в разработке', 'info');
    }

    applyFilters() {
        console.log('Применение фильтров');
        this.showAlert('Функция фильтрации в разработке', 'info');
    }

    /**
     * Загрузка данных для работы с заказом
     */
    async loadWorkData() {
        if (!this.currentWorkOrderId) {
            this.showAlert('ID заказа не найден', 'danger');
            this.showPage('orders');
            return;
        }

        try {
            console.log('Загружаем данные заказа для работы:', this.currentWorkOrderId);
            
            // Загружаем информацию о заказе
            const response = await fetch(`/api/orders/${this.currentWorkOrderId}`);
            if (response.ok) {
                const order = await response.json();
                this.populateWorkOrderInfo(order);
            } else {
                this.showAlert('Ошибка загрузки данных заказа', 'danger');
                this.showPage('orders');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных заказа:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
            this.showPage('orders');
        }
    }

    /**
     * Заполнение информации о заказе на странице работы
     * @param {Object} order - Данные заказа
     */
    populateWorkOrderInfo(order) {
        document.getElementById('workOrderNumber').textContent = order.order_number;
        document.getElementById('workOrderStatus').textContent = this.getStatusText(order.status);
        document.getElementById('workClientName').textContent = order.client_name || 'Не указано';
        document.getElementById('workClientPhone').textContent = order.client_phone || 'Не указано';
        document.getElementById('workClientTelegram').textContent = order.client_telegram || 'Не указано';
        
        // Формируем адрес
        const address = [
            order.city,
            order.street,
            order.house,
            order.entrance ? `подъезд ${order.entrance}` : '',
            order.floor ? `этаж ${order.floor}` : '',
            order.apartment ? `кв. ${order.apartment}` : ''
        ].filter(Boolean).join(', ');
        document.getElementById('workAddress').textContent = address || 'Не указано';
        
        document.getElementById('workCreatedAt').textContent = new Date(order.created_at).toLocaleString('ru-RU');
        document.getElementById('workDescription').textContent = order.description || 'Не указано';
    }

    /**
     * Загрузка отказов клиентов
     */
    async loadDeclinedOrders() {
        try {
            console.log('Загружаем отказы клиентов...');
            const response = await fetch('/api/orders?status=declined');
            
            if (response.ok) {
                const orders = await response.json();
                console.log('Получены отказы:', orders);
                this.renderDeclinedOrders(orders);
            } else {
                console.error('Ошибка загрузки отказов:', response.status);
                this.showAlert('Ошибка загрузки отказов', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки отказов:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Загрузка отмененных заказов
     */
    async loadCancelledOrders() {
        try {
            console.log('Загружаем отмененные заказы...');
            const response = await fetch('/api/orders?status=cancelled');
            
            if (response.ok) {
                const orders = await response.json();
                console.log('Получены отмененные заказы:', orders);
                this.renderCancelledOrders(orders);
            } else {
                console.error('Ошибка загрузки отмененных заказов:', response.status);
                this.showAlert('Ошибка загрузки отмененных заказов', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки отмененных заказов:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Отображение отказов клиентов
     * @param {Array} orders - Массив отказов
     */
    renderDeclinedOrders(orders) {
        const container = document.getElementById('declinedOrdersList');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Отказов клиентов не найдено</p>';
            return;
        }

        let html = '<div class="row">';
        orders.forEach(order => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card border-warning">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${order.order_number}</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="${order.id}" onchange="toggleRestoreButton()">
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="card-text"><strong>Клиент:</strong> ${order.client_name || 'Не указано'}</p>
                            <p class="card-text"><strong>Телефон:</strong> ${order.client_phone || 'Не указано'}</p>
                            <p class="card-text"><strong>Дата отказа:</strong> ${new Date(order.updated_at).toLocaleString('ru-RU')}</p>
                            <p class="card-text"><strong>Описание:</strong> ${order.description || 'Не указано'}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    /**
     * Отображение отмененных заказов
     * @param {Array} orders - Массив отмененных заказов
     */
    renderCancelledOrders(orders) {
        const container = document.getElementById('cancelledOrdersList');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Отмененных заказов не найдено</p>';
            return;
        }

        let html = '<div class="row">';
        orders.forEach(order => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card border-secondary">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${order.order_number}</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="${order.id}" onchange="toggleRestoreCancelledButton()">
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="card-text"><strong>Клиент:</strong> ${order.client_name || 'Не указано'}</p>
                            <p class="card-text"><strong>Телефон:</strong> ${order.client_phone || 'Не указано'}</p>
                            <p class="card-text"><strong>Дата отмены:</strong> ${new Date(order.updated_at).toLocaleString('ru-RU')}</p>
                            <p class="card-text"><strong>Описание:</strong> ${order.description || 'Не указано'}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    /**
     * Загрузка данных профиля пользователя
     */
    async loadProfileData() {
        try {
            console.log('Загружаем данные профиля...');
            const response = await fetch('/api/user/profile');
            
            if (response.ok) {
                const profile = await response.json();
                console.log('Данные профиля:', profile);
                this.populateProfileForm(profile);
            } else {
                console.error('Ошибка загрузки профиля:', response.status);
                this.showAlert('Ошибка загрузки профиля', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Заполнение формы профиля данными
     * @param {Object} profile - Данные профиля пользователя
     */
    populateProfileForm(profile) {
        document.getElementById('profileUsername').value = profile.username || '';
        document.getElementById('profileRole').value = this.getRoleText(profile.role) || '';
        document.getElementById('profileFullName').value = profile.full_name || '';
        document.getElementById('profilePhone1').value = profile.phone1 || '';
        document.getElementById('profilePhone2').value = profile.phone2 || '';
        document.getElementById('profilePhone3').value = profile.phone3 || '';
        document.getElementById('profileTelegram').value = profile.telegram || '';
        document.getElementById('profileWhatsapp').value = profile.whatsapp || '';
        document.getElementById('profileVk').value = profile.vk || '';
        document.getElementById('profileMax').value = profile.max || '';
        document.getElementById('profileOtherInfo').value = profile.other_info || '';
    }

    /**
     * Сохранение профиля пользователя
     */
    async saveUserProfile() {
        try {
            console.log('Сохранение профиля пользователя...');
            
            const formData = {
                full_name: document.getElementById('profileFullName').value,
                phone1: document.getElementById('profilePhone1').value,
                phone2: document.getElementById('profilePhone2').value,
                phone3: document.getElementById('profilePhone3').value,
                telegram: document.getElementById('profileTelegram').value,
                whatsapp: document.getElementById('profileWhatsapp').value,
                vk: document.getElementById('profileVk').value,
                max: document.getElementById('profileMax').value,
                other_info: document.getElementById('profileOtherInfo').value
            };

            // Проверяем обязательные поля
            if (!formData.full_name || !formData.phone1) {
                this.showAlert('Заполните обязательные поля: полное имя и телефон 1', 'warning');
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Профиль сохранен:', result);
                this.showAlert('Профиль успешно сохранен!', 'success');
            } else {
                const error = await response.json();
                console.error('Ошибка сохранения профиля:', error);
                this.showAlert(error.error || 'Ошибка сохранения профиля', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Смена пароля пользователя
     */
    async changePassword() {
        try {
            console.log('Смена пароля...');
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Проверяем обязательные поля
            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showAlert('Заполните все поля', 'warning');
                return;
            }

            // Проверяем совпадение паролей
            if (newPassword !== confirmPassword) {
                this.showAlert('Новые пароли не совпадают', 'warning');
                return;
            }

            // Проверяем длину пароля
            if (newPassword.length < 6) {
                this.showAlert('Пароль должен содержать минимум 6 символов', 'warning');
                return;
            }

            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Пароль изменен:', result);
                this.showAlert('Пароль успешно изменен!', 'success');
                document.getElementById('passwordForm').reset(); // Очищаем форму
            } else {
                const error = await response.json();
                console.error('Ошибка смены пароля:', error);
                this.showAlert(error.error || 'Ошибка смены пароля', 'danger');
            }
        } catch (error) {
            console.error('Ошибка смены пароля:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    // Save service
    async saveService() {
        const formData = {
            name: document.getElementById('serviceName').value,
            category: document.getElementById('serviceCategory').value,
            unit_type: document.getElementById('serviceUnitType').value,
            base_price: parseFloat(document.getElementById('serviceBasePrice').value),
            calculation_type: document.getElementById('serviceCalculationType').value,
            formula: document.getElementById('serviceFormula').value
        };

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showAlert('Услуга успешно создана!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('newServiceModal')).hide();
                document.getElementById('newServiceForm').reset();
                this.loadServices();
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка создания услуги', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения услуги:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    // Save profile
    async saveProfile() {
        const formData = {
            profile_type: document.getElementById('profileType').value,
            system_type: document.getElementById('profileSystemType').value,
            sash_type: document.getElementById('profileSashType').value,
            complexity_coefficient: parseFloat(document.getElementById('profileComplexityCoefficient').value)
        };

        try {
            const response = await fetch('/api/service-profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showAlert('Профиль успешно создан!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('newProfileModal')).hide();
                document.getElementById('newProfileForm').reset();
                this.loadServiceProfiles();
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка создания профиля', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }
}

// Инициализация приложения после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализируем приложение...');
    window.app = new WindowRepairApp();
    console.log('Приложение инициализировано:', window.app);
});

// Глобальные функции для работы с заказом
/**
 * Добавление нового замера
 */
function addMeasurement() {
    console.log('Добавление нового замера');
    window.app.showAlert('Функция добавления замеров в разработке', 'info');
}

/**
 * Переключение кнопки восстановления отказов
 */
function toggleRestoreButton() {
    const checkboxes = document.querySelectorAll('#declinedOrdersList input[type="checkbox"]:checked');
    const restoreBtn = document.getElementById('restoreBtn');
    restoreBtn.disabled = checkboxes.length === 0;
}

/**
 * Переключение кнопки восстановления отмененных заказов
 */
function toggleRestoreCancelledButton() {
    const checkboxes = document.querySelectorAll('#cancelledOrdersList input[type="checkbox"]:checked');
    const restoreBtn = document.getElementById('restoreCancelledBtn');
    restoreBtn.disabled = checkboxes.length === 0;
}

/**
 * Восстановление отказанного заказа
 */
async function restoreDeclinedOrder() {
    const checkboxes = document.querySelectorAll('#declinedOrdersList input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        window.app.showAlert('Выберите заказы для восстановления', 'warning');
        return;
    }

    const orderIds = Array.from(checkboxes).map(cb => cb.value);
    
    try {
        for (const orderId of orderIds) {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'pending' })
            });

            if (!response.ok) {
                throw new Error(`Ошибка восстановления заказа ${orderId}`);
            }
        }

        window.app.showAlert('Заказы успешно восстановлены!', 'success');
        window.app.loadDeclinedOrders(); // Перезагружаем список
    } catch (error) {
        console.error('Ошибка восстановления заказов:', error);
        window.app.showAlert('Ошибка восстановления заказов', 'danger');
    }
}

/**
 * Восстановление отмененного заказа
 */
async function restoreCancelledOrder() {
    const checkboxes = document.querySelectorAll('#cancelledOrdersList input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        window.app.showAlert('Выберите заказы для восстановления', 'warning');
        return;
    }

    const orderIds = Array.from(checkboxes).map(cb => cb.value);
    
    try {
        for (const orderId of orderIds) {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'pending' })
            });

            if (!response.ok) {
                throw new Error(`Ошибка восстановления заказа ${orderId}`);
            }
        }

        window.app.showAlert('Заказы успешно восстановлены!', 'success');
        window.app.loadCancelledOrders(); // Перезагружаем список
    } catch (error) {
        console.error('Ошибка восстановления заказов:', error);
        window.app.showAlert('Ошибка восстановления заказов', 'danger');
    }
}

/**
 * Применение фильтров для отказов
 */
function applyDeclinedFilters() {
    window.app.showAlert('Функция фильтрации отказов в разработке', 'info');
}

/**
 * Применение фильтров для отмененных заказов
 */
function applyCancelledFilters() {
    window.app.showAlert('Функция фильтрации отмененных заказов в разработке', 'info');
}

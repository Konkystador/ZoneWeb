// Основной JavaScript файл приложения
class WindowRepairApp {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.estimates = [];
        this.users = [];
        this.settings = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Форма входа
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Кнопка выхода
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Навигация
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Сохранение заказа
        document.getElementById('saveOrderBtn').addEventListener('click', () => {
            this.saveOrder();
        });

        // Сохранение пользователя
        document.getElementById('saveUserBtn').addEventListener('click', () => {
            this.saveUser();
        });

        // Сохранение настроек
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.showMainApp();
                this.loadDashboardData();
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            this.showLoginScreen();
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.showMainApp();
                this.loadDashboardData();
                errorDiv.style.display = 'none';
            } else {
                errorDiv.textContent = data.error || 'Ошибка входа';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
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

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Обновляем имя пользователя
        document.getElementById('userName').textContent = this.currentUser.username;
        
        // Показываем/скрываем меню админа
        const adminMenu = document.getElementById('adminMenu');
        if (this.currentUser.role === 'admin') {
            adminMenu.style.display = 'block';
        } else {
            adminMenu.style.display = 'none';
        }
    }

    showPage(pageName) {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // Показываем выбранную страницу
        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Обновляем активную ссылку в навигации
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Загружаем данные для страницы
        switch (pageName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'estimates':
                this.loadEstimates();
                break;
            case 'admin':
                this.loadAdminData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [ordersResponse, estimatesResponse] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/estimates')
            ]);

            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                this.orders = orders;
                
                // Подсчитываем статистику
                const newOrders = orders.filter(order => order.status === 'pending').length;
                const inProgress = orders.filter(order => order.status === 'in_progress').length;
                const completed = orders.filter(order => order.status === 'completed').length;
                
                document.getElementById('newOrdersCount').textContent = newOrders;
                document.getElementById('inProgressCount').textContent = inProgress;
                document.getElementById('completedCount').textContent = completed;
            }

            if (estimatesResponse.ok) {
                const estimates = await estimatesResponse.json();
                this.estimates = estimates;
                document.getElementById('estimatesCount').textContent = estimates.length;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const orders = await response.json();
                this.orders = orders;
                this.renderOrdersTable(orders);
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
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

    async saveOrder() {
        const formData = {
            client_name: document.getElementById('clientName').value,
            client_phone: document.getElementById('clientPhone').value,
            client_telegram: document.getElementById('clientTelegram').value,
            address: `${document.getElementById('city').value}, ${document.getElementById('street').value}, ${document.getElementById('house').value}`,
            city: document.getElementById('city').value,
            street: document.getElementById('street').value,
            house: document.getElementById('house').value,
            entrance: document.getElementById('entrance').value,
            floor: document.getElementById('floor').value,
            apartment: document.getElementById('apartment').value,
            intercom: document.getElementById('intercom').value,
            problem_description: document.getElementById('problemDescription').value,
            visit_date: document.getElementById('visitDate').value,
            assigned_to: document.getElementById('assignedTo').value || null
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                this.showAlert('Заказ успешно создан!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('newOrderModal')).hide();
                document.getElementById('newOrderForm').reset();
                this.loadOrders();
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка создания заказа', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения заказа:', error);
            this.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    async saveUser() {
        const formData = {
            username: document.getElementById('newUsername').value,
            password: document.getElementById('newPassword').value,
            full_name: document.getElementById('newFullName').value,
            role: document.getElementById('newUserRole').value
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showAlert('Пользователь успешно создан!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('newUserModal')).hide();
                document.getElementById('newUserForm').reset();
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Ошибка создания пользователя', 'danger');
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

    showAlert(message, type = 'info') {
        // Создаем уведомление
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
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

    editUser(userId) {
        console.log('Редактирование пользователя:', userId);
        this.showAlert('Функция редактирования пользователя в разработке', 'info');
    }

    deleteUser(userId) {
        console.log('Удаление пользователя:', userId);
        this.showAlert('Функция удаления пользователя в разработке', 'info');
    }
}

// Инициализация приложения
const app = new WindowRepairApp();

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

        // Сохранение услуги
        document.getElementById('saveServiceBtn').addEventListener('click', () => {
            this.saveService();
        });

        // Сохранение профиля
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            this.saveProfile();
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

        console.log('Попытка входа:', { username, password });

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Ответ сервера:', response.status, response.statusText);

            const data = await response.json();
            console.log('Данные ответа:', data);

            if (response.ok) {
                this.currentUser = data.user;
                console.log('Пользователь авторизован:', this.currentUser);
                this.showMainApp();
                this.loadDashboardData();
                errorDiv.style.display = 'none';
            } else {
                console.error('Ошибка авторизации:', data);
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

    renderOrderCards(cards) {
        const container = document.getElementById('orderCardsContainer');
        container.innerHTML = '';

        cards.forEach(card => {
            const cardHtml = this.createOrderCardHtml(card);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    createOrderCardHtml(card) {
        const statusColors = {
            'pending': 'warning',
            'in_progress': 'info',
            'completed': 'success',
            'cancelled': 'danger'
        };

        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${card.order_number}</h6>
                        <span class="badge bg-${statusColors[card.status] || 'secondary'}">${this.getStatusText(card.status)}</span>
                    </div>
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
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.viewOrderCard(${card.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="app.startWork(${card.id})">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.cancelOrder(${card.id})">
                                <i class="fas fa-times"></i>
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

    viewOrderCard(cardId) {
        console.log('Просмотр карточки заказа:', cardId);
        this.showAlert('Функция просмотра карточки в разработке', 'info');
    }

    startWork(cardId) {
        console.log('Начать работу с карточкой:', cardId);
        this.showAlert('Функция начала работы в разработке', 'info');
    }

    cancelOrder(cardId) {
        console.log('Отменить заказ:', cardId);
        this.showAlert('Функция отмены заказа в разработке', 'info');
    }

    saveBranding() {
        console.log('Сохранение брендинга');
        this.showAlert('Функция сохранения брендинга в разработке', 'info');
    }

    applyFilters() {
        console.log('Применение фильтров');
        this.showAlert('Функция фильтрации в разработке', 'info');
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

// Инициализация приложения
const app = new WindowRepairApp();

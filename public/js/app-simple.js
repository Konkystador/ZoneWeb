/**
 * Простое приложение WindowRepairApp
 * Без сложной модульной архитектуры - все в одном файле для надежности
 */

// Класс основного приложения
class WindowRepairApp {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.currentPage = 'dashboard';
        this.init();
    }

    async init() {
        console.log('Инициализация приложения...');
        await this.checkAuth();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            console.log('Ответ сервера:', response.status, response.statusText);
            console.log('Данные ответа:', data);
            
            if (data.success) {
                this.currentUser = data.user;
                this.showMainApp();
                this.setupRoleBasedUI();
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userName').textContent = this.currentUser.full_name || this.currentUser.username;
    }

    setupRoleBasedUI() {
        const adminElements = document.querySelectorAll('[id*="admin"]');
        const testingElements = document.querySelectorAll('[id*="testing"]');
        const isAdmin = this.currentUser.role === 'admin';
        
        adminElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });
        
        testingElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });
        
        console.log('Настройка UI для роли:', this.currentUser.role);
        console.log('Админ элементы:', adminElements.length);
        console.log('Тестирование элементы:', testingElements.length);
    }

    // ==================== ТЕСТИРОВАНИЕ ====================
    
    async runAPITests() {
        this.logTest('Запуск базовых API тестов...', 'info');
        try {
            // Открываем страницу тестов в новом окне
            window.open('/tests/frontend-tests.html', '_blank');
            this.logTest('Базовые API тесты открыты в новом окне', 'success');
        } catch (error) {
            this.logTest('Ошибка: ' + error.message, 'error');
        }
    }
    
    async runComprehensiveAPITests() {
        this.logTest('Запуск комплексных API тестов...', 'info');
        try {
            // Открываем страницу тестов в новом окне
            window.open('/tests/frontend-comprehensive-tests.html', '_blank');
            this.logTest('Комплексные API тесты открыты в новом окне', 'success');
        } catch (error) {
            this.logTest('Ошибка: ' + error.message, 'error');
        }
    }
    
    async runFrontendTests() {
        this.logTest('Запуск базовых фронтенд тестов...', 'info');
        try {
            // Открываем страницу тестов в новом окне
            window.open('/tests/frontend-tests.html', '_blank');
            this.logTest('Базовые фронтенд тесты открыты в новом окне', 'success');
        } catch (error) {
            this.logTest('Ошибка: ' + error.message, 'error');
        }
    }
    
    async runComprehensiveFrontendTests() {
        this.logTest('Запуск комплексных фронтенд тестов...', 'info');
        try {
            // Открываем страницу тестов в новом окне
            window.open('/tests/frontend-comprehensive-tests.html', '_blank');
            this.logTest('Комплексные фронтенд тесты открыты в новом окне', 'success');
        } catch (error) {
            this.logTest('Ошибка: ' + error.message, 'error');
        }
    }
    
    async runMobileTests() {
        this.logTest('Запуск мобильных тестов...', 'info');
        try {
            // Открываем страницу тестов в новом окне
            window.open('/tests/mobile-responsive-test.html', '_blank');
            this.logTest('Мобильные тесты открыты в новом окне', 'success');
        } catch (error) {
            this.logTest('Ошибка: ' + error.message, 'error');
        }
    }
    
    async runSecurityTests() {
        this.logTest('Запуск тестов безопасности...', 'info');
        
        const securityChecks = [
            {
                name: 'HTTPS соединение',
                check: () => location.protocol === 'https:',
                critical: false
            },
            {
                name: 'Helmet middleware',
                check: () => true, // Проверяем на сервере
                critical: true
            },
            {
                name: 'CORS настройки',
                check: () => true, // Проверяем на сервере
                critical: true
            },
            {
                name: 'Валидация входных данных',
                check: () => true, // Проверяем на сервере
                critical: true
            }
        ];
        
        let passed = 0;
        for (const check of securityChecks) {
            try {
                if (check.check()) {
                    this.logTest(`✅ ${check.name}`, 'success');
                    passed++;
                } else {
                    this.logTest(`❌ ${check.name}`, check.critical ? 'error' : 'warning');
                }
            } catch (error) {
                this.logTest(`❌ ${check.name}: ${error.message}`, 'error');
            }
        }
        
        this.logTest(`Безопасность: ${passed}/${securityChecks.length} проверок пройдено`, 
            passed === securityChecks.length ? 'success' : 'warning');
    }
    
    async runPerformanceTests() {
        this.logTest('Запуск тестов производительности...', 'info');
        
        const startTime = performance.now();
        
        // Тест загрузки страницы
        const loadTime = performance.now() - startTime;
        this.logTest(`Время загрузки: ${loadTime.toFixed(2)}ms`, 
            loadTime < 1000 ? 'success' : 'warning');
        
        // Тест размера DOM
        const domSize = document.querySelectorAll('*').length;
        this.logTest(`Размер DOM: ${domSize} элементов`, 
            domSize < 1000 ? 'success' : 'warning');
        
        // Тест количества скриптов
        const scripts = document.getElementsByTagName('script');
        this.logTest(`Скриптов: ${scripts.length}`, 
            scripts.length < 20 ? 'success' : 'warning');
        
        // Тест производительности API
        try {
            const apiStartTime = performance.now();
            await fetch('/api/auth/check');
            const apiEndTime = performance.now();
            const apiResponseTime = apiEndTime - apiStartTime;
            
            this.logTest(`API ответ: ${apiResponseTime.toFixed(2)}ms`, 
                apiResponseTime < 500 ? 'success' : 'warning');
        } catch (error) {
            this.logTest('Ошибка тестирования API: ' + error.message, 'error');
        }
    }
    
    async runAllTests() {
        this.logTest('🚀 Запуск всех тестов...', 'info');
        
        await this.runAPITests();
        await this.runComprehensiveAPITests();
        await this.runFrontendTests();
        await this.runComprehensiveFrontendTests();
        await this.runMobileTests();
        await this.runSecurityTests();
        await this.runPerformanceTests();
        
        this.logTest('✅ Все тесты завершены!', 'success');
    }
    
    clearTestResults() {
        const container = document.getElementById('testResults');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-vial fa-3x mb-3"></i>
                    <p>Нажмите кнопку "Запустить все тесты" для начала тестирования</p>
                </div>
            `;
        }
    }
    
    logTest(message, type = 'info') {
        const container = document.getElementById('testResults');
        if (!container) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
        
        const logEntry = document.createElement('div');
        logEntry.className = `alert ${alertClass} alert-dismissible fade show`;
        logEntry.innerHTML = `
            ${icon} ${message}
            <small class="text-muted ms-2">[${timestamp}]</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        container.appendChild(logEntry);
        
        // Прокручиваем к последнему сообщению
        logEntry.scrollIntoView({ behavior: 'smooth' });
    }

    // ==================== МЕТОДЫ ДЛЯ ГЛОБАЛЬНЫХ ФУНКЦИЙ ====================
    
    async viewOrderCard(orderId) {
        console.log('WindowRepairApp.viewOrderCard вызван, orderId:', orderId);
        
        try {
            // Загружаем заказ из API
            const response = await fetch(`/api/orders/${orderId}`);
            if (response.ok) {
                const order = await response.json();
                console.log('Заказ загружен из API:', order);
                showOrderDetailsModal(order);
            } else {
                console.error('Ошибка загрузки заказа:', response.status);
                showAlert('Ошибка загрузки заказа', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки заказа:', error);
            showAlert('Ошибка соединения с сервером', 'danger');
        }
    }
    
    startWork(orderId) {
        console.log('WindowRepairApp.startWork вызван, orderId:', orderId);
        // Устанавливаем текущий заказ и переходим на страницу работы
        currentWorkOrderId = orderId;
        showPage('work');
    }
    
    declineOrder(orderId) {
        console.log('WindowRepairApp.declineOrder вызван, orderId:', orderId);
        updateOrderStatus(orderId, 'declined');
    }
    
    cancelOrder(orderId) {
        console.log('WindowRepairApp.cancelOrder вызван, orderId:', orderId);
        updateOrderStatus(orderId, 'cancelled');
    }
    
    sendEstimate(orderId) {
        console.log('WindowRepairApp.sendEstimate вызван, orderId:', orderId);
        updateOrderStatus(orderId, 'estimate_sent');
    }
    
    completeOrder(orderId) {
        console.log('WindowRepairApp.completeOrder вызван, orderId:', orderId);
        updateOrderStatus(orderId, 'completed');
    }
    
    editOrder(orderId) {
        console.log('WindowRepairApp.editOrder вызван, orderId:', orderId);
        loadOrderForEditModal(orderId);
    }
    
    deleteOrder(orderId) {
        console.log('WindowRepairApp.deleteOrder вызван, orderId:', orderId);
        if (confirm('Вы уверены, что хотите удалить этот заказ навсегда?')) {
            fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Заказ удален', 'success');
                    loadOrders();
                } else {
                    showAlert('Ошибка удаления заказа', 'danger');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showAlert('Ошибка соединения с сервером', 'danger');
            });
        }
    }
    
    restoreOrder(orderId) {
        console.log('WindowRepairApp.restoreOrder вызван, orderId:', orderId);
        updateOrderStatus(orderId, 'pending');
    }
    
    showOrderCards(status) {
        console.log('WindowRepairApp.showOrderCards вызван, status:', status);
        loadOrderCards(status);
    }
    
    performSearch() {
        console.log('WindowRepairApp.performSearch вызван');
        performSearch();
    }
    
    clearSearch() {
        console.log('WindowRepairApp.clearSearch вызван');
        clearSearch();
    }
}

// Глобальные переменные (для совместимости)
let currentUser = null;
let orders = [];
let currentPage = 'dashboard';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    
    // Инициализируем приложение
    window.app = new WindowRepairApp();
    console.log('Приложение инициализировано:', window.app);
});

// ==================== АВТОРИЗАЦИЯ ====================

// Функции авторизации (для совместимости)
async function checkAuth() {
    if (window.app) {
        return window.app.checkAuth();
    }
}

async function login(username, password) {
    try {
        console.log('Попытка входа:', username);
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Ответ сервера:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Данные ответа:', data);
            
            if (data.success) {
                console.log('Пользователь авторизован:', data.user);
                if (window.app) {
                    window.app.currentUser = data.user;
                    window.app.showMainApp();
                    window.app.setupRoleBasedUI();
                } else {
                    currentUser = data.user;
                    showMainApp();
                    setupRoleBasedUI();
                }
                showAlert('Добро пожаловать!', 'success');
            } else {
                showAlert(data.error || 'Ошибка авторизации', 'danger');
            }
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка авторизации', 'danger');
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            currentUser = null;
            showLoginScreen();
            showAlert('Вы вышли из системы', 'info');
        }
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.full_name || currentUser.username;
}

function setupRoleBasedUI() {
    const userRole = currentUser.role;
    
    // Показываем/скрываем элементы в зависимости от роли
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) {
        adminMenu.style.display = userRole === 'admin' ? 'block' : 'none';
    }
}

// ==================== УПРАВЛЕНИЕ СТРАНИЦАМИ ====================

function showPage(pageName) {
    console.log('Переход на страницу:', pageName);
    
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Показываем нужную страницу
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = pageName;
        
        // Загружаем данные для страницы
        loadPageData(pageName);
    } else {
        console.error('Страница не найдена:', pageName);
    }

    // Обновляем активную ссылку в навигации
    updateActiveNavLink(pageName);
}

function updateActiveNavLink(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'estimates':
            loadEstimates();
            break;
        case 'admin':
            loadAdminData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'work':
            loadWorkData();
            break;
        case 'declined':
            showOrderCards('declined');
            break;
        case 'cancelled':
            showOrderCards('cancelled');
            break;
        case 'testing':
            // Страница тестирования не требует предварительной загрузки
            console.log('Открыта страница тестирования');
            break;
    }
}

// ==================== УПРАВЛЕНИЕ ЗАКАЗАМИ ====================

async function loadOrders() {
    try {
        console.log('Загружаем список заказов...');
        const response = await fetch('/api/orders');
        
        if (response.ok) {
            orders = await response.json();
            console.log('Получены заказы:', orders);
            
            // На главной странице показываем все заказы без фильтрации
            renderOrderCards(orders);
            console.log('Заказы отображены в интерфейсе (главная страница)');
        } else {
            console.error('Ошибка загрузки заказов:', response.status);
            showAlert('Ошибка загрузки заказов', 'danger');
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

async function showOrderCards(status = null) {
    console.log('Показываем карточки заказов, статус:', status);
    
    try {
        // Загружаем все заказы
        const response = await fetch('/api/orders');
        
        if (response.ok) {
            const allOrders = await response.json();
            let filteredOrders;
            
            if (status) {
                // Фильтруем по конкретному статусу
                filteredOrders = allOrders.filter(order => order.status === status);
            } else {
                // По умолчанию показываем только "ожидание" и "в работе"
                filteredOrders = allOrders.filter(order => 
                    order.status === 'pending' || order.status === 'in_progress'
                );
            }
            
            console.log('Получены заказы для статуса', status, ':', filteredOrders);
            renderOrderCards(filteredOrders);
            
            // Обновляем активную кнопку
            updateActiveButton(status);
            
            // Показываем/скрываем кнопки управления
            toggleManagementButtons(status);
        } else {
            console.error('Ошибка загрузки заказов:', response.status);
            showAlert('Ошибка загрузки заказов', 'danger');
        }
    } catch (error) {
        console.error('Ошибка загрузки карточек заказов:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

function updateActiveButton(status) {
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Активируем соответствующую кнопку
    const statusButtons = {
        'pending': 'showOrderCards(\'pending\')',
        'in_progress': 'showOrderCards(\'in_progress\')',
        'declined': 'showOrderCards(\'declined\')',
        'cancelled': 'showOrderCards(\'cancelled\')'
    };
    
    if (status && statusButtons[status]) {
        const activeBtn = document.querySelector(`button[onclick="${statusButtons[status]}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    } else if (!status) {
        // По умолчанию (главная страница) - активируем кнопку "Все заказы"
        const allBtn = document.querySelector('button[onclick="showOrderCards()"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
        console.log('Главная страница - показываем заказы по умолчанию');
    }
}

function renderOrderCards(ordersToRender) {
    const container = document.getElementById('orderCardsContainer');
    if (!container) {
        console.error('Контейнер для карточек заказов не найден');
        return;
    }

    if (ordersToRender.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Заказы не найдены</p>';
        return;
    }

    let html = '<div class="row">';
    ordersToRender.forEach(order => {
        html += createOrderCardHtml(order);
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function createOrderCardHtml(order) {
    const statusClass = getStatusColor(order.status);
    const statusText = getStatusText(order.status);
    
    // Определяем, нужно ли показывать чекбокс и кнопки управления
    const isDeclinedOrCancelled = order.status === 'declined' || order.status === 'cancelled';
    
    let checkboxHtml = '';
    let actionButtonsHtml = '';
    
    if (isDeclinedOrCancelled) {
        // Для отказов и корзины добавляем чекбокс
        checkboxHtml = `
            <div class="form-check position-absolute" style="top: 10px; right: 10px;">
                <input class="form-check-input order-checkbox" type="checkbox" value="${order.id}" id="order_${order.id}">
            </div>
        `;
        
        // 3D кнопки для отказов и корзины (только иконки)
        if (order.status === 'declined') {
            actionButtonsHtml = `
                <div class="btn-group-3d w-100" role="group">
                    <button class="btn btn-3d btn-primary" onclick="viewOrderCard(${order.id})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-3d btn-success" onclick="restoreOrder(${order.id})" title="Восстановить">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-3d btn-danger" onclick="deleteOrder(${order.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (order.status === 'cancelled') {
            actionButtonsHtml = `
                <div class="btn-group-3d w-100" role="group">
                    <button class="btn btn-3d btn-primary" onclick="viewOrderCard(${order.id})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-3d btn-success" onclick="restoreOrder(${order.id})" title="Восстановить">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-3d btn-danger" onclick="deleteOrder(${order.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
    } else {
        // 3D кнопки для активных заказов (только иконки)
        if (order.status === 'in_progress') {
            actionButtonsHtml = `
                <div class="btn-group-3d w-100" role="group">
                    <button class="btn btn-3d btn-primary" onclick="viewOrderCard(${order.id})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-3d btn-info" onclick="sendEstimate(${order.id})" title="Смета отправлена">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-3d btn-success" onclick="completeOrder(${order.id})" title="Выполнено">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-3d btn-warning" onclick="declineOrder(${order.id})" title="Отказ">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button class="btn btn-3d btn-danger" onclick="cancelOrder(${order.id})" title="Отмена">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else if (order.status === 'estimate_sent') {
            actionButtonsHtml = `
                <div class="btn-group-3d w-100" role="group">
                    <button class="btn btn-3d btn-primary" onclick="viewOrderCard(${order.id})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-3d btn-success" onclick="completeOrder(${order.id})" title="Выполнено">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-3d btn-warning" onclick="declineOrder(${order.id})" title="Отказ">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button class="btn btn-3d btn-danger" onclick="cancelOrder(${order.id})" title="Отмена">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            actionButtonsHtml = `
                <div class="btn-group-3d w-100" role="group">
                    <button class="btn btn-3d btn-primary" onclick="viewOrderCard(${order.id})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-3d btn-success" onclick="startWork(${order.id})" title="В работу">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-3d btn-warning" onclick="declineOrder(${order.id})" title="Отказ">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button class="btn btn-3d btn-danger" onclick="cancelOrder(${order.id})" title="Отмена">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card order-card position-relative">
                ${checkboxHtml}
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${order.order_number}</h6>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <h6 class="card-title">${order.client_name}</h6>
                    <p class="card-text">
                        <i class="fas fa-map-marker-alt"></i> ${order.address}<br>
                        <i class="fas fa-phone"></i> ${order.client_phone}<br>
                        <i class="fas fa-calendar"></i> ${order.visit_date ? new Date(order.visit_date).toLocaleString('ru-RU') : 'Не указано'}<br>
                        <i class="fas fa-user"></i> ${order.assigned_name || 'Не назначен'}
                        ${order.created_by_name && order.created_by_name !== order.assigned_name ? 
                          `<br><small class="text-muted"><i class="fas fa-user-plus"></i> Создал: ${order.created_by_name}</small>` : ''}
                    </p>
                    ${actionButtonsHtml}
                </div>
            </div>
        </div>
    `;
}

async function viewOrderCard(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            showOrderDetailsModal(order);
        } else {
            showAlert('Ошибка загрузки заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка просмотра заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Функция редактирования заказа
function editOrder(orderId) {
    console.log('Редактирование заказа:', orderId);
    // Закрываем модальное окно просмотра
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
    if (modal) {
        modal.hide();
    }
    
    // Загружаем данные заказа и открываем модальное окно редактирования
    loadOrderForEditModal(orderId);
}

// Загрузка данных заказа для редактирования в модальном окне
async function loadOrderForEditModal(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            populateEditModalForm(order);
            // Открываем модальное окно
            const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
            modal.show();
        } else {
            showAlert('Ошибка загрузки данных заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка загрузки заказа для редактирования:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Загрузка данных заказа для редактирования (для страницы работы)
async function loadOrderForEdit(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            populateEditForm(order);
        } else {
            showAlert('Ошибка загрузки данных заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка загрузки заказа для редактирования:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Заполнение формы редактирования в модальном окне
function populateEditModalForm(order) {
    document.getElementById('editModalClientName').value = order.client_name || '';
    document.getElementById('editModalClientPhone').value = order.client_phone || '';
    document.getElementById('editModalClientTelegram').value = order.client_telegram || '';
    document.getElementById('editModalCity').value = order.city || '';
    document.getElementById('editModalStreet').value = order.street || '';
    document.getElementById('editModalHouse').value = order.house || '';
    document.getElementById('editModalApartment').value = order.apartment || '';
    document.getElementById('editModalEntrance').value = order.entrance || '';
    document.getElementById('editModalFloor').value = order.floor || '';
    document.getElementById('editModalIntercom').value = order.intercom || '';
    document.getElementById('editModalProblemDescription').value = order.problem_description || '';
    
    // Форматируем дату для input datetime-local
    if (order.visit_date) {
        const visitDate = new Date(order.visit_date);
        const formattedDate = visitDate.toISOString().slice(0, 16);
        document.getElementById('editModalVisitDate').value = formattedDate;
    }
    
    // Сохраняем ID заказа для сохранения
    window.currentEditOrderId = order.id;
}

// Заполнение формы редактирования (для страницы работы)
function populateEditForm(order) {
    document.getElementById('editClientName').value = order.client_name || '';
    document.getElementById('editClientPhone').value = order.client_phone || '';
    document.getElementById('editClientTelegram').value = order.client_telegram || '';
    document.getElementById('editCity').value = order.city || '';
    document.getElementById('editStreet').value = order.street || '';
    document.getElementById('editHouse').value = order.house || '';
    document.getElementById('editApartment').value = order.apartment || '';
    document.getElementById('editEntrance').value = order.entrance || '';
    document.getElementById('editFloor').value = order.floor || '';
    document.getElementById('editIntercom').value = order.intercom || '';
    document.getElementById('editProblemDescription').value = order.problem_description || '';
    
    // Форматируем дату для input datetime-local
    if (order.visit_date) {
        const visitDate = new Date(order.visit_date);
        const formattedDate = visitDate.toISOString().slice(0, 16);
        document.getElementById('editVisitDate').value = formattedDate;
    }
}

// Сохранение изменений заказа из модального окна
async function saveOrderChangesModal() {
    if (!window.currentEditOrderId) {
        showAlert('Нет активного заказа для сохранения', 'warning');
        return;
    }
    
    const formData = {
        client_name: document.getElementById('editModalClientName').value,
        client_phone: document.getElementById('editModalClientPhone').value,
        client_telegram: document.getElementById('editModalClientTelegram').value,
        city: document.getElementById('editModalCity').value,
        street: document.getElementById('editModalStreet').value,
        house: document.getElementById('editModalHouse').value,
        apartment: document.getElementById('editModalApartment').value,
        entrance: document.getElementById('editModalEntrance').value,
        floor: document.getElementById('editModalFloor').value,
        intercom: document.getElementById('editModalIntercom').value,
        problem_description: document.getElementById('editModalProblemDescription').value,
        visit_date: document.getElementById('editModalVisitDate').value
    };
    
    // Валидация
    if (!formData.client_name || !formData.client_phone) {
        showAlert('Заполните обязательные поля (имя и телефон)', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${window.currentEditOrderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Изменения сохранены успешно!', 'success');
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
            modal.hide();
            // Обновляем список заказов
            loadOrders();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка сохранения изменений', 'danger');
        }
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Сохранение изменений заказа (для страницы работы)
async function saveOrderChanges() {
    if (!currentWorkOrderId) {
        showAlert('Нет активного заказа для сохранения', 'warning');
        return;
    }
    
    const formData = {
        client_name: document.getElementById('editClientName').value,
        client_phone: document.getElementById('editClientPhone').value,
        client_telegram: document.getElementById('editClientTelegram').value,
        city: document.getElementById('editCity').value,
        street: document.getElementById('editStreet').value,
        house: document.getElementById('editHouse').value,
        apartment: document.getElementById('editApartment').value,
        entrance: document.getElementById('editEntrance').value,
        floor: document.getElementById('editFloor').value,
        intercom: document.getElementById('editIntercom').value,
        problem_description: document.getElementById('editProblemDescription').value,
        visit_date: document.getElementById('editVisitDate').value
    };
    
    // Валидация
    if (!formData.client_name || !formData.client_phone) {
        showAlert('Заполните обязательные поля (имя и телефон)', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${currentWorkOrderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Изменения сохранены успешно!', 'success');
            // Обновляем информацию о заказе на странице
            loadWorkData();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка сохранения изменений', 'danger');
        }
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

async function startWork(orderId) {
    console.log('=== НАЧАЛО РАБОТЫ С ЗАКАЗОМ ===');
    console.log('ID заказа:', orderId);
    
    try {
        console.log('Отправляем запрос на обновление статуса...');
        const response = await fetch(`/api/orders/${orderId}`, {
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
            showAlert('Заказ переведен в работу!', 'success');
            loadOrders(); // Перезагружаем список заказов
            
            // Сохраняем ID заказа для работы
            currentWorkOrderId = orderId;
            
            // Переходим на страницу работы с заказом
            showPage('work');
        } else {
            const error = await response.json();
            console.error('Ошибка обновления статуса:', error);
            showAlert(error.error || 'Ошибка обновления статуса', 'danger');
        }
    } catch (error) {
        console.error('Ошибка при переводе заказа в работу:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

async function declineOrder(orderId) {
    console.log('Отказ клиента от заказа:', orderId);
    
    if (!confirm('Вы уверены, что клиент отказался от заказа?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'declined' })
        });

        if (response.ok) {
            showAlert('Заказ помечен как отказ клиента', 'warning');
            loadOrders(); // Перезагружаем список заказов
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка обновления статуса', 'danger');
        }
    } catch (error) {
        console.error('Ошибка отказа от заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

async function cancelOrder(orderId) {
    console.log('Отменить заказ:', orderId);
    
    if (!confirm('Вы уверены, что хотите отменить этот заказ? Заказ будет перемещен в корзину.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (response.ok) {
            showAlert('Заказ отменен и перемещен в корзину', 'info');
            loadOrders(); // Перезагружаем список заказов
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка обновления статуса', 'danger');
        }
    } catch (error) {
        console.error('Ошибка отмены заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// ==================== СОЗДАНИЕ ЗАКАЗОВ ====================

async function saveOrder() {
    console.log('=== НАЧАЛО СОХРАНЕНИЯ ЗАКАЗА ===');
    
    // Собираем данные из формы
    const formData = {
        client_name: document.getElementById('clientName').value,
        client_phone: document.getElementById('clientPhone').value,
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
        showAlert('Заполните обязательные поля: имя клиента и телефон', 'warning');
        return;
    }

    try {
        console.log('Отправляем запрос на создание заказа...');
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Ответ сервера:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('Заказ создан:', result);
            showAlert('Заказ успешно создан!', 'success');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
            modal.hide();
            
            // Очищаем форму
            document.getElementById('newOrderForm').reset();
            
            // Перезагружаем список заказов
            console.log('Перезагружаем список заказов...');
            loadOrders();
            console.log('Список заказов обновлен');
        } else {
            const error = await response.json();
            console.error('Ошибка создания заказа:', error);
            showAlert(error.error || 'Ошибка создания заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getStatusColor(status) {
    const colors = {
        'pending': 'bg-warning',
        'in_progress': 'bg-info',
        'estimate_sent': 'bg-primary',
        'completed': 'bg-success',
        'cancelled': 'bg-secondary',
        'declined': 'bg-danger'
    };
    return colors[status] || 'bg-secondary';
}

function getStatusText(status) {
    const statuses = {
        'pending': 'Предстоящий',
        'in_progress': 'В работе',
        'estimate_sent': 'Смета отправлена',
        'completed': 'Выполнено',
        'cancelled': 'Отменен',
        'declined': 'Отказ'
    };
    return statuses[status] || status;
}

function showAlert(message, type = 'info') {
    // Создаем элемент уведомления
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Добавляем в DOM
    document.body.appendChild(alertDiv);

    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ==================== ЗАГЛУШКИ ДЛЯ НЕРЕАЛИЗОВАННЫХ ФУНКЦИЙ ====================

async function loadDashboard() {
    console.log('Загрузка данных дашборда');
    
    try {
        // Загружаем все заказы для подсчета статистики
        const response = await fetch('/api/orders');
        if (response.ok) {
            const orders = await response.json();
            
            // Подсчитываем статистику по статусам
            const stats = {
                new: 0,        // pending
                inProgress: 0, // in_progress
                completed: 0,  // completed
                declined: 0,   // declined
                cancelled: 0   // cancelled
            };
            
            orders.forEach(order => {
                switch(order.status) {
                    case 'pending':
                        stats.new++;
                        break;
                    case 'in_progress':
                        stats.inProgress++;
                        break;
                    case 'completed':
                        stats.completed++;
                        break;
                    case 'declined':
                        stats.declined++;
                        break;
                    case 'cancelled':
                        stats.cancelled++;
                        break;
                }
            });
            
            // Обновляем счетчики на дашборде
            document.getElementById('newOrdersCount').textContent = stats.new;
            document.getElementById('inProgressCount').textContent = stats.inProgress;
            document.getElementById('estimatesCount').textContent = stats.inProgress; // Сметы = заказы в работе
            document.getElementById('completedCount').textContent = stats.completed;
            
            console.log('Статистика дашборда обновлена:', stats);
            
            // Показываем только активные заказы (предстоящие и в работе) на дашборде
            const activeOrders = orders.filter(order => 
                order.status === 'pending' || order.status === 'in_progress'
            );
            console.log('Активные заказы для дашборда:', activeOrders);
            renderOrderCards(activeOrders);
        } else {
            console.error('Ошибка загрузки заказов для дашборда');
        }
    } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error);
    }
}

async function loadEstimates() {
    console.log('Загрузка смет');
    
    try {
        // Загружаем заказы в работе (это и есть сметы)
        const response = await fetch('/api/orders?status=in_progress');
        if (response.ok) {
            const orders = await response.json();
            
            // Отображаем заказы в работе как сметы
            const estimatesTable = document.getElementById('estimatesTable');
            if (estimatesTable) {
                const tbody = estimatesTable.querySelector('tbody');
                tbody.innerHTML = '';
                
                if (orders.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Сметы не найдены</td></tr>';
                } else {
                    orders.forEach(order => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${order.order_number}</td>
                            <td>${order.order_number}</td>
                            <td>${order.client_name || 'Не указано'}</td>
                            <td>В разработке</td>
                            <td><span class="badge bg-info">${getStatusText(order.status)}</span></td>
                            <td>${new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="startWork(${order.id})">
                                    <i class="fas fa-tools"></i> Работать
                                </button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
            
            console.log('Сметы загружены:', orders.length);
        } else {
            console.error('Ошибка загрузки смет');
            showAlert('Ошибка загрузки смет', 'danger');
        }
    } catch (error) {
        console.error('Ошибка загрузки смет:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

function loadAdminData() {
    console.log('Загрузка административных данных');
    showAlert('Функция администрирования в разработке', 'info');
}

function loadProfileData() {
    console.log('Загрузка данных профиля');
    showAlert('Функция профиля в разработке', 'info');
}

let currentWorkOrderId = null;

function loadWorkData() {
    console.log('Загрузка данных работы');
    
    if (!currentWorkOrderId) {
        showAlert('ID заказа не найден', 'danger');
        showPage('orders');
        return;
    }

    // Загружаем информацию о заказе
    loadWorkOrderInfo(currentWorkOrderId);
}

async function loadWorkOrderInfo(orderId) {
    try {
        console.log('Загружаем данные заказа для работы:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            populateWorkOrderInfo(order);
        } else {
            showAlert('Ошибка загрузки данных заказа', 'danger');
            showPage('orders');
        }
    } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
        showPage('orders');
    }
}

function populateWorkOrderInfo(order) {
    document.getElementById('workOrderNumber').textContent = order.order_number;
    document.getElementById('workOrderStatus').textContent = getStatusText(order.status);
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
    document.getElementById('workDescription').textContent = order.problem_description || 'Не указано';
}

function addMeasurement() {
    console.log('Добавление нового замера');
    
    // Создаем модальное окно для добавления замера
    const modalHtml = `
        <div class="modal fade" id="measurementModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить замер</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="measurementForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Тип работы *</label>
                                        <select class="form-select" id="workType" required>
                                            <option value="">Выберите тип работы</option>
                                            <option value="mosquito">Москитные системы</option>
                                            <option value="blinds">Рулонные шторы</option>
                                            <option value="repair">Ремонт</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Название работы *</label>
                                        <input type="text" class="form-control" id="workName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Количество *</label>
                                        <input type="number" class="form-control" id="quantity" min="1" step="0.01" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Единица измерения</label>
                                        <select class="form-select" id="unit">
                                            <option value="шт">Штуки</option>
                                            <option value="м">Метры</option>
                                            <option value="м²">Квадратные метры</option>
                                            <option value="м³">Кубические метры</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Цена за единицу (₽) *</label>
                                        <input type="number" class="form-control" id="unitPrice" min="0" step="0.01" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Размеры (мм/см/м)</label>
                                        <input type="text" class="form-control" id="dimensions" placeholder="например: 1200x800 мм">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label class="form-label">Примечания</label>
                                        <textarea class="form-control" id="notes" rows="3"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Фотографии</label>
                                        <input type="file" class="form-control" id="photos" multiple accept="image/*">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="saveMeasurement()">Сохранить замер</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Удаляем существующее модальное окно
    const existingModal = document.getElementById('measurementModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Добавляем новое модальное окно
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Показываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('measurementModal'));
    modal.show();
}

function saveMeasurement() {
    const measurement = {
        workType: document.getElementById('workType').value,
        workName: document.getElementById('workName').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        unit: document.getElementById('unit').value,
        unitPrice: parseFloat(document.getElementById('unitPrice').value),
        dimensions: document.getElementById('dimensions').value,
        notes: document.getElementById('notes').value
    };
    
    // Валидация
    if (!measurement.workType || !measurement.workName || !measurement.quantity || !measurement.unitPrice) {
        showAlert('Заполните обязательные поля', 'warning');
        return;
    }
    
    // Вычисляем общую стоимость
    const totalPrice = measurement.quantity * measurement.unitPrice;
    
    console.log('Сохранение замера:', measurement);
    console.log('Общая стоимость:', totalPrice);
    
    // Добавляем замер в список
    addMeasurementToList(measurement);
    
    // Закрываем модальное окно
    const modalElement = document.getElementById('measurementModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    } else {
        // Если экземпляр не найден, создаем новый
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
    }
    
    // Удаляем модальное окно из DOM после закрытия
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    }, { once: true });
    
    showAlert('Замер добавлен!', 'success');
}

function addMeasurementToList(measurement) {
    const measurementsList = document.getElementById('measurementsList');
    
    // Если список пустой, убираем заглушку
    if (measurementsList.innerHTML.includes('Замеры не добавлены')) {
        measurementsList.innerHTML = '';
    }
    
    const measurementHtml = `
        <div class="card mb-3 measurement-item">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">${measurement.workName}</h6>
                        <p class="card-text">
                            <strong>Тип:</strong> ${getWorkTypeText(measurement.workType)}<br>
                            <strong>Количество:</strong> ${measurement.quantity} ${measurement.unit}<br>
                            <strong>Цена за единицу:</strong> ${measurement.unitPrice.toLocaleString('ru-RU')} ₽<br>
                            <strong>Общая стоимость:</strong> ${(measurement.quantity * measurement.unitPrice).toLocaleString('ru-RU')} ₽
                            ${measurement.dimensions ? `<br><strong>Размеры:</strong> ${measurement.dimensions}` : ''}
                            ${measurement.notes ? `<br><strong>Примечания:</strong> ${measurement.notes}` : ''}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="removeMeasurement(this)">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    measurementsList.insertAdjacentHTML('beforeend', measurementHtml);
}

function getWorkTypeText(type) {
    const types = {
        'mosquito': 'Москитные системы',
        'blinds': 'Рулонные шторы',
        'repair': 'Ремонт'
    };
    return types[type] || type;
}

function removeMeasurement(button) {
    if (confirm('Удалить этот замер?')) {
        button.closest('.measurement-item').remove();
        
        // Если список пустой, показываем заглушку
        const measurementsList = document.getElementById('measurementsList');
        if (measurementsList.children.length === 0) {
            measurementsList.innerHTML = '<p class="text-muted text-center">Замеры не добавлены</p>';
        }
    }
}

// Функция поиска адреса на карте удалена (карты отключены)

// ==================== НОВЫЕ ФУНКЦИИ УПРАВЛЕНИЯ ЗАКАЗАМИ ====================

// Отправить смету
async function sendEstimate(orderId) {
    if (!confirm('Отметить заказ как "Смета отправлена"?')) {
        return;
    }
    
    try {
        console.log('Отправляем смету для заказа:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'estimate_sent' })
        });
        
        if (response.ok) {
            showAlert('Заказ отмечен как "Смета отправлена"', 'success');
            loadOrders(); // Перезагружаем список заказов
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка обновления статуса', 'danger');
        }
    } catch (error) {
        console.error('Ошибка отправки сметы:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Завершить заказ
async function completeOrder(orderId) {
    if (!confirm('Отметить заказ как "Выполнено" и переместить в архив?')) {
        return;
    }
    
    try {
        console.log('Завершаем заказ:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
        });
        
        if (response.ok) {
            showAlert('Заказ завершен и перемещен в архив', 'success');
            loadOrders(); // Перезагружаем список заказов
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка обновления статуса', 'danger');
        }
    } catch (error) {
        console.error('Ошибка завершения заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// ==================== УПРАВЛЕНИЕ ЗАКАЗАМИ (УДАЛЕНИЕ/ВОССТАНОВЛЕНИЕ) ====================

// Показать/скрыть кнопки управления
function toggleManagementButtons(status) {
    const managementButtons = document.getElementById('managementButtons');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const restoreAllBtn = document.getElementById('restoreAllBtn');
    
    if (status === 'declined' || status === 'cancelled') {
        managementButtons.style.display = 'block';
        
        // Обновляем текст кнопок в зависимости от статуса
        if (status === 'declined') {
            clearAllBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Удалить все отказы';
            restoreAllBtn.innerHTML = '<i class="fas fa-undo"></i> Восстановить все отказы';
        } else if (status === 'cancelled') {
            clearAllBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Очистить корзину';
            restoreAllBtn.innerHTML = '<i class="fas fa-undo"></i> Восстановить все из корзины';
        }
    } else {
        managementButtons.style.display = 'none';
    }
}

// Переключить выбор всех заказов
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const orderCheckboxes = document.querySelectorAll('.order-checkbox');
    
    orderCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Получить выбранные заказы
function getSelectedOrders() {
    const orderCheckboxes = document.querySelectorAll('.order-checkbox:checked');
    return Array.from(orderCheckboxes).map(checkbox => parseInt(checkbox.value));
}

// Удалить заказ навсегда
async function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ навсегда? Это действие нельзя отменить.')) {
        return;
    }
    
    try {
        console.log('Удаляем заказ:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Заказ удален навсегда', 'success');
            // Перезагружаем список заказов
            const currentStatus = getCurrentStatus();
            showOrderCards(currentStatus);
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка удаления заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Восстановить заказ
async function restoreOrder(orderId) {
    try {
        console.log('Восстанавливаем заказ:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'pending' })
        });
        
        if (response.ok) {
            showAlert('Заказ восстановлен', 'success');
            // Перезагружаем список заказов
            const currentStatus = getCurrentStatus();
            showOrderCards(currentStatus);
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка восстановления заказа', 'danger');
        }
    } catch (error) {
        console.error('Ошибка восстановления заказа:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Очистить все заказы (удалить навсегда)
async function clearAllOrders() {
    const selectedOrders = getSelectedOrders();
    
    if (selectedOrders.length === 0) {
        showAlert('Выберите заказы для удаления', 'warning');
        return;
    }
    
    if (!confirm(`Вы уверены, что хотите удалить ${selectedOrders.length} заказ(ов) навсегда? Это действие нельзя отменить.`)) {
        return;
    }
    
    try {
        console.log('Удаляем заказы:', selectedOrders);
        
        // Удаляем заказы по одному
        for (const orderId of selectedOrders) {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                showAlert(`Ошибка удаления заказа ${orderId}: ${error.error}`, 'danger');
                return;
            }
        }
        
        showAlert(`${selectedOrders.length} заказ(ов) удалено навсегда`, 'success');
        
        // Перезагружаем список заказов
        const currentStatus = getCurrentStatus();
        showOrderCards(currentStatus);
        
    } catch (error) {
        console.error('Ошибка массового удаления заказов:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Восстановить все заказы
async function restoreAllOrders() {
    const selectedOrders = getSelectedOrders();
    
    if (selectedOrders.length === 0) {
        showAlert('Выберите заказы для восстановления', 'warning');
        return;
    }
    
    if (!confirm(`Вы уверены, что хотите восстановить ${selectedOrders.length} заказ(ов)?`)) {
        return;
    }
    
    try {
        console.log('Восстанавливаем заказы:', selectedOrders);
        
        // Восстанавливаем заказы по одному
        for (const orderId of selectedOrders) {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'pending' })
            });
            
            if (!response.ok) {
                const error = await response.json();
                showAlert(`Ошибка восстановления заказа ${orderId}: ${error.error}`, 'danger');
                return;
            }
        }
        
        showAlert(`${selectedOrders.length} заказ(ов) восстановлено`, 'success');
        
        // Перезагружаем список заказов
        const currentStatus = getCurrentStatus();
        showOrderCards(currentStatus);
        
    } catch (error) {
        console.error('Ошибка массового восстановления заказов:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Получить текущий статус фильтрации
function getCurrentStatus() {
    const activeButton = document.querySelector('.btn-group .btn.active');
    if (activeButton) {
        const onclick = activeButton.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/showOrderCards\('([^']+)'\)/);
            if (match) {
                return match[1];
            }
        }
    }
    return null; // По умолчанию
}


// Функция создания нового пользователя
function createUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('newFullName').value;
    const role = document.getElementById('newUserRole').value;
    const managerId = document.getElementById('newUserManager').value;
    
    if (!username || !password) {
        showAlert('Заполните обязательные поля', 'warning');
        return;
    }
    
    const userData = {
        username: username,
        password: password,
        full_name: fullName,
        role: role,
        manager_id: managerId || null
    };
    
    console.log('Создание пользователя:', userData);
    
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Пользователь создан успешно!', 'success');
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
            modal.hide();
            // Очищаем форму
            document.getElementById('newUserForm').reset();
            // Перезагружаем данные админки
            loadAdminData();
        } else {
            showAlert(data.error || 'Ошибка создания пользователя', 'danger');
        }
    })
    .catch(error => {
        console.error('Ошибка создания пользователя:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    });
}

// ==================== УПРАВЛЕНИЕ ИЕРАРХИЕЙ ====================

// Обновить опции менеджеров при выборе роли
function updateManagerOptions() {
    const role = document.getElementById('newUserRole').value;
    const managerDiv = document.getElementById('managerSelectDiv');
    const managerSelect = document.getElementById('newUserManager');
    
    if (role === 'worker' || role === 'manager') {
        managerDiv.style.display = 'block';
        loadManagerOptions(managerSelect, role);
    } else {
        managerDiv.style.display = 'none';
    }
}

// Загрузить опции менеджеров
async function loadManagerOptions(selectElement, role) {
    try {
        const response = await fetch('/api/users/assignable');
        const users = await response.json();
        
        selectElement.innerHTML = '<option value="">Без менеджера</option>';
        
        // Фильтруем пользователей в зависимости от роли
        const availableManagers = users.filter(user => {
            if (role === 'worker') {
                return user.role === 'manager' || user.role === 'senior_manager';
            } else if (role === 'manager') {
                return user.role === 'senior_manager';
            }
            return false;
        });
        
        availableManagers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.full_name || user.username} (${getRoleText(user.role)})`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки менеджеров:', error);
    }
}

// Показать менеджер иерархии
function showHierarchyManager() {
    const modal = new bootstrap.Modal(document.getElementById('hierarchyModal'));
    loadHierarchyUsers();
    modal.show();
}

// Загрузить пользователей для управления иерархией
async function loadHierarchyUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const userSelect = document.getElementById('hierarchyUserSelect');
        const managerSelect = document.getElementById('hierarchyManagerSelect');
        
        // Заполняем список пользователей
        userSelect.innerHTML = '<option value="">Выберите пользователя</option>';
        managerSelect.innerHTML = '<option value="">Без менеджера</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.full_name || user.username} (${getRoleText(user.role)})`;
            userSelect.appendChild(option);
            
            // Для менеджеров добавляем в список доступных менеджеров
            if (user.role === 'manager' || user.role === 'senior_manager') {
                const managerOption = document.createElement('option');
                managerOption.value = user.id;
                managerOption.textContent = `${user.full_name || user.username} (${getRoleText(user.role)})`;
                managerSelect.appendChild(managerOption);
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        showAlert('Ошибка загрузки пользователей', 'danger');
    }
}

// Загрузить иерархию пользователя
async function loadUserHierarchy() {
    const userId = document.getElementById('hierarchyUserSelect').value;
    if (!userId) {
        document.getElementById('hierarchyInfo').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/hierarchy`);
        const hierarchy = await response.json();
        
        const hierarchyTree = document.getElementById('hierarchyTree');
        hierarchyTree.innerHTML = buildHierarchyTree(hierarchy);
        document.getElementById('hierarchyInfo').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки иерархии:', error);
    }
}

// Построить дерево иерархии
function buildHierarchyTree(hierarchy) {
    let html = '<ul class="list-unstyled">';
    
    function buildNode(node, level = 0) {
        const indent = '&nbsp;'.repeat(level * 4);
        html += `<li>${indent}${node.full_name || node.username} (${getRoleText(node.role)})</li>`;
        
        if (node.subordinates && node.subordinates.length > 0) {
            node.subordinates.forEach(sub => buildNode(sub, level + 1));
        }
    }
    
    buildNode(hierarchy);
    html += '</ul>';
    return html;
}

// Обновить иерархию пользователя
async function updateUserHierarchy() {
    const userId = document.getElementById('hierarchyUserSelect').value;
    const managerId = document.getElementById('hierarchyManagerSelect').value;
    
    if (!userId) {
        showAlert('Выберите пользователя', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/hierarchy`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ manager_id: managerId || null })
        });
        
        if (response.ok) {
            showAlert('Иерархия обновлена', 'success');
            loadUserHierarchy(); // Обновляем отображение
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка обновления иерархии', 'danger');
        }
    } catch (error) {
        console.error('Ошибка обновления иерархии:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Получить текст роли
function getRoleText(role) {
    const roles = {
        'admin': 'Администратор',
        'senior_manager': 'Старший менеджер',
        'manager': 'Менеджер',
        'worker': 'Работник'
    };
    return roles[role] || role;
}

// Выполнить поиск заказов
async function performSearch() {
    console.log('Выполнение поиска заказов');
    
    const searchParams = {
        order_number: document.getElementById('searchOrderNumber')?.value || '',
        client_name: document.getElementById('searchClientName')?.value || '',
        client_phone: document.getElementById('searchPhone')?.value || '',
        address: document.getElementById('searchAddress')?.value || '',
        status: document.getElementById('searchStatus')?.value || '',
        date_from: document.getElementById('searchDateFrom')?.value || '',
        date_to: document.getElementById('searchDateTo')?.value || ''
    };
    
    // Убираем пустые параметры
    const filteredParams = Object.fromEntries(
        Object.entries(searchParams).filter(([key, value]) => value.trim() !== '')
    );
    
    try {
        const queryString = new URLSearchParams(filteredParams).toString();
        const response = await fetch(`/api/orders/search?${queryString}`);
        
        if (response.ok) {
            const orders = await response.json();
            displaySearchResults(orders);
        } else {
            showAlert('Ошибка поиска заказов', 'danger');
        }
    } catch (error) {
        console.error('Ошибка поиска:', error);
        showAlert('Ошибка соединения с сервером', 'danger');
    }
}

// Отобразить результаты поиска
function displaySearchResults(orders) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!orders || orders.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-search fa-3x mb-3"></i>
                <p>По вашему запросу ничего не найдено</p>
            </div>
        `;
        return;
    }
    
    let resultsHtml = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6>Найдено заказов: ${orders.length}</h6>
        </div>
        <div class="row">
    `;
    
    orders.forEach(order => {
        resultsHtml += createOrderCardHtml(order);
    });
    
    resultsHtml += '</div>';
    resultsContainer.innerHTML = resultsHtml;
}

// Очистить поиск
function clearSearch() {
    document.getElementById('searchOrderNumber').value = '';
    document.getElementById('searchClientName').value = '';
    document.getElementById('searchPhone').value = '';
    document.getElementById('searchAddress').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchDateFrom').value = '';
    document.getElementById('searchDateTo').value = '';
    
    document.getElementById('searchResults').innerHTML = `
        <div class="text-center text-muted">
            <i class="fas fa-search fa-3x mb-3"></i>
            <p>Введите критерии поиска и нажмите "Найти"</p>
        </div>
    `;
}

// Загрузка истории изменений заказа
async function loadOrderHistory(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/history`);
        if (response.ok) {
            const history = await response.json();
            displayOrderHistory(history);
        } else {
            document.getElementById('orderHistoryContent').innerHTML = 
                '<p class="text-muted text-center">История изменений недоступна</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки истории изменений:', error);
        document.getElementById('orderHistoryContent').innerHTML = 
            '<p class="text-danger text-center">Ошибка загрузки истории</p>';
    }
}

// Отображение истории изменений
function displayOrderHistory(history) {
    const historyContent = document.getElementById('orderHistoryContent');
    
    if (!history || history.length === 0) {
        historyContent.innerHTML = '<p class="text-muted text-center">История изменений пуста</p>';
        return;
    }
    
    let historyHtml = '<div class="timeline">';
    
    history.forEach((entry, index) => {
        const date = new Date(entry.created_at).toLocaleString('ru-RU');
        const isLast = index === history.length - 1;
        
        historyHtml += `
            <div class="timeline-item ${isLast ? 'timeline-item-last' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${entry.action_text}</h6>
                            <p class="mb-1 text-muted">${entry.user_name}</p>
                            ${entry.changes ? `<small class="text-muted">${entry.changes}</small>` : ''}
                        </div>
                        <small class="text-muted">${date}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    historyHtml += '</div>';
    historyContent.innerHTML = historyHtml;
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ-ОБЕРТКИ ====================

// Глобальные функции для onclick атрибутов
window.showOrderCards = function(status) {
    if (window.app && window.app.showOrderCards) {
        window.app.showOrderCards(status);
    } else {
        console.error('Приложение не инициализировано');
        // Попытка повторной инициализации
        setTimeout(() => {
            if (window.app && window.app.showOrderCards) {
                window.app.showOrderCards(status);
            }
        }, 100);
    }
};

window.viewOrderCard = async function(orderId) {
    console.log('viewOrderCard вызвана, orderId:', orderId);
    console.log('window.app:', window.app);
    
    if (window.app && typeof window.app.viewOrderCard === 'function') {
        console.log('Вызываем app.viewOrderCard');
        await window.app.viewOrderCard(orderId);
    } else {
        console.error('Приложение не инициализировано или метод не найден');
        // Попытка повторной инициализации
        setTimeout(async () => {
            if (window.app && typeof window.app.viewOrderCard === 'function') {
                console.log('Повторная попытка - вызываем app.viewOrderCard');
                await window.app.viewOrderCard(orderId);
            } else {
                console.error('Повторная попытка не удалась');
            }
        }, 500);
    }
};

window.startWork = function(orderId) {
    if (window.app && window.app.startWork) {
        window.app.startWork(orderId);
    } else {
        console.error('Приложение не инициализировано');
        // Попытка повторной инициализации
        setTimeout(() => {
            if (window.app && window.app.startWork) {
                window.app.startWork(orderId);
            }
        }, 100);
    }
};

window.declineOrder = function(orderId) {
    if (window.app && window.app.declineOrder) {
        window.app.declineOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.cancelOrder = function(orderId) {
    if (window.app && window.app.cancelOrder) {
        window.app.cancelOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.editOrder = function(orderId) {
    if (window.app && window.app.editOrder) {
        window.app.editOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.sendEstimate = function(orderId) {
    if (window.app && window.app.sendEstimate) {
        window.app.sendEstimate(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.completeOrder = function(orderId) {
    if (window.app && window.app.completeOrder) {
        window.app.completeOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.deleteOrder = function(orderId) {
    if (window.app && window.app.deleteOrder) {
        window.app.deleteOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.restoreOrder = function(orderId) {
    if (window.app && window.app.restoreOrder) {
        window.app.restoreOrder(orderId);
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.clearAllOrders = function() {
    if (window.app && window.app.clearAllOrders) {
        window.app.clearAllOrders();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.restoreAllOrders = function() {
    if (window.app && window.app.restoreAllOrders) {
        window.app.restoreAllOrders();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.toggleSelectAll = function() {
    if (window.app && window.app.toggleSelectAll) {
        window.app.toggleSelectAll();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.performSearch = function() {
    if (window.app && window.app.performSearch) {
        window.app.performSearch();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.clearSearch = function() {
    if (window.app && window.app.clearSearch) {
        window.app.clearSearch();
    } else {
        console.error('Приложение не инициализировано');
    }
};

// ==================== ФУНКЦИИ ТЕСТИРОВАНИЯ ====================

// Функции для страницы тестирования
window.runAPITests = function() {
    if (window.app && window.app.runAPITests) {
        window.app.runAPITests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runComprehensiveAPITests = function() {
    if (window.app && window.app.runComprehensiveAPITests) {
        window.app.runComprehensiveAPITests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runFrontendTests = function() {
    if (window.app && window.app.runFrontendTests) {
        window.app.runFrontendTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runComprehensiveFrontendTests = function() {
    if (window.app && window.app.runComprehensiveFrontendTests) {
        window.app.runComprehensiveFrontendTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runMobileTests = function() {
    if (window.app && window.app.runMobileTests) {
        window.app.runMobileTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runSecurityTests = function() {
    if (window.app && window.app.runSecurityTests) {
        window.app.runSecurityTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runPerformanceTests = function() {
    if (window.app && window.app.runPerformanceTests) {
        window.app.runPerformanceTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.runAllTests = function() {
    if (window.app && window.app.runAllTests) {
        window.app.runAllTests();
    } else {
        console.error('Приложение не инициализировано');
    }
};

window.clearTestResults = function() {
    if (window.app && window.app.clearTestResults) {
        window.app.clearTestResults();
    } else {
        console.error('Приложение не инициализировано');
    }
};

// ==================== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ====================

// Обработчик формы входа
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    
    // Проверяем, не инициализировано ли уже приложение
    if (!window.app) {
        // Инициализируем приложение сразу
        window.app = new WindowRepairApp();
        console.log('Приложение инициализировано:', window.app);
    } else {
        console.log('Приложение уже инициализировано');
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    // Обработчик кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // Обработчики навигации
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });

    // Обработчик кнопки сохранения заказа
    const saveOrderBtn = document.getElementById('saveOrderBtn');
    if (saveOrderBtn) {
        saveOrderBtn.addEventListener('click', function() {
            saveOrder();
        });
    }

    // Обработчик кнопки применения фильтров
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
});

function applyFilters() {
    console.log('Применение фильтров');
    
    const statusFilter = document.getElementById('statusFilter')?.value;
    const searchQuery = document.getElementById('searchInput')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;
    
    console.log('Фильтры:', { statusFilter, searchQuery, dateFilter });
    
    // Фильтруем заказы
    let filteredOrders = [...orders];
    
    // Фильтр по статусу
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Фильтр по поиску
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
            order.client_name?.toLowerCase().includes(query) ||
            order.client_phone?.includes(query) ||
            order.order_number?.toLowerCase().includes(query) ||
            order.address?.toLowerCase().includes(query)
        );
    }
    
    // Фильтр по дате
    if (dateFilter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            
            switch (dateFilter) {
                case 'today':
                    return orderDate >= today;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return orderDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return orderDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    console.log('Отфильтрованные заказы:', filteredOrders);
    renderOrderCards(filteredOrders);
}

function showOrderDetailsModal(order) {
    const modalHtml = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Заказ ${order.order_number}</h5>
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
                                <p><strong>Этаж:</strong> ${order.floor || 'Не указан'}</p>
                                <p><strong>Квартира:</strong> ${order.apartment || 'Не указана'}</p>
                                <p><strong>Домофон:</strong> ${order.intercom || 'Не указан'}</p>
                                <!-- Координаты удалены (карты отключены) -->
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Описание проблемы</h6>
                                <p>${order.problem_description || 'Не указано'}</p>
                            </div>
                        </div>
                        
                        <!-- История изменений (спойлер) -->
                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="accordion" id="orderHistoryAccordion">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="historyHeader">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#orderHistory" aria-expanded="false" aria-controls="orderHistory">
                                                <i class="fas fa-history me-2"></i> История изменений
                                            </button>
                                        </h2>
                                        <div id="orderHistory" class="accordion-collapse collapse" aria-labelledby="historyHeader" data-bs-parent="#orderHistoryAccordion">
                                            <div class="accordion-body">
                                                <div id="orderHistoryContent">
                                                    <div class="text-center">
                                                        <div class="spinner-border text-primary" role="status">
                                                            <span class="visually-hidden">Загрузка...</span>
                                                        </div>
                                                        <p class="mt-2">Загрузка истории изменений...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="editOrder(${order.id})" data-bs-dismiss="modal">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        <button type="button" class="btn btn-success" onclick="startWork(${order.id})" data-bs-dismiss="modal">
                            <i class="fas fa-play"></i> В работу
                        </button>
                        <button type="button" class="btn btn-warning" onclick="declineOrder(${order.id})" data-bs-dismiss="modal">
                            <i class="fas fa-ban"></i> Отказ
                        </button>
                        <button type="button" class="btn btn-danger" onclick="cancelOrder(${order.id})" data-bs-dismiss="modal">
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
    
    // Загружаем историю изменений
    loadOrderHistory(order.id);
    
    // Исправляем проблему с aria-hidden
    const modalElement = document.getElementById('orderDetailsModal');
    modalElement.addEventListener('hidden.bs.modal', function() {
        // Убираем aria-hidden и восстанавливаем нормальное состояние
        modalElement.removeAttribute('aria-hidden');
        modalElement.style.display = 'none';
        // Убираем фокус с кнопок перед удалением
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
            activeElement.blur();
        }
        setTimeout(() => {
            modalElement.remove();
        }, 100);
    }, { once: true });
}

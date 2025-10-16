/**
 * Основное приложение WindowRepairApp
 * Модульная архитектура для удобства разработки и поддержки
 */

// Глобальная переменная для совместимости
let app;

class WindowRepairApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        
        // Инициализация модулей
        this.authModule = new AuthModule(this);
        this.ordersModule = new OrdersModule(this);
        this.workModule = new WorkModule(this);
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        console.log('Инициализация приложения...');
        this.setupEventListeners();
        this.authModule.checkAuth();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработчик формы входа
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            this.authModule.login(username, password);
        });

        // Обработчик кнопки выхода
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.authModule.logout();
        });

        // Обработчики навигации
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Обработчик кнопки сохранения заказа
        document.getElementById('saveOrderBtn').addEventListener('click', () => {
            this.saveOrder();
        });

        // Обработчик кнопки применения фильтров
        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.ordersModule.applyFilters();
        });
    }

    /**
     * Показать страницу
     */
    showPage(pageName) {
        console.log('Переход на страницу:', pageName);
        
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // Показываем нужную страницу
        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = pageName;
            
            // Загружаем данные для страницы
            this.loadPageData(pageName);
        } else {
            console.error('Страница не найдена:', pageName);
        }

        // Обновляем активную ссылку в навигации
        this.updateActiveNavLink(pageName);
    }

    /**
     * Загрузка данных для страницы
     */
    loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'orders':
                this.ordersModule.loadOrders();
                break;
            case 'estimates':
                this.loadEstimates();
                break;
            case 'admin':
                this.loadAdminData();
                break;
            case 'profile':
                this.loadProfileData();
                break;
            case 'work':
                this.workModule.loadWorkData();
                break;
            case 'declined':
                this.loadDeclinedOrders();
                break;
            case 'cancelled':
                this.loadCancelledOrders();
                break;
        }
    }

    /**
     * Обновление активной ссылки в навигации
     */
    updateActiveNavLink(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Загрузка данных для главной страницы
     */
    loadDashboard() {
        console.log('Загрузка данных дашборда');
        // Здесь можно добавить загрузку статистики
    }

    /**
     * Загрузка смет
     */
    loadEstimates() {
        console.log('Загрузка смет');
        this.showAlert('Функция смет в разработке', 'info');
    }

    /**
     * Загрузка административных данных
     */
    loadAdminData() {
        console.log('Загрузка административных данных');
        this.showAlert('Функция администрирования в разработке', 'info');
    }

    /**
     * Загрузка данных профиля
     */
    loadProfileData() {
        console.log('Загрузка данных профиля');
        this.showAlert('Функция профиля в разработке', 'info');
    }

    /**
     * Загрузка отказов клиентов
     */
    loadDeclinedOrders() {
        console.log('Загрузка отказов клиентов');
        this.ordersModule.showOrderCards('declined');
    }

    /**
     * Загрузка отмененных заказов
     */
    loadCancelledOrders() {
        console.log('Загрузка отмененных заказов');
        this.ordersModule.showOrderCards('cancelled');
    }

    /**
     * Сохранение заказа
     */
    async saveOrder() {
        console.log('=== НАЧАЛО СОХРАНЕНИЯ ЗАКАЗА ===');
        
        // Проверяем, что форма загружена
        const clientNameEl = document.getElementById('clientName');
        const clientPhoneEl = document.getElementById('clientPhone');
        
        if (!clientNameEl || !clientPhoneEl) {
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
            assigned_to: document.getElementById('assignedTo')?.value || null,
            latitude: window.mapManager && window.mapManager.getSelectedCoordinates() ? window.mapManager.getSelectedCoordinates()[0] : null,
            longitude: window.mapManager && window.mapManager.getSelectedCoordinates() ? window.mapManager.getSelectedCoordinates()[1] : null
        };

        console.log('Данные для отправки:', formData);

        // Проверяем обязательные поля
        if (!formData.client_name || !formData.client_phone) {
            this.showAlert('Заполните обязательные поля: имя клиента и телефон', 'warning');
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
                this.showAlert('Заказ успешно создан!', 'success');
                
                // Закрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
                modal.hide();
                
                // Очищаем форму
                document.getElementById('newOrderForm').reset();
                
                // Перезагружаем список заказов
                console.log('Перезагружаем список заказов...');
                this.ordersModule.loadOrders();
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

    /**
     * Показать уведомление
     */
    showAlert(message, type = 'info') {
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
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализируем приложение...');
    app = new WindowRepairApp();
    window.app = app;
    console.log('Приложение инициализировано:', app);
});

// Глобальные функции для совместимости
function addMeasurement() {
    if (window.app && window.app.workModule) {
        window.app.workModule.addMeasurement();
    }
}

function searchAddressOnMap() {
    const addressInput = document.getElementById('addressSearch');
    if (addressInput && addressInput.value.trim()) {
        window.mapManager.searchByAddress(addressInput.value.trim());
    } else {
        window.app.showAlert('Введите адрес для поиска', 'warning');
    }
}

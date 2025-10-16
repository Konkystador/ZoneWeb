/**
 * Простое приложение WindowRepairApp
 * Без сложной модульной архитектуры - все в одном файле для надежности
 */

// Глобальные переменные
let currentUser = null;
let orders = [];
let currentPage = 'dashboard';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    checkAuth();
});

// ==================== АВТОРИЗАЦИЯ ====================

async function checkAuth() {
    try {
        console.log('Проверка авторизации...');
        const response = await fetch('/api/auth/check');
        
        if (response.ok) {
            const data = await response.json();
            console.log('Ответ сервера:', response.status, response.statusText);
            console.log('Данные ответа:', data);
            
            if (data.success) {
                console.log('Пользователь авторизован:', data.user);
                currentUser = data.user;
                showMainApp();
                setupRoleBasedUI();
            } else {
                showLoginScreen();
            }
        } else {
            console.log('Пользователь не авторизован');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        showLoginScreen();
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
                currentUser = data.user;
                showMainApp();
                setupRoleBasedUI();
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
            renderOrderCards(orders);
            console.log('Заказы отображены в интерфейсе');
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
        const url = status ? `/api/orders?status=${status}` : '/api/orders';
        const response = await fetch(url);
        
        if (response.ok) {
            const filteredOrders = await response.json();
            console.log('Получены заказы для статуса', status, ':', filteredOrders);
            renderOrderCards(filteredOrders);
            
            // Обновляем активную кнопку
            updateActiveButton(status);
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
        // Активируем кнопку "Все заказы"
        const allBtn = document.querySelector('button[onclick="showOrderCards()"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
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
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card order-card">
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
                    </p>
                    <div class="btn-group w-100" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrderCard(${order.id})" title="Просмотр/редактирование">
                            <i class="fas fa-eye"></i> Просмотр
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="startWork(${order.id})" title="Начать работу">
                            <i class="fas fa-play"></i> В работу
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="declineOrder(${order.id})" title="Отказ клиента">
                            <i class="fas fa-ban"></i> Отказ
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelOrder(${order.id})" title="Отменить заказ">
                            <i class="fas fa-times"></i> Отмена
                        </button>
                    </div>
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
        assigned_to: document.getElementById('assignedTo')?.value || null,
        latitude: null, // Карты отключены
        longitude: null // Карты отключены
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
        'completed': 'Завершен',
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

function searchAddressOnMap() {
    showAlert('Карты временно отключены', 'info');
}


// Функция создания нового пользователя
function createUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('newFullName').value;
    const role = document.getElementById('newUserRole').value;
    
    if (!username || !password) {
        showAlert('Заполните обязательные поля', 'warning');
        return;
    }
    
    const userData = {
        username: username,
        password: password,
        full_name: fullName,
        role: role
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

// ==================== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ====================

// Обработчик формы входа
document.addEventListener('DOMContentLoaded', function() {
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
                                ${order.latitude && order.longitude ? `
                                    <div class="mt-3">
                                        <h6>Координаты</h6>
                                        <p class="text-muted">Широта: ${order.latitude}, Долгота: ${order.longitude}</p>
                                        <div class="mt-2">
                                            <a href="https://yandex.ru/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map" target="_blank" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-external-link-alt"></i> Открыть в Яндекс.Картах
                                            </a>
                                            <a href="https://maps.google.com/?q=${order.latitude},${order.longitude}" target="_blank" class="btn btn-sm btn-outline-success ms-2">
                                                <i class="fab fa-google"></i> Открыть в Google Maps
                                            </a>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Описание проблемы</h6>
                                <p>${order.problem_description || 'Не указано'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
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
}

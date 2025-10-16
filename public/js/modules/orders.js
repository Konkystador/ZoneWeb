/**
 * Модуль управления заказами
 * Обрабатывает создание, редактирование, фильтрацию и отображение заказов
 */

class OrdersModule {
    constructor(app) {
        this.app = app;
        this.orders = [];
        this.currentFilter = null;
    }

    /**
     * Загрузка списка заказов
     */
    async loadOrders() {
        try {
            console.log('Загружаем список заказов...');
            const response = await fetch('/api/orders');
            
            if (response.ok) {
                this.orders = await response.json();
                console.log('Получены заказы:', this.orders);
                this.renderOrderCards(this.orders);
                console.log('Заказы отображены в интерфейсе');
            } else {
                console.error('Ошибка загрузки заказов:', response.status);
                this.app.showAlert('Ошибка загрузки заказов', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Показать карточки заказов с фильтром по статусу
     */
    async showOrderCards(status = null) {
        console.log('Показываем карточки заказов, статус:', status);
        this.currentFilter = status;
        
        try {
            const url = status ? `/api/orders?status=${status}` : '/api/orders';
            const response = await fetch(url);
            
            if (response.ok) {
                const orders = await response.json();
                console.log('Получены заказы для статуса', status, ':', orders);
                this.renderOrderCards(orders);
                
                // Обновляем активную кнопку
                this.updateActiveButton(status);
            } else {
                console.error('Ошибка загрузки заказов:', response.status);
                this.app.showAlert('Ошибка загрузки заказов', 'danger');
            }
        } catch (error) {
            console.error('Ошибка загрузки карточек заказов:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Обновление активной кнопки фильтра
     */
    updateActiveButton(status) {
        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Активируем соответствующую кнопку
        const statusButtons = {
            'pending': 'app.ordersModule.showOrderCards(\'pending\')',
            'in_progress': 'app.ordersModule.showOrderCards(\'in_progress\')',
            'declined': 'app.ordersModule.showOrderCards(\'declined\')',
            'cancelled': 'app.ordersModule.showOrderCards(\'cancelled\')'
        };
        
        if (status && statusButtons[status]) {
            const activeBtn = document.querySelector(`button[onclick="${statusButtons[status]}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        } else if (!status) {
            // Активируем кнопку "Все заказы"
            const allBtn = document.querySelector('button[onclick="app.ordersModule.showOrderCards()"]');
            if (allBtn) {
                allBtn.classList.add('active');
            }
        }
    }

    /**
     * Отображение заказов в виде карточек
     */
    renderOrderCards(orders) {
        const container = document.getElementById('orderCardsContainer');
        if (!container) {
            console.error('Контейнер для карточек заказов не найден');
            return;
        }

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Заказы не найдены</p>';
            return;
        }

        let html = '<div class="row">';
        orders.forEach(order => {
            html += this.createOrderCardHtml(order);
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    /**
     * Создание HTML для карточки заказа
     */
    createOrderCardHtml(order) {
        const statusClass = this.getStatusColor(order.status);
        const statusText = this.getStatusText(order.status);
        
        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card order-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${order.order_number}</h6>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <!-- Основное содержимое карточки -->
                    <div class="card-body">
                        <h6 class="card-title">${order.client_name}</h6>
                        <p class="card-text">
                            <i class="fas fa-map-marker-alt"></i> ${order.address}<br>
                            <i class="fas fa-phone"></i> ${order.client_phone}<br>
                            <i class="fas fa-calendar"></i> ${order.visit_date ? new Date(order.visit_date).toLocaleString('ru-RU') : 'Не указано'}<br>
                            <i class="fas fa-user"></i> ${order.assigned_name || 'Не назначен'}
                        </p>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.ordersModule.viewOrderCard(${order.id})" title="Просмотр/редактирование">
                                <i class="fas fa-eye"></i> Просмотр
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="app.ordersModule.startWork(${order.id})" title="Начать работу">
                                <i class="fas fa-play"></i> В работу
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="app.ordersModule.declineOrder(${order.id})" title="Отказ клиента">
                                <i class="fas fa-ban"></i> Отказ
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.ordersModule.cancelOrder(${order.id})" title="Отменить заказ">
                                <i class="fas fa-times"></i> Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Просмотр деталей заказа
     */
    async viewOrderCard(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (response.ok) {
                const order = await response.json();
                this.showOrderDetailsModal(order);
            } else {
                this.app.showAlert('Ошибка загрузки заказа', 'danger');
            }
        } catch (error) {
            console.error('Ошибка просмотра заказа:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Начать работу с заказом
     */
    async startWork(orderId) {
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
                this.app.showAlert('Заказ переведен в работу!', 'success');
                this.loadOrders(); // Перезагружаем список заказов
                
                // Переходим на страницу работы с заказом
                this.app.workModule.currentWorkOrderId = orderId;
                this.app.showPage('work');
            } else {
                const error = await response.json();
                console.error('Ошибка обновления статуса:', error);
                this.app.showAlert(error.error || 'Ошибка обновления статуса', 'danger');
            }
        } catch (error) {
            console.error('Ошибка при переводе заказа в работу:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Отказ клиента от заказа
     */
    async declineOrder(orderId) {
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
                this.app.showAlert('Заказ помечен как отказ клиента', 'warning');
                this.loadOrders(); // Перезагружаем список заказов
            } else {
                const error = await response.json();
                this.app.showAlert(error.error || 'Ошибка обновления статуса', 'danger');
            }
        } catch (error) {
            console.error('Ошибка отказа от заказа:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Отменить заказ
     */
    async cancelOrder(orderId) {
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
                this.app.showAlert('Заказ отменен и перемещен в корзину', 'info');
                this.loadOrders(); // Перезагружаем список заказов
            } else {
                const error = await response.json();
                this.app.showAlert(error.error || 'Ошибка обновления статуса', 'danger');
            }
        } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Применение фильтров
     */
    applyFilters() {
        console.log('Применение фильтров');
        
        const statusFilter = document.getElementById('statusFilter')?.value;
        const searchQuery = document.getElementById('searchInput')?.value;
        const dateFilter = document.getElementById('dateFilter')?.value;
        
        console.log('Фильтры:', { statusFilter, searchQuery, dateFilter });
        
        // Фильтруем заказы
        let filteredOrders = [...this.orders];
        
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
        this.renderOrderCards(filteredOrders);
    }

    /**
     * Получение цвета статуса
     */
    getStatusColor(status) {
        const colors = {
            'pending': 'bg-warning',
            'in_progress': 'bg-info',
            'completed': 'bg-success',
            'cancelled': 'bg-secondary',
            'declined': 'bg-danger'
        };
        return colors[status] || 'bg-secondary';
    }

    /**
     * Получение текста статуса
     */
    getStatusText(status) {
        const statuses = {
            'pending': 'Предстоящий',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен',
            'declined': 'Отказ'
        };
        return statuses[status] || status;
    }

    /**
     * Показать модальное окно с деталями заказа
     */
    showOrderDetailsModal(order) {
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
                                            <h6>Карта</h6>
                                            <div id="orderMap" style="width: 100%; height: 200px; border: 1px solid #ccc; border-radius: 5px;"></div>
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
                            <button type="button" class="btn btn-success" onclick="app.ordersModule.startWork(${order.id})" data-bs-dismiss="modal">
                                <i class="fas fa-play"></i> В работу
                            </button>
                            <button type="button" class="btn btn-warning" onclick="app.ordersModule.declineOrder(${order.id})" data-bs-dismiss="modal">
                                <i class="fas fa-ban"></i> Отказ
                            </button>
                            <button type="button" class="btn btn-danger" onclick="app.ordersModule.cancelOrder(${order.id})" data-bs-dismiss="modal">
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
        
        // Инициализируем карту, если есть координаты
        if (order.latitude && order.longitude) {
            setTimeout(() => {
                if (window.mapManager) {
                    window.mapManager.initMap('orderMap');
                    window.mapManager.setCoordinates([order.latitude, order.longitude]);
                }
            }, 500);
        }
    }
}

// Экспорт для использования в основном приложении
window.OrdersModule = OrdersModule;

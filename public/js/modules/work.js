/**
 * Модуль работы с заказом
 * Управляет страницей работы, замерами и созданием смет
 */

class WorkModule {
    constructor(app) {
        this.app = app;
        this.currentWorkOrderId = null;
        this.measurements = [];
    }

    /**
     * Загрузка данных для работы с заказом
     */
    async loadWorkData() {
        if (!this.currentWorkOrderId) {
            this.app.showAlert('ID заказа не найден', 'danger');
            this.app.showPage('orders');
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
                this.app.showAlert('Ошибка загрузки данных заказа', 'danger');
                this.app.showPage('orders');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных заказа:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
            this.app.showPage('orders');
        }
    }

    /**
     * Заполнение информации о заказе на странице работы
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
        document.getElementById('workDescription').textContent = order.problem_description || 'Не указано';
    }

    /**
     * Добавление нового замера
     */
    addMeasurement() {
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
                            <button type="button" class="btn btn-primary" onclick="app.workModule.saveMeasurement()">Сохранить замер</button>
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

    /**
     * Сохранение замера
     */
    saveMeasurement() {
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
            this.app.showAlert('Заполните обязательные поля', 'warning');
            return;
        }
        
        // Вычисляем общую стоимость
        const totalPrice = measurement.quantity * measurement.unitPrice;
        
        console.log('Сохранение замера:', measurement);
        console.log('Общая стоимость:', totalPrice);
        
        // Добавляем замер в список
        this.addMeasurementToList(measurement);
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('measurementModal'));
        modal.hide();
        
        this.app.showAlert('Замер добавлен!', 'success');
    }

    /**
     * Добавление замера в список
     */
    addMeasurementToList(measurement) {
        const measurementsList = document.getElementById('measurementsList');
        
        const measurementHtml = `
            <div class="card mb-3 measurement-item">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h6 class="card-title">${measurement.workName}</h6>
                            <p class="card-text">
                                <strong>Тип:</strong> ${this.getWorkTypeText(measurement.workType)}<br>
                                <strong>Количество:</strong> ${measurement.quantity} ${measurement.unit}<br>
                                <strong>Цена за единицу:</strong> ${measurement.unitPrice.toLocaleString('ru-RU')} ₽<br>
                                <strong>Общая стоимость:</strong> ${(measurement.quantity * measurement.unitPrice).toLocaleString('ru-RU')} ₽
                                ${measurement.dimensions ? `<br><strong>Размеры:</strong> ${measurement.dimensions}` : ''}
                                ${measurement.notes ? `<br><strong>Примечания:</strong> ${measurement.notes}` : ''}
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-outline-danger" onclick="app.workModule.removeMeasurement(this)">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        measurementsList.insertAdjacentHTML('beforeend', measurementHtml);
    }

    /**
     * Получение текста типа работы
     */
    getWorkTypeText(type) {
        const types = {
            'mosquito': 'Москитные системы',
            'blinds': 'Рулонные шторы',
            'repair': 'Ремонт'
        };
        return types[type] || type;
    }

    /**
     * Удаление замера
     */
    removeMeasurement(button) {
        if (confirm('Удалить этот замер?')) {
            button.closest('.measurement-item').remove();
        }
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
}

// Экспорт для использования в основном приложении
window.WorkModule = WorkModule;

// Модуль для работы со сметами
class EstimateManager {
    constructor(app) {
        this.app = app;
        this.currentEstimate = null;
        this.estimateItems = [];
    }

    // Создание новой сметы
    createEstimate(orderId) {
        this.currentEstimate = {
            order_id: orderId,
            items: [],
            discount_percent: 0,
            discount_amount: 0
        };
        this.estimateItems = [];
        this.showEstimateModal();
    }

    // Показ модального окна сметы
    showEstimateModal() {
        // Создаем модальное окно для сметы
        const modalHtml = `
            <div class="modal fade" id="estimateModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Создание сметы</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6>Позиции сметы</h6>
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-sm btn-primary" onclick="estimateManager.addItem('mosquito')">
                                                    <i class="fas fa-plus"></i> Москитные системы
                                                </button>
                                                <button type="button" class="btn btn-sm btn-success" onclick="estimateManager.addItem('blinds')">
                                                    <i class="fas fa-plus"></i> Рулонные шторы
                                                </button>
                                                <button type="button" class="btn btn-sm btn-warning" onclick="estimateManager.addItem('repair')">
                                                    <i class="fas fa-plus"></i> Ремонт
                                                </button>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div id="estimateItemsList">
                                                <!-- Позиции сметы будут здесь -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6>Итоги</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label">Скидка (%)</label>
                                                <input type="number" class="form-control" id="discountPercent" 
                                                       value="0" min="0" max="100" step="0.01">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Скидка (руб.)</label>
                                                <input type="number" class="form-control" id="discountAmount" 
                                                       value="0" min="0" step="0.01">
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-between">
                                                <strong>Итого:</strong>
                                                <span id="totalAmount">0 ₽</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <strong>Скидка:</strong>
                                                <span id="discountTotal">0 ₽</span>
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-between">
                                                <strong>К доплате:</strong>
                                                <span id="finalAmount" class="text-primary fs-5">0 ₽</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="estimateManager.saveEstimate()">
                                <i class="fas fa-save"></i> Сохранить смету
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Удаляем существующее модальное окно если есть
        const existingModal = document.getElementById('estimateModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Добавляем новое модальное окно
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('estimateModal'));
        modal.show();

        // Настраиваем обработчики событий
        this.setupEstimateEventListeners();
    }

    setupEstimateEventListeners() {
        // Обработчики для скидок
        document.getElementById('discountPercent').addEventListener('input', () => {
            this.calculateTotals();
        });

        document.getElementById('discountAmount').addEventListener('input', () => {
            this.calculateTotals();
        });
    }

    // Добавление позиции в смету
    addItem(category) {
        const item = {
            id: Date.now(),
            category: category,
            item_name: '',
            quantity: 1,
            unit_price: 0,
            unit_type: this.getDefaultUnitType(category),
            profile_type: '',
            system_type: '',
            sash_type: '',
            notes: '',
            photos: ''
        };

        this.estimateItems.push(item);
        this.renderEstimateItems();
    }

    getDefaultUnitType(category) {
        const defaults = {
            'mosquito': 'шт',
            'blinds': 'шт',
            'repair': 'м²'
        };
        return defaults[category] || 'шт';
    }

    // Отображение позиций сметы
    renderEstimateItems() {
        const container = document.getElementById('estimateItemsList');
        container.innerHTML = '';

        this.estimateItems.forEach((item, index) => {
            const itemHtml = this.createEstimateItemHtml(item, index);
            container.insertAdjacentHTML('beforeend', itemHtml);
        });

        this.calculateTotals();
    }

    createEstimateItemHtml(item, index) {
        const categoryNames = {
            'mosquito': 'Москитные системы',
            'blinds': 'Рулонные шторы',
            'repair': 'Ремонт'
        };

        return `
            <div class="estimate-item" data-index="${index}">
                <div class="row">
                    <div class="col-md-2">
                        <label class="form-label">Категория</label>
                        <select class="form-select" onchange="estimateManager.updateItem(${index}, 'category', this.value)">
                            <option value="mosquito" ${item.category === 'mosquito' ? 'selected' : ''}>Москитные системы</option>
                            <option value="blinds" ${item.category === 'blinds' ? 'selected' : ''}>Рулонные шторы</option>
                            <option value="repair" ${item.category === 'repair' ? 'selected' : ''}>Ремонт</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Наименование</label>
                        <input type="text" class="form-control" value="${item.item_name}" 
                               onchange="estimateManager.updateItem(${index}, 'item_name', this.value)">
                    </div>
                    <div class="col-md-1">
                        <label class="form-label">Кол-во</label>
                        <input type="number" class="form-control" value="${item.quantity}" 
                               onchange="estimateManager.updateItem(${index}, 'quantity', this.value)">
                    </div>
                    <div class="col-md-1">
                        <label class="form-label">Ед.изм.</label>
                        <select class="form-select" onchange="estimateManager.updateItem(${index}, 'unit_type', this.value)">
                            <option value="шт" ${item.unit_type === 'шт' ? 'selected' : ''}>шт</option>
                            <option value="м²" ${item.unit_type === 'м²' ? 'selected' : ''}>м²</option>
                            <option value="м.п." ${item.unit_type === 'м.п.' ? 'selected' : ''}>м.п.</option>
                            <option value="мм" ${item.unit_type === 'мм' ? 'selected' : ''}>мм</option>
                            <option value="см" ${item.unit_type === 'см' ? 'selected' : ''}>см</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Цена за ед.</label>
                        <input type="number" class="form-control" value="${item.unit_price}" 
                               onchange="estimateManager.updateItem(${index}, 'unit_price', this.value)">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Сумма</label>
                        <input type="number" class="form-control" value="${(item.quantity * item.unit_price).toFixed(2)}" readonly>
                    </div>
                    <div class="col-md-1">
                        <label class="form-label">&nbsp;</label>
                        <button type="button" class="btn btn-danger btn-sm w-100" onclick="estimateManager.removeItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${item.category === 'repair' ? this.createRepairFieldsHtml(item, index) : ''}
            </div>
        `;
    }

    createRepairFieldsHtml(item, index) {
        return `
            <div class="row mt-2">
                <div class="col-md-3">
                    <label class="form-label">Тип профиля</label>
                    <select class="form-select" onchange="estimateManager.updateItem(${index}, 'profile_type', this.value)">
                        <option value="">Выберите</option>
                        <option value="plastic" ${item.profile_type === 'plastic' ? 'selected' : ''}>Пластик</option>
                        <option value="wood" ${item.profile_type === 'wood' ? 'selected' : ''}>Дерево</option>
                        <option value="aluminum" ${item.profile_type === 'aluminum' ? 'selected' : ''}>Алюминий</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Тип системы</label>
                    <input type="text" class="form-control" value="${item.system_type}" 
                           onchange="estimateManager.updateItem(${index}, 'system_type', this.value)">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Тип створки</label>
                    <select class="form-select" onchange="estimateManager.updateItem(${index}, 'sash_type', this.value)">
                        <option value="">Выберите</option>
                        <option value="swing" ${item.sash_type === 'swing' ? 'selected' : ''}>Поворотная</option>
                        <option value="tilt_turn" ${item.sash_type === 'tilt_turn' ? 'selected' : ''}>Поворотно-откидная</option>
                        <option value="tilt" ${item.sash_type === 'tilt' ? 'selected' : ''}>Откидная</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Примечание</label>
                    <input type="text" class="form-control" value="${item.notes}" 
                           onchange="estimateManager.updateItem(${index}, 'notes', this.value)">
                </div>
            </div>
        `;
    }

    // Обновление позиции сметы
    updateItem(index, field, value) {
        if (this.estimateItems[index]) {
            this.estimateItems[index][field] = value;
            this.calculateTotals();
        }
    }

    // Удаление позиции сметы
    removeItem(index) {
        this.estimateItems.splice(index, 1);
        this.renderEstimateItems();
    }

    // Расчет итогов
    calculateTotals() {
        let totalAmount = 0;
        
        this.estimateItems.forEach(item => {
            totalAmount += item.quantity * item.unit_price;
        });

        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
        
        const calculatedDiscount = discountPercent > 0 ? (totalAmount * discountPercent / 100) : discountAmount;
        const finalAmount = Math.ceil(totalAmount - calculatedDiscount); // Округление в большую сторону

        document.getElementById('totalAmount').textContent = totalAmount.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('discountTotal').textContent = calculatedDiscount.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('finalAmount').textContent = finalAmount.toLocaleString('ru-RU') + ' ₽';
    }

    // Сохранение сметы
    async saveEstimate() {
        if (this.estimateItems.length === 0) {
            this.app.showAlert('Добавьте хотя бы одну позицию в смету', 'warning');
            return;
        }

        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;

        const estimateData = {
            order_id: this.currentEstimate.order_id,
            items: this.estimateItems,
            discount_percent: discountPercent,
            discount_amount: discountAmount
        };

        try {
            const response = await fetch('/api/estimates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estimateData)
            });

            if (response.ok) {
                const data = await response.json();
                this.app.showAlert('Смета успешно создана!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('estimateModal')).hide();
                this.app.loadEstimates();
            } else {
                const error = await response.json();
                this.app.showAlert(error.error || 'Ошибка создания сметы', 'danger');
            }
        } catch (error) {
            console.error('Ошибка сохранения сметы:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }
}

// Создаем глобальный экземпляр после инициализации app
let estimateManager;

// Инициализируем после загрузки app
function initEstimateManager() {
    if (window.app) {
        estimateManager = new EstimateManager(window.app);
    } else {
        // Ждем инициализации app
        setTimeout(initEstimateManager, 100);
    }
}

// Запускаем инициализацию
initEstimateManager();

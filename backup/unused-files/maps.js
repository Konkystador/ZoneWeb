/**
 * Модуль для работы с картами Яндекс
 * Обеспечивает функциональность выбора точки на карте и геокодирования адресов
 */

class MapManager {
    constructor() {
        this.map = null;
        this.placemark = null;
        this.selectedCoordinates = null;
        this.geocoder = null;
    }

    /**
     * Инициализация карты
     * @param {string} containerId - ID контейнера для карты
     * @param {Array} center - Координаты центра карты [широта, долгота]
     */
    initMap(containerId, center = [55.7558, 37.6176]) {
        console.log('Инициализация карты в контейнере:', containerId);
        
        // Проверяем, что API Яндекс.Карт загружен
        if (typeof ymaps === 'undefined') {
            console.error('API Яндекс.Карт не загружен');
            return;
        }

        // Инициализируем карту
        ymaps.ready(() => {
            this.map = new ymaps.Map(containerId, {
                center: center,
                zoom: 10,
                controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
            });

            // Инициализируем геокодер
            this.geocoder = ymaps.geocode;

            // Обработчик клика по карте
            this.map.events.add('click', (event) => {
                this.onMapClick(event);
            });

            console.log('Карта инициализирована');
        });
    }

    /**
     * Обработчик клика по карте
     * @param {Object} event - Событие клика
     */
    onMapClick(event) {
        const coords = event.get('coords');
        console.log('Клик по карте, координаты:', coords);
        
        // Удаляем предыдущую метку
        if (this.placemark) {
            this.map.geoObjects.remove(this.placemark);
        }

        // Создаем новую метку
        this.placemark = new ymaps.Placemark(coords, {
            balloonContent: 'Выбранная точка'
        }, {
            preset: 'islands#redDotIcon',
            draggable: true
        });

        // Добавляем метку на карту
        this.map.geoObjects.add(this.placemark);

        // Сохраняем координаты
        this.selectedCoordinates = coords;

        // Получаем адрес по координатам
        this.getAddressByCoordinates(coords);
    }

    /**
     * Получение адреса по координатам
     * @param {Array} coords - Координаты [широта, долгота]
     */
    getAddressByCoordinates(coords) {
        if (!this.geocoder) return;

        this.geocoder(coords).then((res) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
                const address = firstGeoObject.getAddressLine();
                console.log('Адрес по координатам:', address);
                
                // Обновляем поля адреса в форме
                this.updateAddressFields(address);
            }
        });
    }

    /**
     * Поиск координат по адресу
     * @param {string} address - Адрес для поиска
     */
    searchByAddress(address) {
        if (!this.geocoder || !address.trim()) return;

        console.log('Поиск координат для адреса:', address);

        this.geocoder(address).then((res) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
                const coords = firstGeoObject.geometry.getCoordinates();
                console.log('Найдены координаты:', coords);
                
                // Перемещаем карту к найденным координатам
                this.map.setCenter(coords, 15);
                
                // Создаем метку
                if (this.placemark) {
                    this.map.geoObjects.remove(this.placemark);
                }
                
                this.placemark = new ymaps.Placemark(coords, {
                    balloonContent: address
                }, {
                    preset: 'islands#redDotIcon',
                    draggable: true
                });
                
                this.map.geoObjects.add(this.placemark);
                this.selectedCoordinates = coords;
            } else {
                console.log('Адрес не найден');
                window.app.showAlert('Адрес не найден на карте', 'warning');
            }
        });
    }

    /**
     * Обновление полей адреса в форме
     * @param {string} address - Полный адрес
     */
    updateAddressFields(address) {
        // Парсим адрес и заполняем поля
        // Это упрощенная версия - в реальном проекте нужен более сложный парсинг
        const addressParts = address.split(', ');
        
        // Обновляем поля адреса
        const cityField = document.getElementById('city');
        const streetField = document.getElementById('street');
        const houseField = document.getElementById('house');
        
        if (cityField && addressParts.length > 0) {
            cityField.value = addressParts[0] || '';
        }
        
        if (streetField && addressParts.length > 1) {
            streetField.value = addressParts[1] || '';
        }
        
        if (houseField && addressParts.length > 2) {
            houseField.value = addressParts[2] || '';
        }
    }

    /**
     * Получение выбранных координат
     * @returns {Array|null} Координаты [широта, долгота] или null
     */
    getSelectedCoordinates() {
        return this.selectedCoordinates;
    }

    /**
     * Установка координат
     * @param {Array} coords - Координаты [широта, долгота]
     */
    setCoordinates(coords) {
        if (!this.map || !coords) return;

        this.map.setCenter(coords, 15);
        
        if (this.placemark) {
            this.map.geoObjects.remove(this.placemark);
        }
        
        this.placemark = new ymaps.Placemark(coords, {
            balloonContent: 'Выбранная точка'
        }, {
            preset: 'islands#redDotIcon',
            draggable: true
        });
        
        this.map.geoObjects.add(this.placemark);
        this.selectedCoordinates = coords;
    }

    /**
     * Очистка карты
     */
    clear() {
        if (this.placemark) {
            this.map.geoObjects.remove(this.placemark);
            this.placemark = null;
        }
        this.selectedCoordinates = null;
    }
}

// Создаем глобальный экземпляр менеджера карт
window.mapManager = new MapManager();

/**
 * Поиск адреса на карте
 */
function searchAddressOnMap() {
    const addressInput = document.getElementById('addressSearch');
    if (addressInput && addressInput.value.trim()) {
        window.mapManager.searchByAddress(addressInput.value.trim());
    } else {
        window.app.showAlert('Введите адрес для поиска', 'warning');
    }
}

// Инициализация карты при открытии модального окна
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем карту при открытии модального окна создания заказа
    const newOrderModal = document.getElementById('newOrderModal');
    if (newOrderModal) {
        newOrderModal.addEventListener('shown.bs.modal', () => {
            console.log('Модальное окно открыто, инициализируем карту');
            setTimeout(() => {
                window.mapManager.initMap('map');
            }, 100);
        });

        newOrderModal.addEventListener('hidden.bs.modal', () => {
            console.log('Модальное окно закрыто, очищаем карту');
            window.mapManager.clear();
        });
    }
});

/**
 * Добавление нового замера
 */
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

/**
 * Сохранение замера
 */
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
        window.app.showAlert('Заполните обязательные поля', 'warning');
        return;
    }
    
    // Вычисляем общую стоимость
    const totalPrice = measurement.quantity * measurement.unitPrice;
    
    console.log('Сохранение замера:', measurement);
    console.log('Общая стоимость:', totalPrice);
    
    // Добавляем замер в список
    addMeasurementToList(measurement);
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('measurementModal'));
    modal.hide();
    
    window.app.showAlert('Замер добавлен!', 'success');
}

/**
 * Добавление замера в список
 */
function addMeasurementToList(measurement) {
    const measurementsList = document.getElementById('measurementsList');
    
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

/**
 * Получение текста типа работы
 */
function getWorkTypeText(type) {
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
function removeMeasurement(button) {
    if (confirm('Удалить этот замер?')) {
        button.closest('.measurement-item').remove();
    }
}

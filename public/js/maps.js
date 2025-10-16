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

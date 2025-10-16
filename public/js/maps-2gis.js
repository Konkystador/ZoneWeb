/**
 * Модуль для работы с картами 2ГИС
 * Обеспечивает функциональность выбора точки на карте и геокодирования адресов
 */

class MapManager2GIS {
    constructor() {
        this.map = null;
        this.marker = null;
        this.selectedCoordinates = null;
        this.geocoder = null;
    }

    /**
     * Инициализация карты 2ГИС
     * @param {string} containerId - ID контейнера для карты
     * @param {Array} center - Координаты центра карты [долгота, широта]
     */
    initMap(containerId, center = [37.6176, 55.7558]) {
        console.log('Инициализация карты 2ГИС в контейнере:', containerId);
        
        // Проверяем, что API 2ГИС загружен
        if (typeof DG === 'undefined') {
            console.error('API 2ГИС не загружен');
            return;
        }

        // Инициализируем карту
        this.map = DG.map(containerId, {
            center: center,
            zoom: 10
        });

        // Добавляем контролы
        DG.control.zoom().addTo(this.map);
        DG.control.search().addTo(this.map);

        // Обработчик клика по карте
        this.map.on('click', (event) => {
            this.onMapClick(event);
        });

        console.log('Карта 2ГИС инициализирована');
    }

    /**
     * Обработчик клика по карте
     * @param {Object} event - Событие клика
     */
    onMapClick(event) {
        const coords = [event.latlng.lng, event.latlng.lat];
        console.log('Клик по карте, координаты:', coords);
        
        // Удаляем предыдущую метку
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        // Создаем новую метку
        this.marker = DG.marker(coords, {
            icon: DG.icon({
                iconUrl: 'https://cdn.2gis.com/images/marker.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })
        }).addTo(this.map);

        // Сохраняем координаты
        this.selectedCoordinates = coords;

        // Получаем адрес по координатам
        this.getAddressByCoordinates(coords);
    }

    /**
     * Получение адреса по координатам
     * @param {Array} coords - Координаты [долгота, широта]
     */
    getAddressByCoordinates(coords) {
        if (!DG.geocoder) return;

        DG.geocoder(coords[0], coords[1]).then((result) => {
            if (result && result.result) {
                const address = result.result.address;
                console.log('Адрес по координатам:', address);
                
                // Обновляем поля адреса в форме
                this.updateAddressFields(address);
            }
        }).catch((error) => {
            console.error('Ошибка геокодирования:', error);
        });
    }

    /**
     * Поиск координат по адресу
     * @param {string} address - Адрес для поиска
     */
    searchByAddress(address) {
        if (!address.trim()) return;

        console.log('Поиск координат для адреса:', address);

        DG.geocoder(address).then((result) => {
            if (result && result.result) {
                const coords = [result.result.lon, result.result.lat];
                console.log('Найдены координаты:', coords);
                
                // Перемещаем карту к найденным координатам
                this.map.setView(coords, 15);
                
                // Создаем метку
                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }
                
                this.marker = DG.marker(coords, {
                    icon: DG.icon({
                        iconUrl: 'https://cdn.2gis.com/images/marker.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                }).addTo(this.map);
                
                this.selectedCoordinates = coords;
            } else {
                console.log('Адрес не найден');
                window.app.showAlert('Адрес не найден на карте', 'warning');
            }
        }).catch((error) => {
            console.error('Ошибка поиска адреса:', error);
            window.app.showAlert('Ошибка поиска адреса', 'danger');
        });
    }

    /**
     * Обновление полей адреса в форме
     * @param {string} address - Полный адрес
     */
    updateAddressFields(address) {
        // Парсим адрес и заполняем поля
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
     * @returns {Array|null} Координаты [долгота, широта] или null
     */
    getSelectedCoordinates() {
        return this.selectedCoordinates;
    }

    /**
     * Установка координат
     * @param {Array} coords - Координаты [долгота, широта]
     */
    setCoordinates(coords) {
        if (!this.map || !coords) return;

        this.map.setView(coords, 15);
        
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        
        this.marker = DG.marker(coords, {
            icon: DG.icon({
                iconUrl: 'https://cdn.2gis.com/images/marker.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })
        }).addTo(this.map);
        
        this.selectedCoordinates = coords;
    }

    /**
     * Очистка карты
     */
    clear() {
        if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
        this.selectedCoordinates = null;
    }
}

// Создаем глобальный экземпляр менеджера карт
window.mapManager = new MapManager2GIS();

// Инициализация карты при открытии модального окна
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем карту при открытии модального окна создания заказа
    const newOrderModal = document.getElementById('newOrderModal');
    if (newOrderModal) {
        newOrderModal.addEventListener('shown.bs.modal', () => {
            console.log('Модальное окно открыто, инициализируем карту 2ГИС');
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

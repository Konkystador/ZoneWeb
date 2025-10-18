// ==================== СИСТЕМА УВЕДОМЛЕНИЙ ====================

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Создаем контейнер для уведомлений
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'position-fixed top-0 end-0 p-3';
        this.container.style.zIndex = '1060';
        document.body.appendChild(this.container);
    }

    // Показать уведомление
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `toast show fade-in`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.setAttribute('aria-atomic', 'true');

        const icon = this.getIcon(type);
        const bgClass = this.getBackgroundClass(type);

        notification.innerHTML = `
            <div class="toast-header ${bgClass} text-white">
                <i class="${icon} me-2"></i>
                <strong class="me-auto">${this.getTitle(type)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        this.container.appendChild(notification);

        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        // Обработчик закрытия
        const closeBtn = notification.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        return notification;
    }

    // Скрыть уведомление
    hide(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // Получить иконку для типа уведомления
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            loading: 'fas fa-spinner fa-spin'
        };
        return icons[type] || icons.info;
    }

    // Получить класс фона для типа уведомления
    getBackgroundClass(type) {
        const classes = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info',
            loading: 'bg-primary'
        };
        return classes[type] || classes.info;
    }

    // Получить заголовок для типа уведомления
    getTitle(type) {
        const titles = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Предупреждение',
            info: 'Информация',
            loading: 'Загрузка'
        };
        return titles[type] || titles.info;
    }

    // Методы для разных типов уведомлений
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    loading(message, duration = 0) {
        return this.show(message, 'loading', duration);
    }

    // Очистить все уведомления
    clear() {
        const notifications = this.container.querySelectorAll('.toast');
        notifications.forEach(notification => {
            this.hide(notification);
        });
    }
}

// Создаем глобальный экземпляр
window.notifications = new NotificationSystem();

// Добавляем CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }
    
    .fade-out {
        animation: fadeOut 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .toast {
        margin-bottom: 10px;
        min-width: 300px;
        max-width: 400px;
    }
    
    @media (max-width: 768px) {
        .toast {
            min-width: 250px;
            max-width: 300px;
        }
    }
`;
document.head.appendChild(style);

// Экспортируем для использования в других модулях
window.NotificationSystem = NotificationSystem;

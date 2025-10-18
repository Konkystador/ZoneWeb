// ==================== СИСТЕМА УПРАВЛЕНИЯ ТЕМАМИ ====================

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Загружаем сохраненную тему
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        console.log('🎨 Менеджер тем инициализирован:', this.currentTheme);
    }

    // Применить тему
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Обновляем иконку переключателя
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        // Уведомляем о смене темы
        if (window.notifications) {
            window.notifications.info(`Тема изменена на ${theme === 'dark' ? 'темную' : 'светлую'}`);
        }
    }

    // Переключить тему
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    // Создать переключатель темы
    createThemeToggle() {
        // Удаляем существующий переключатель
        const existingToggle = document.getElementById('themeToggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Создаем новый переключатель
        const toggle = document.createElement('button');
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `<i class="fas ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        toggle.title = `Переключить на ${this.currentTheme === 'dark' ? 'светлую' : 'темную'} тему`;
        
        // Добавляем обработчик клика
        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Добавляем в DOM
        document.body.appendChild(toggle);
    }

    // Получить текущую тему
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Установить тему
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
        }
    }

    // Проверить, поддерживается ли тема
    isThemeSupported(theme) {
        return theme === 'light' || theme === 'dark';
    }

    // Получить доступные темы
    getAvailableThemes() {
        return [
            { id: 'light', name: 'Светлая', icon: 'fas fa-sun' },
            { id: 'dark', name: 'Темная', icon: 'fas fa-moon' }
        ];
    }

    // Сбросить тему к умолчанию
    resetTheme() {
        this.applyTheme('light');
    }
}

// Создаем глобальный экземпляр
window.themeManager = new ThemeManager();

// Экспортируем для использования в других модулях
window.ThemeManager = ThemeManager;

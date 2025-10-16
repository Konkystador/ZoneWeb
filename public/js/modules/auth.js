/**
 * Модуль авторизации
 * Управляет входом, выходом и проверкой прав доступа
 */

class AuthModule {
    constructor(app) {
        this.app = app;
    }

    /**
     * Проверка авторизации пользователя при загрузке страницы
     */
    async checkAuth() {
        try {
            console.log('Проверка авторизации...');
            const response = await fetch('/api/auth/check');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ответ сервера:', response.status, response.statusText);
                console.log('Данные ответа:', data);
                
                if (data.success) {
                    console.log('Пользователь авторизован:', data.user);
                    this.app.currentUser = data.user;
                    this.showMainApp();
                    this.setupRoleBasedUI();
                } else {
                    this.showLoginScreen();
                }
            } else {
                console.log('Пользователь не авторизован');
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            this.showLoginScreen();
        }
    }

    /**
     * Авторизация пользователя
     */
    async login(username, password) {
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
                    this.app.currentUser = data.user;
                    this.showMainApp();
                    this.setupRoleBasedUI();
                    this.app.showAlert('Добро пожаловать!', 'success');
                } else {
                    this.app.showAlert(data.error || 'Ошибка авторизации', 'danger');
                }
            } else {
                const error = await response.json();
                this.app.showAlert(error.error || 'Ошибка авторизации', 'danger');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    /**
     * Выход из системы
     */
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                this.app.currentUser = null;
                this.showLoginScreen();
                this.app.showAlert('Вы вышли из системы', 'info');
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }

    /**
     * Показать экран входа
     */
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }

    /**
     * Показать основное приложение
     */
    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userName').textContent = this.app.currentUser.full_name || this.app.currentUser.username;
    }

    /**
     * Настройка интерфейса в зависимости от роли пользователя
     */
    setupRoleBasedUI() {
        const userRole = this.app.currentUser.role;
        
        // Показываем/скрываем элементы в зависимости от роли
        const adminMenu = document.getElementById('adminMenu');
        if (adminMenu) {
            adminMenu.style.display = userRole === 'admin' ? 'block' : 'none';
        }
    }
}

// Экспорт для использования в основном приложении
window.AuthModule = AuthModule;

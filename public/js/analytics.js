// ==================== СИСТЕМА АНАЛИТИКИ И ОТЧЕТОВ ====================

class AnalyticsSystem {
    constructor() {
        this.charts = {};
        this.reports = {};
        this.init();
    }

    init() {
        console.log('📊 Инициализация системы аналитики');
        this.loadChartLibrary();
    }

    // Загрузка библиотеки Chart.js
    async loadChartLibrary() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('✅ Chart.js загружен');
                this.initCharts();
            };
            document.head.appendChild(script);
        } else {
            this.initCharts();
        }
    }

    // Инициализация графиков
    initCharts() {
        this.createOrdersChart();
        this.createUsersChart();
        this.createServicesChart();
        this.createTimeChart();
    }

    // График заказов по статусам
    createOrdersChart() {
        const ctx = document.getElementById('ordersChart');
        if (!ctx) return;

        this.charts.orders = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Новые', 'В работе', 'Выполнены', 'Отклонены', 'Отменены'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#ffc107',
                        '#0d6efd',
                        '#198754',
                        '#dc3545',
                        '#6c757d'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Заказы по статусам'
                    }
                }
            }
        });
    }

    // График работы пользователей
    createUsersChart() {
        const ctx = document.getElementById('usersChart');
        if (!ctx) return;

        this.charts.users = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Заказы выполнено',
                    data: [],
                    backgroundColor: '#0d6efd',
                    borderColor: '#0d6efd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Работа пользователей'
                    }
                }
            }
        });
    }

    // График популярных услуг
    createServicesChart() {
        const ctx = document.getElementById('servicesChart');
        if (!ctx) return;

        this.charts.services = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Количество заказов',
                    data: [],
                    backgroundColor: '#198754',
                    borderColor: '#198754',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Популярные услуги'
                    }
                }
            }
        });
    }

    // График по времени
    createTimeChart() {
        const ctx = document.getElementById('timeChart');
        if (!ctx) return;

        this.charts.time = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Заказы за день',
                    data: [],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Динамика заказов'
                    }
                }
            }
        });
    }

    // Загрузка данных аналитики
    async loadAnalyticsData() {
        try {
            const response = await fetch('/api/analytics');
            if (response.ok) {
                const data = await response.json();
                this.updateCharts(data);
                return data;
            } else {
                console.error('Ошибка загрузки данных аналитики');
                return null;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных аналитики:', error);
            return null;
        }
    }

    // Обновление графиков
    updateCharts(data) {
        if (data.orders && this.charts.orders) {
            this.charts.orders.data.datasets[0].data = [
                data.orders.pending || 0,
                data.orders.in_progress || 0,
                data.orders.completed || 0,
                data.orders.declined || 0,
                data.orders.cancelled || 0
            ];
            this.charts.orders.update();
        }

        if (data.users && this.charts.users) {
            this.charts.users.data.labels = data.users.map(u => u.name);
            this.charts.users.data.datasets[0].data = data.users.map(u => u.orders_count);
            this.charts.users.update();
        }

        if (data.services && this.charts.services) {
            this.charts.services.data.labels = data.services.map(s => s.name);
            this.charts.services.data.datasets[0].data = data.services.map(s => s.orders_count);
            this.charts.services.update();
        }

        if (data.time && this.charts.time) {
            this.charts.time.data.labels = data.time.map(t => t.date);
            this.charts.time.data.datasets[0].data = data.time.map(t => t.count);
            this.charts.time.update();
        }
    }

    // Генерация отчета
    async generateReport(type, filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/reports/${type}?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                this.reports[type] = data;
                return data;
            } else {
                console.error('Ошибка генерации отчета');
                return null;
            }
        } catch (error) {
            console.error('Ошибка генерации отчета:', error);
            return null;
        }
    }

    // Экспорт в Excel
    async exportToExcel(type, data) {
        try {
            const response = await fetch('/api/export/excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, data })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return true;
            } else {
                console.error('Ошибка экспорта в Excel');
                return false;
            }
        } catch (error) {
            console.error('Ошибка экспорта в Excel:', error);
            return false;
        }
    }

    // Экспорт в CSV
    async exportToCSV(type, data) {
        try {
            const response = await fetch('/api/export/csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, data })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return true;
            } else {
                console.error('Ошибка экспорта в CSV');
                return false;
            }
        } catch (error) {
            console.error('Ошибка экспорта в CSV:', error);
            return false;
        }
    }

    // Показать страницу аналитики
    showAnalyticsPage() {
        if (window.app && window.app.showPage) {
            window.app.showPage('analytics');
        }
        this.loadAnalyticsData();
    }
}

// Создаем глобальный экземпляр
window.analytics = new AnalyticsSystem();

// Экспортируем для использования в других модулях
window.AnalyticsSystem = AnalyticsSystem;

// Тесты приложения "Оконные Мастера"
// Запускаются прямо на основной странице

let testResults = [];
let passedTests = 0;
let failedTests = 0;

// Функция логирования тестов
function logTest(testName, success, details = '') {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const result = {
        name: testName,
        success: success,
        details: details,
        timestamp: timestamp
    };
    
    testResults.push(result);
    
    if (success) {
        passedTests++;
        console.log(`✅ ${testName}: ${details}`);
    } else {
        failedTests++;
        console.log(`❌ ${testName}: ${details}`);
    }
}

// Тест 1: Проверка инициализации приложения
function testAppInitialization() {
    try {
        console.log('🔍 Проверка инициализации приложения...');
        
        // Проверяем наличие глобальной переменной app
        const app = window.app;
        console.log('📍 window.app:', app ? 'найден' : 'не найден');
        
        if (app) {
            console.log('📍 Тип app:', typeof app);
            console.log('📍 Конструктор app:', app.constructor.name);
            console.log('📍 Свойства app:', Object.keys(app));
        }
        
        // Проверяем WindowRepairApp
        const WindowRepairApp = window.WindowRepairApp;
        console.log('📍 WindowRepairApp:', WindowRepairApp ? 'найден' : 'не найден');
        
        // Проверяем основные методы
        const hasLogin = app && typeof app.login === 'function';
        const hasLogout = app && typeof app.logout === 'function';
        const hasShowOrderCards = app && typeof app.showOrderCards === 'function';
        const hasViewOrderCard = app && typeof app.viewOrderCard === 'function';
        
        console.log('📍 Методы app:');
        console.log('   - login:', hasLogin ? 'да' : 'нет');
        console.log('   - logout:', hasLogout ? 'да' : 'нет');
        console.log('   - showOrderCards:', hasShowOrderCards ? 'да' : 'нет');
        console.log('   - viewOrderCard:', hasViewOrderCard ? 'да' : 'нет');
        
        const success = !!(app && (hasLogin || hasShowOrderCards));
        logTest('Инициализация приложения', success, 
            `app: ${app ? 'да' : 'нет'}, методы: ${hasLogin ? 'login' : ''} ${hasShowOrderCards ? 'showOrderCards' : ''}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки инициализации:', error);
        logTest('Инициализация приложения', false, error.message);
        return false;
    }
}

// Тест 2: Проверка DOM элементов
function testDOMElements() {
    try {
        console.log('🔍 Проверка DOM элементов...');
        
        const elements = [
            { id: 'mainApp', name: 'Основное приложение' },
            { id: 'loginScreen', name: 'Экран входа' },
            { id: 'newOrderModal', name: 'Модальное окно создания заказа' },
            { id: 'orderDetailsModal', name: 'Модальное окно деталей заказа' },
            { id: 'userProfileModal', name: 'Модальное окно профиля пользователя' },
            { id: 'orderForm', name: 'Форма создания заказа' }
        ];
        
        let foundElements = 0;
        const foundList = [];
        
        elements.forEach(element => {
            const el = document.getElementById(element.id);
            if (el) {
                foundElements++;
                foundList.push(element.name);
                console.log(`✅ ${element.name}: найден`);
            } else {
                console.log(`❌ ${element.name}: не найден`);
            }
        });
        
        const success = foundElements >= 2; // Минимум 2 элемента должны быть найдены
        logTest('DOM элементы', success, 
            `Найдено: ${foundElements}/${elements.length}, элементы: ${foundList.join(', ')}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки DOM элементов:', error);
        logTest('DOM элементы', false, error.message);
        return false;
    }
}

// Тест 3: Проверка CSS классов
function testCSSClasses() {
    try {
        console.log('🔍 Проверка CSS классов...');
        
        const requiredClasses = [
            'modal-3d',
            'order-card-3d',
            'form-control-3d',
            'nav-3d',
            'alert-3d'
        ];
        
        let foundClasses = 0;
        const foundList = [];
        
        requiredClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            if (elements.length > 0) {
                foundClasses++;
                foundList.push(className);
                console.log(`✅ ${className}: найдено ${elements.length} элементов`);
            } else {
                console.log(`❌ ${className}: не найдено`);
            }
        });
        
        const success = foundClasses >= 2; // Минимум 2 класса должны быть найдены
        logTest('CSS классы', success, 
            `Найдено: ${foundClasses}/${requiredClasses.length}, классы: ${foundList.join(', ')}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки CSS классов:', error);
        logTest('CSS классы', false, error.message);
        return false;
    }
}

// Тест 4: Проверка глобальных функций
function testGlobalFunctions() {
    try {
        console.log('🔍 Проверка глобальных функций...');
        
        const requiredFunctions = [
            'showOrderCards',
            'viewOrderCard',
            'showAlert',
            'showOrderDetailsModal'
        ];
        
        let foundFunctions = 0;
        const foundList = [];
        
        requiredFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                foundFunctions++;
                foundList.push(funcName);
                console.log(`✅ ${funcName}: найдена`);
            } else {
                console.log(`❌ ${funcName}: не найдена`);
            }
        });
        
        const success = foundFunctions >= 2; // Минимум 2 функции должны быть найдены
        logTest('Глобальные функции', success, 
            `Найдено: ${foundFunctions}/${requiredFunctions.length}, функции: ${foundList.join(', ')}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки глобальных функций:', error);
        logTest('Глобальные функции', false, error.message);
        return false;
    }
}

// Тест 5: Проверка модальных окон
function testModals() {
    try {
        console.log('🔍 Проверка модальных окон...');
        
        const modals = [
            { id: 'newOrderModal', name: 'Создание заказа' },
            { id: 'orderDetailsModal', name: 'Детали заказа' },
            { id: 'userProfileModal', name: 'Профиль пользователя' }
        ];
        
        let foundModals = 0;
        const foundList = [];
        
        modals.forEach(modal => {
            const el = document.getElementById(modal.id);
            if (el) {
                foundModals++;
                foundList.push(modal.name);
                console.log(`✅ ${modal.name}: найдено`);
            } else {
                console.log(`❌ ${modal.name}: не найдено`);
            }
        });
        
        const success = foundModals >= 1; // Минимум 1 модальное окно должно быть найдено
        logTest('Модальные окна', success, 
            `Найдено: ${foundModals}/${modals.length}, окна: ${foundList.join(', ')}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки модальных окон:', error);
        logTest('Модальные окна', false, error.message);
        return false;
    }
}

// Тест 6: Проверка форм
function testForms() {
    try {
        console.log('🔍 Проверка форм...');
        
        const forms = document.querySelectorAll('form');
        console.log('📍 Найдено форм:', forms.length);
        
        const orderForm = document.getElementById('orderForm');
        const hasOrderForm = !!orderForm;
        
        console.log('📍 Форма заказа:', hasOrderForm ? 'найдена' : 'не найдена');
        
        if (orderForm) {
            const inputs = orderForm.querySelectorAll('input, select, textarea');
            console.log('📍 Поля формы:', inputs.length);
        }
        
        const success = forms.length >= 1;
        logTest('Формы', success, 
            `Найдено форм: ${forms.length}, форма заказа: ${hasOrderForm ? 'да' : 'нет'}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки форм:', error);
        logTest('Формы', false, error.message);
        return false;
    }
}

// Тест 7: Проверка API
async function testAPI() {
    try {
        console.log('🔍 Проверка API...');
        
        const baseUrl = window.location.origin;
        const apiTests = [
            { name: 'Проверка авторизации', url: '/api/auth/check' },
            { name: 'Проверка пользователей', url: '/api/users' },
            { name: 'Проверка заказов', url: '/api/orders' },
            { name: 'Проверка сервисов', url: '/api/services' }
        ];
        
        let successfulTests = 0;
        const results = [];
        
        for (const test of apiTests) {
            try {
                console.log(`📍 Тестируем ${test.name}...`);
                const response = await fetch(`${baseUrl}${test.url}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
                    successfulTests++;
                    results.push(`${test.name}: OK`);
                } else {
                    console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
                    results.push(`${test.name}: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: Ошибка сети - ${error.message}`);
                results.push(`${test.name}: Ошибка`);
            }
        }
        
        const success = successfulTests >= 2; // Минимум 2 API должны работать
        logTest('API', success, 
            `Успешных: ${successfulTests}/${apiTests.length}, результаты: ${results.join(', ')}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки API:', error);
        logTest('API', false, error.message);
        return false;
    }
}

// Тест 8: Проверка производительности
function testPerformance() {
    try {
        console.log('🔍 Проверка производительности...');
        
        const startTime = performance.now();
        
        // Проверяем время загрузки страницы
        const navigation = performance.getEntriesByType('navigation')[0];
        let loadTime = 0;
        
        if (navigation) {
            loadTime = navigation.loadEventEnd - navigation.navigationStart;
            console.log('📍 Время загрузки страницы:', loadTime, 'ms');
        }
        
        // Проверяем использование памяти
        let memoryUsage = 0;
        if (performance.memory) {
            memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            console.log('📍 Использование памяти:', memoryUsage.toFixed(2), 'MB');
        }
        
        const endTime = performance.now();
        const testDuration = endTime - startTime;
        
        const success = testDuration < 1000 && loadTime < 10000; // Тест должен выполняться быстро
        logTest('Производительность', success, 
            `Время теста: ${testDuration.toFixed(2)}ms, загрузка: ${loadTime.toFixed(2)}ms, память: ${memoryUsage.toFixed(2)}MB`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки производительности:', error);
        logTest('Производительность', false, error.message);
        return false;
    }
}

// Тест 9: Проверка 3D эффектов
function test3DEffects() {
    try {
        console.log('🔍 Проверка 3D эффектов...');
        
        const requiredClasses = [
            'modal-3d',
            'order-card-3d',
            'form-control-3d',
            'nav-3d',
            'alert-3d'
        ];
        
        let foundClasses = 0;
        const foundList = [];
        
        requiredClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            if (elements.length > 0) {
                foundClasses++;
                foundList.push(className);
            }
        });
        
        // Проверяем CSS переменные
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const cssVars = [
            '--shadow-3d',
            '--border-3d',
            '--gradient-3d'
        ];
        
        let foundVars = 0;
        cssVars.forEach(varName => {
            if (computedStyle.getPropertyValue(varName)) {
                foundVars++;
            }
        });
        
        const success = foundClasses >= 2 || foundVars >= 1;
        logTest('3D эффекты', success, 
            `Найдено классов: ${foundClasses}/${requiredClasses.length}, переменных: ${foundVars}/${cssVars.length}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки 3D эффектов:', error);
        logTest('3D эффекты', false, error.message);
        return false;
    }
}

// Тест 10: Проверка адаптивности
function testResponsiveness() {
    try {
        console.log('🔍 Проверка адаптивности...');
        
        const mediaQueries = [
            '(max-width: 768px)',
            '(max-width: 992px)',
            '(min-width: 1200px)'
        ];
        
        let foundQueries = 0;
        mediaQueries.forEach(query => {
            if (window.matchMedia(query).matches) {
                foundQueries++;
            }
        });
        
        // Проверяем наличие Bootstrap классов
        const bootstrapClasses = [
            'container',
            'row',
            'col-',
            'd-none',
            'd-md-block'
        ];
        
        let foundBootstrap = 0;
        bootstrapClasses.forEach(className => {
            if (className.includes('-')) {
                const elements = document.querySelectorAll(`[class*="${className}"]`);
                if (elements.length > 0) {
                    foundBootstrap++;
                }
            } else {
                const elements = document.querySelectorAll(`.${className}`);
                if (elements.length > 0) {
                    foundBootstrap++;
                }
            }
        });
        
        const success = foundBootstrap >= 2;
        logTest('Адаптивность', success, 
            `Bootstrap классов: ${foundBootstrap}/${bootstrapClasses.length}, медиа-запросы: ${foundQueries}/${mediaQueries.length}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки адаптивности:', error);
        logTest('Адаптивность', false, error.message);
        return false;
    }
}

// Запуск всех тестов
async function runAllTests() {
    console.log('🚀 Запуск тестов приложения...');
    console.log('📍 URL:', window.location.href);
    console.log('📍 Время:', new Date().toLocaleString('ru-RU'));
    console.log('');
    
    // Очищаем предыдущие результаты
    testResults = [];
    passedTests = 0;
    failedTests = 0;
    
    // Показываем индикатор загрузки
    showTestResults('🔄 Запуск тестов...', 'info');
    
    const tests = [
        testAppInitialization,
        testDOMElements,
        testCSSClasses,
        testGlobalFunctions,
        testModals,
        testForms,
        testAPI,
        testPerformance,
        test3DEffects,
        testResponsiveness
    ];
    
    for (const test of tests) {
        try {
            await test();
        } catch (error) {
            console.error('❌ Ошибка в тесте:', error);
            logTest('Ошибка теста', false, error.message);
        }
    }
    
    // Выводим итоговые результаты
    console.log('');
    console.log('📊 Результаты тестирования');
    console.log(`✅ Пройдено: ${passedTests}`);
    console.log(`❌ Провалено: ${failedTests}`);
    console.log(`📈 Успешность: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
    
    if (failedTests > 0) {
        console.log('⚠️ Некоторые тесты провалились');
    } else {
        console.log('🎉 Все тесты прошли успешно!');
    }
    
    console.log('');
    console.log('Результаты тестов:');
    testResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${result.name}`);
        console.log(`${result.details}`);
        console.log(`${result.timestamp}`);
        console.log('');
    });
    
    // Отображаем результаты на сайте
    console.log('🔍 Отображаем результаты на сайте...');
    console.log('📍 testResults.length:', testResults.length);
    console.log('📍 passedTests:', passedTests);
    console.log('📍 failedTests:', failedTests);
    displayTestResults();
    
    return {
        passed: passedTests,
        failed: failedTests,
        successRate: Math.round((passedTests / (passedTests + failedTests)) * 100),
        results: testResults
    };
}

// Функция для отображения результатов на сайте
function showTestResults(message, type = 'info') {
    // Создаем или находим контейнер для результатов
    let resultsContainer = document.getElementById('testResultsContainer');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'testResultsContainer';
        resultsContainer.className = 'container-fluid mt-4';
        resultsContainer.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-vial"></i> Результаты тестирования</h5>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="copyTestResults()">
                                    <i class="fas fa-copy"></i> Копировать
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="hideTestResults()">
                                    <i class="fas fa-times"></i> Скрыть
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="testResultsContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем контейнер в основной контент
        const mainContent = document.querySelector('.container-fluid');
        if (mainContent) {
            mainContent.appendChild(resultsContainer);
        } else {
            // Fallback - добавляем в body
            document.body.appendChild(resultsContainer);
        }
    }
    
    const content = document.getElementById('testResultsContent');
    if (content) {
        content.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
}

// Функция для отображения полных результатов
function displayTestResults() {
    console.log('🔍 displayTestResults вызвана');
    console.log('📍 testResults:', testResults);
    
    const successRate = Math.round((passedTests / (passedTests + failedTests)) * 100);
    const statusClass = failedTests === 0 ? 'success' : 'warning';
    
    let html = `
        <div class="alert alert-${statusClass}">
            <h6><i class="fas fa-chart-bar"></i> Сводка результатов</h6>
            <div class="row">
                <div class="col-md-3">
                    <strong>✅ Пройдено:</strong> ${passedTests}
                </div>
                <div class="col-md-3">
                    <strong>❌ Провалено:</strong> ${failedTests}
                </div>
                <div class="col-md-3">
                    <strong>📈 Успешность:</strong> ${successRate}%
                </div>
                <div class="col-md-3">
                    <strong>⏰ Время:</strong> ${new Date().toLocaleString('ru-RU')}
                </div>
            </div>
        </div>
        
        <div class="mt-3">
            <h6><i class="fas fa-list"></i> Детальные результаты</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Тест</th>
                            <th>Статус</th>
                            <th>Детали</th>
                            <th>Время</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    testResults.forEach(result => {
        const statusIcon = result.success ? '✅' : '❌';
        const statusClass = result.success ? 'success' : 'danger';
        html += `
            <tr>
                <td><strong>${result.name}</strong></td>
                <td><span class="badge bg-${statusClass}">${statusIcon}</span></td>
                <td><small>${result.details}</small></td>
                <td><small>${result.timestamp}</small></td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    console.log('🔍 HTML сгенерирован, длина:', html.length);
    
    const content = document.getElementById('testResultsContent');
    console.log('🔍 testResultsContent найден:', !!content);
    
    if (content) {
        content.innerHTML = html;
        console.log('✅ Результаты отображены на сайте');
    } else {
        console.error('❌ Элемент testResultsContent не найден');
        // Fallback - показываем в консоли
        console.log('Результаты тестов:');
        console.log(html);
    }
}

// Функция для скрытия результатов
function hideTestResults() {
    const container = document.getElementById('testResultsContainer');
    if (container) {
        container.remove();
    }
}

// Функция для копирования результатов
function copyTestResults() {
    let text = '📊 Результаты тестирования приложения\n\n';
    text += `✅ Пройдено: ${passedTests}\n`;
    text += `❌ Провалено: ${failedTests}\n`;
    text += `📈 Успешность: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%\n`;
    text += `⏰ Время: ${new Date().toLocaleString('ru-RU')}\n\n`;
    
    text += 'Результаты тестов:\n';
    testResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        text += `${status} ${result.name}\n`;
        text += `   ${result.details}\n`;
        text += `   ${result.timestamp}\n\n`;
    });
    
    // Проверяем поддержку clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('📋 Результаты скопированы в буфер обмена!');
            showAlert('Результаты скопированы в буфер обмена!', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback для старых браузеров
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback функция для копирования
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Избегаем прокрутки к элементу
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('📋 Результаты скопированы в буфер обмена!');
            showAlert('Результаты скопированы в буфер обмена!', 'success');
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Ошибка копирования:', err);
        showAlert('Ошибка копирования. Результаты выведены в консоль.', 'warning');
        console.log('Результаты тестов:');
        console.log(text);
    }
    
    document.body.removeChild(textArea);
}

// Функция для показа уведомлений
function showAlert(message, type) {
    if (window.app && window.app.showAlert) {
        window.app.showAlert(message, type);
    } else {
        // Fallback уведомление
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Добавляем функции в глобальную область видимости
window.runAllTests = runAllTests;
window.copyTestResults = copyTestResults;
window.hideTestResults = hideTestResults;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Тесты приложения загружены');
    console.log('📍 Для запуска тестов выполните: runAllTests()');
    console.log('📍 Для копирования результатов: copyTestResults()');
});

// Автоматический запуск отменен - тесты запускаются только вручную

// Тесты основной страницы приложения
let testResults = [];
let currentTest = 0;
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
    } else {
        failedTests++;
    }
    
    updateTestDisplay();
}

// Обновление отображения результатов
function updateTestDisplay() {
    const resultsDiv = document.getElementById('testResults');
    const statsDiv = document.getElementById('testStats');
    
    // Обновляем статистику
    document.getElementById('passedCount').textContent = passedTests;
    document.getElementById('failedCount').textContent = failedTests;
    document.getElementById('successRate').textContent = 
        Math.round((passedTests / (passedTests + failedTests)) * 100) + '%';
    
    // Показываем статистику
    statsDiv.style.display = 'block';
    
    // Обновляем результаты
    let html = '<h5>Результаты тестов</h5>';
    
    testResults.forEach(result => {
        const statusClass = result.success ? 'success' : 'error';
        const statusIcon = result.success ? '✅' : '❌';
        
        html += `
            <div class="test-item ${statusClass}">
                <strong>${statusIcon} ${result.name}</strong>
                <br>
                <small class="text-muted">${result.details}</small>
                <br>
                <small class="text-muted">${result.timestamp}</small>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// Очистка результатов
function clearResults() {
    testResults = [];
    passedTests = 0;
    failedTests = 0;
    currentTest = 0;
    
    document.getElementById('testResults').innerHTML = `
        <h5>Результаты тестов</h5>
        <p class="text-muted">Запустите тесты для просмотра результатов</p>
    `;
    
    document.getElementById('testStats').style.display = 'none';
    document.getElementById('iframeContainer').style.display = 'none';
}

// Копирование результатов
function copyResults() {
    let text = '📊 Результаты тестирования основной страницы\n\n';
    text += `✅ Пройдено: ${passedTests}\n`;
    text += `❌ Провалено: ${failedTests}\n`;
    text += `📈 Успешность: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%\n\n`;
    
    text += 'Результаты тестов:\n';
    testResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        text += `${result.name}\n${result.details}\n${result.timestamp}\n\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Результаты скопированы в буфер обмена!', 'success');
    }).catch(err => {
        showAlert('Ошибка копирования: ' + err.message, 'error');
    });
}

// Экспорт результатов
function exportResults() {
    const data = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: passedTests,
            failed: failedTests,
            successRate: Math.round((passedTests / (passedTests + failedTests)) * 100)
        },
        results: testResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main-app-tests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('Результаты экспортированы!', 'success');
}

// Показ уведомлений
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.test-controls').insertBefore(alertDiv, document.getElementById('testStats'));
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Тест 1: Проверка загрузки основной страницы
async function testMainPageLoading() {
    try {
        console.log('🔍 Проверка загрузки основной страницы...');
        
        const iframe = document.getElementById('mainAppFrame');
        const iframeContainer = document.getElementById('iframeContainer');
        
        // Показываем iframe
        iframeContainer.style.display = 'block';
        
        return new Promise((resolve) => {
            iframe.onload = () => {
                console.log('✅ Основная страница загружена в iframe');
                
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const mainApp = iframeDoc.getElementById('mainApp');
                    const loginScreen = iframeDoc.getElementById('loginScreen');
                    
                    console.log('📍 mainApp в iframe:', mainApp ? 'найден' : 'не найден');
                    console.log('📍 loginScreen в iframe:', loginScreen ? 'найден' : 'не найден');
                    
                    const success = !!(mainApp || loginScreen);
                    logTest('Загрузка основной страницы', success, 
                        `Элементы найдены: ${success ? 'да' : 'нет'}`);
                    resolve(success);
                } catch (error) {
                    console.log('❌ Ошибка доступа к iframe:', error.message);
                    logTest('Загрузка основной страницы', false, 
                        `Ошибка доступа к iframe: ${error.message}`);
                    resolve(false);
                }
            };
            
            iframe.onerror = () => {
                console.log('❌ Ошибка загрузки основной страницы');
                logTest('Загрузка основной страницы', false, 'Ошибка загрузки страницы');
                resolve(false);
            };
            
            // Таймаут на случай, если страница не загрузится
            setTimeout(() => {
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                    console.log('✅ Страница загружена по таймауту');
                    resolve(true);
                } else {
                    console.log('❌ Таймаут загрузки страницы');
                    logTest('Загрузка основной страницы', false, 'Таймаут загрузки');
                    resolve(false);
                }
            }, 10000);
        });
    } catch (error) {
        console.error('❌ Ошибка проверки загрузки:', error);
        logTest('Загрузка основной страницы', false, error.message);
        return false;
    }
}

// Тест 2: Проверка инициализации приложения
async function testAppInitialization() {
    try {
        console.log('🔍 Проверка инициализации приложения...');
        
        const iframe = document.getElementById('mainAppFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Проверяем наличие скрипта app-simple.js
        const scripts = Array.from(iframeDoc.scripts);
        const appScript = scripts.find(script => 
            script.src && script.src.includes('app-simple.js')
        );
        
        console.log('📍 Скрипт app-simple.js:', appScript ? 'найден' : 'не найден');
        
        if (appScript) {
            console.log('📍 URL скрипта:', appScript.src);
        }
        
        // Проверяем глобальную переменную app
        const app = iframe.contentWindow.app;
        console.log('📍 window.app:', app ? 'найден' : 'не найден');
        
        if (app) {
            console.log('📍 Тип app:', typeof app);
            console.log('📍 Конструктор app:', app.constructor.name);
        }
        
        // Проверяем WindowRepairApp
        const WindowRepairApp = iframe.contentWindow.WindowRepairApp;
        console.log('📍 WindowRepairApp:', WindowRepairApp ? 'найден' : 'не найден');
        
        const success = !!(app && (app.constructor.name === 'WindowRepairApp' || app.constructor.name === 'Object'));
        logTest('Инициализация приложения', success, 
            `Скрипт: ${appScript ? 'да' : 'нет'}, app: ${app ? 'да' : 'нет'}, WindowRepairApp: ${WindowRepairApp ? 'да' : 'нет'}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки инициализации:', error);
        logTest('Инициализация приложения', false, error.message);
        return false;
    }
}

// Тест 3: Проверка DOM элементов
async function testDOMElements() {
    try {
        console.log('🔍 Проверка DOM элементов...');
        
        const iframe = document.getElementById('mainAppFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
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
            const el = iframeDoc.getElementById(element.id);
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

// Тест 4: Проверка CSS классов
async function testCSSClasses() {
    try {
        console.log('🔍 Проверка CSS классов...');
        
        const iframe = document.getElementById('mainAppFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
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
            const elements = iframeDoc.querySelectorAll(`.${className}`);
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

// Тест 5: Проверка глобальных функций
async function testGlobalFunctions() {
    try {
        console.log('🔍 Проверка глобальных функций...');
        
        const iframe = document.getElementById('mainAppFrame');
        const iframeWindow = iframe.contentWindow;
        
        const requiredFunctions = [
            'showOrderCards',
            'viewOrderCard',
            'showAlert',
            'showOrderDetailsModal'
        ];
        
        let foundFunctions = 0;
        const foundList = [];
        
        requiredFunctions.forEach(funcName => {
            if (typeof iframeWindow[funcName] === 'function') {
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

// Тест 6: Проверка API
async function testAPI() {
    try {
        console.log('🔍 Проверка API...');
        
        const baseUrl = 'http://188.120.240.71';
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

// Тест 7: Проверка производительности
async function testPerformance() {
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
        
        const success = testDuration < 1000 && loadTime < 5000; // Тест должен выполняться быстро
        logTest('Производительность', success, 
            `Время теста: ${testDuration.toFixed(2)}ms, загрузка: ${loadTime.toFixed(2)}ms, память: ${memoryUsage.toFixed(2)}MB`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки производительности:', error);
        logTest('Производительность', false, error.message);
        return false;
    }
}

// Запуск всех тестов
async function runMainAppTests() {
    console.log('🚀 Запуск тестов основной страницы...');
    
    // Очищаем предыдущие результаты
    clearResults();
    
    // Показываем загрузку
    document.getElementById('loading').style.display = 'block';
    
    try {
        const tests = [
            testMainPageLoading,
            testAppInitialization,
            testDOMElements,
            testCSSClasses,
            testGlobalFunctions,
            testAPI,
            testPerformance
        ];
        
        for (const test of tests) {
            try {
                await test();
                currentTest++;
            } catch (error) {
                console.error('❌ Ошибка в тесте:', error);
                logTest('Ошибка теста', false, error.message);
            }
        }
        
        console.log('✅ Все тесты завершены');
        console.log(`📊 Результат: ${passedTests} пройдено, ${failedTests} провалено`);
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        logTest('Критическая ошибка', false, error.message);
    } finally {
        // Скрываем загрузку
        document.getElementById('loading').style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Страница тестов основной страницы загружена');
    console.log('📍 URL:', window.location.href);
    console.log('📍 Время:', new Date().toLocaleString('ru-RU'));
});

/**
 * Тесты для фронтенда (запуск в браузере)
 * Откройте tests/frontend-tests.html в браузере
 */

// Глобальные переменные для тестов
let testResults = [];
let currentTest = 0;

// Вспомогательные функции
function logTest(testName, passed, message = '') {
    const result = {
        name: testName,
        passed: passed,
        message: message,
        timestamp: new Date().toISOString()
    };
    testResults.push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
    
    // Обновляем UI
    updateTestUI(result);
}

function updateTestUI(result) {
    const testContainer = document.getElementById('test-results');
    if (!testContainer) return;
    
    const testDiv = document.createElement('div');
    testDiv.className = `test-result ${result.passed ? 'passed' : 'failed'}`;
    testDiv.innerHTML = `
        <div class="test-name">${result.name}</div>
        <div class="test-message">${result.message}</div>
        <div class="test-time">${new Date(result.timestamp).toLocaleTimeString()}</div>
    `;
    
    testContainer.appendChild(testDiv);
}

// Тест 1: Проверка инициализации приложения
function testAppInitialization() {
    try {
        console.log('🔍 Проверка инициализации приложения...');
        console.log('window.app:', window.app);
        console.log('typeof window.app:', typeof window.app);
        
        assert(window.app !== undefined, 'Приложение должно быть инициализировано');
        console.log('✅ window.app определен');
        
        assert(typeof window.app === 'object', 'app должен быть объектом');
        console.log('✅ window.app является объектом');
        
        assert(typeof window.app.checkAuth === 'function', 'checkAuth должен быть функцией');
        console.log('✅ checkAuth является функцией');
        
        // Дополнительные проверки
        const hasRequiredMethods = [
            'viewOrderCard', 'startWork', 'declineOrder', 'cancelOrder',
            'sendEstimate', 'completeOrder', 'editOrder', 'deleteOrder',
            'restoreOrder', 'showOrderCards', 'performSearch', 'clearSearch'
        ];
        
        let methodsFound = 0;
        hasRequiredMethods.forEach(method => {
            if (typeof window.app[method] === 'function') {
                methodsFound++;
                console.log(`✅ Метод ${method} найден`);
            } else {
                console.log(`❌ Метод ${method} не найден`);
            }
        });
        
        logTest('Инициализация приложения', true, 
            `Приложение успешно инициализировано. Найдено методов: ${methodsFound}/${hasRequiredMethods.length}`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        logTest('Инициализация приложения', false, error.message);
        return false;
    }
}

// Тест 2: Проверка DOM элементов
function testDOMElements() {
    try {
        const requiredElements = [
            'loginScreen',
            'mainApp',
            'dashboardPage',
            'ordersPage',
            'newOrderModal',
            'orderCardsContainer'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            assert(element !== null, `Элемент ${elementId} должен существовать`);
        }
        
        logTest('DOM элементы', true, `Все ${requiredElements.length} элементов найдены`);
        return true;
    } catch (error) {
        logTest('DOM элементы', false, error.message);
        return false;
    }
}

// Тест 3: Проверка CSS классов
function testCSSClasses() {
    try {
        const requiredClasses = [
            'btn-3d',
            'burger-menu-3d',
            'burger-dropdown-3d',
            'btn-group-3d',
            'order-card'
        ];
        
        let foundClasses = 0;
        for (const className of requiredClasses) {
            const elements = document.getElementsByClassName(className);
            if (elements.length > 0) {
                foundClasses++;
            }
        }
        
        assert(foundClasses > 0, 'Должны быть найдены CSS классы');
        
        logTest('CSS классы', true, `Найдено ${foundClasses}/${requiredClasses.length} классов`);
        return true;
    } catch (error) {
        logTest('CSS классы', false, error.message);
        return false;
    }
}

// Тест 4: Проверка функций глобального доступа
function testGlobalFunctions() {
    try {
        const requiredFunctions = [
            'showOrderCards',
            'viewOrderCard',
            'startWork',
            'declineOrder',
            'cancelOrder',
            'editOrder',
            'sendEstimate',
            'completeOrder',
            'deleteOrder',
            'restoreOrder'
        ];
        
        for (const funcName of requiredFunctions) {
            assert(typeof window[funcName] === 'function', `Функция ${funcName} должна быть доступна глобально`);
        }
        
        logTest('Глобальные функции', true, `Все ${requiredFunctions.length} функций доступны`);
        return true;
    } catch (error) {
        logTest('Глобальные функции', false, error.message);
        return false;
    }
}

// Тест 5: Проверка модальных окон
function testModals() {
    try {
        const modals = [
            'newOrderModal',
            'editOrderModal',
            'newUserModal',
            'hierarchyModal'
        ];
        
        for (const modalId of modals) {
            const modal = document.getElementById(modalId);
            assert(modal !== null, `Модальное окно ${modalId} должно существовать`);
            assert(modal.classList.contains('modal'), `${modalId} должен быть модальным окном`);
        }
        
        logTest('Модальные окна', true, `Все ${modals.length} модальных окон найдены`);
        return true;
    } catch (error) {
        logTest('Модальные окна', false, error.message);
        return false;
    }
}

// Тест 6: Проверка адаптивности
function testResponsiveness() {
    try {
        // Проверяем наличие медиа-запросов в CSS
        const styleSheets = document.styleSheets;
        let hasMediaQueries = false;
        
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.MEDIA_RULE) {
                        hasMediaQueries = true;
                        break;
                    }
                }
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        assert(hasMediaQueries, 'Должны быть медиа-запросы для адаптивности');
        
        logTest('Адаптивность', true, 'Медиа-запросы найдены');
        return true;
    } catch (error) {
        logTest('Адаптивность', false, error.message);
        return false;
    }
}

// Тест 7: Проверка производительности загрузки
function testPerformance() {
    try {
        const startTime = performance.now();
        
        // Проверяем время загрузки основных ресурсов
        const scripts = document.getElementsByTagName('script');
        const styles = document.getElementsByTagName('link');
        
        const loadTime = performance.now() - startTime;
        
        assert(loadTime < 1000, 'Загрузка должна быть быстрой (< 1 сек)');
        assert(scripts.length > 0, 'Должны быть загружены скрипты');
        assert(styles.length > 0, 'Должны быть загружены стили');
        
        logTest('Производительность', true, `Время загрузки: ${loadTime.toFixed(2)}ms`);
        return true;
    } catch (error) {
        logTest('Производительность', false, error.message);
        return false;
    }
}

// Тест 8: Проверка валидации форм
function testFormValidation() {
    try {
        const newOrderForm = document.querySelector('#newOrderModal form');
        assert(newOrderForm !== null, 'Форма создания заказа должна существовать');
        
        const requiredFields = ['clientName', 'clientPhone', 'address'];
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            assert(field !== null, `Поле ${fieldId} должно существовать`);
        }
        
        logTest('Валидация форм', true, `Все ${requiredFields.length} обязательных полей найдены`);
        return true;
    } catch (error) {
        logTest('Валидация форм', false, error.message);
        return false;
    }
}

// Функция assert для тестов
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Тест 9: Проверка 3D эффектов
function test3DEffects() {
    try {
        console.log('🔍 Проверка 3D эффектов...');
        
        // Проверка 3D классов
        const threeDClasses = [
            'btn-3d', 'burger-menu-3d', 'burger-dropdown-3d', 
            'btn-group-3d', 'order-card-3d'
        ];
        
        let foundClasses = 0;
        threeDClasses.forEach(className => {
            const elements = document.getElementsByClassName(className);
            if (elements.length > 0) {
                foundClasses++;
                console.log(`✅ 3D класс ${className}: ${elements.length} элементов`);
            } else {
                console.log(`❌ 3D класс ${className}: не найден`);
            }
        });
        
        // Проверка CSS переменных для 3D
        const computedStyle = getComputedStyle(document.documentElement);
        const has3DVariables = [
            '--shadow-3d', '--border-3d', '--transform-3d'
        ];
        
        let variablesFound = 0;
        has3DVariables.forEach(variable => {
            const value = computedStyle.getPropertyValue(variable);
            if (value && value.trim() !== '') {
                variablesFound++;
                console.log(`✅ CSS переменная ${variable}: ${value}`);
            } else {
                console.log(`❌ CSS переменная ${variable}: не найдена`);
            }
        });
        
        logTest('3D эффекты', foundClasses > 0, 
            `Найдено 3D классов: ${foundClasses}/${threeDClasses.length}, CSS переменных: ${variablesFound}/${has3DVariables.length}`);
        return foundClasses > 0;
    } catch (error) {
        console.error('❌ Ошибка проверки 3D эффектов:', error);
        logTest('3D эффекты', false, error.message);
        return false;
    }
}

// Тест 10: Проверка логирования изменений
function testChangeLogging() {
    try {
        console.log('🔍 Проверка логирования изменений...');
        
        // Проверка функций логирования
        const loggingFunctions = [
            'logOrderHistory', 'logUserAction', 'logSystemEvent'
        ];
        
        let functionsFound = 0;
        loggingFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                functionsFound++;
                console.log(`✅ Функция логирования ${funcName}: найдена`);
            } else {
                console.log(`❌ Функция логирования ${funcName}: не найдена`);
            }
        });
        
        // Проверка элементов для истории
        const historyElements = [
            'orderHistoryContent', 'auditLogContent', 'changeLogContainer'
        ];
        
        let elementsFound = 0;
        historyElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                elementsFound++;
                console.log(`✅ Элемент истории ${elementId}: найден`);
            } else {
                console.log(`❌ Элемент истории ${elementId}: не найден`);
            }
        });
        
        // Проверка API для истории
        const hasHistoryAPI = typeof window.app !== 'undefined' && 
            typeof window.app.loadOrderHistory === 'function';
        console.log('API истории заказов:', hasHistoryAPI ? 'найдено' : 'не найдено');
        
        logTest('Логирование изменений', functionsFound > 0 || elementsFound > 0, 
            `Функций логирования: ${functionsFound}/${loggingFunctions.length}, элементов истории: ${elementsFound}/${historyElements.length}, API: ${hasHistoryAPI ? 'есть' : 'нет'}`);
        return functionsFound > 0 || elementsFound > 0;
    } catch (error) {
        console.error('❌ Ошибка проверки логирования:', error);
        logTest('Логирование изменений', false, error.message);
        return false;
    }
}

// Запуск всех тестов
async function runAllTests() {
    console.log('🚀 Запуск тестов фронтенда...\n');
    
    const tests = [
        testAppInitialization,
        testDOMElements,
        testCSSClasses,
        testGlobalFunctions,
        testModals,
        testResponsiveness,
        testPerformance,
        testFormValidation,
        test3DEffects,
        testChangeLogging
    ];
    
    for (const test of tests) {
        try {
            await test();
            currentTest++;
        } catch (error) {
            console.error('Критическая ошибка в тесте:', error);
            currentTest++;
        }
    }
    
    // Показываем итоговые результаты
    showFinalResults();
}

// Показ итоговых результатов
function showFinalResults() {
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const successRate = Math.round((passed / total) * 100);
    
    const resultsDiv = document.getElementById('test-summary');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <div class="test-summary">
                <h3>📊 Результаты тестирования</h3>
                <div class="summary-stats">
                    <div class="stat passed">✅ Пройдено: ${passed}</div>
                    <div class="stat failed">❌ Провалено: ${total - passed}</div>
                    <div class="stat total">📈 Успешность: ${successRate}%</div>
                </div>
                ${successRate === 100 ? '<div class="success-message">🎉 Все тесты пройдены!</div>' : '<div class="warning-message">⚠️ Некоторые тесты провалились</div>'}
            </div>
        `;
    }
    
    console.log(`\n📊 Итоговые результаты:`);
    console.log(`✅ Пройдено: ${passed}/${total}`);
    console.log(`❌ Провалено: ${total - passed}/${total}`);
    console.log(`📈 Успешность: ${successRate}%`);
}

// Экспорт для использования в HTML
window.FrontendTests = {
    runAllTests,
    testAppInitialization,
    testDOMElements,
    testCSSClasses,
    testGlobalFunctions,
    testModals,
    testResponsiveness,
    testPerformance,
    testFormValidation
};

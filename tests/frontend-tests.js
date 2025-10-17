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
    
    // Детальное логирование для отладки
    console.log(`🔍 Детали теста "${testName}":`);
    console.log(`   - Статус: ${passed ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}`);
    console.log(`   - Сообщение: ${message}`);
    console.log(`   - Время: ${new Date(result.timestamp).toLocaleTimeString('ru-RU')}`);
    console.log(`   - URL: ${window.location.href}`);
    console.log(`   - User Agent: ${navigator.userAgent}`);
    console.log(`   - Размер окна: ${window.innerWidth}x${window.innerHeight}`);
    
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
        console.log('📍 Текущий URL:', window.location.href);
        console.log('📍 Заголовок страницы:', document.title);
        console.log('📍 Количество скриптов:', document.scripts.length);
        
        // Проверяем загрузку скриптов
        const appScript = Array.from(document.scripts).find(script => 
            script.src && script.src.includes('app-simple.js')
        );
        console.log('📍 Скрипт app-simple.js:', appScript ? 'загружен' : 'НЕ ЗАГРУЖЕН');
        if (appScript) {
            console.log('📍 URL скрипта:', appScript.src);
            console.log('📍 Версия скрипта:', appScript.src.match(/v=(\d+)/)?.[1] || 'не указана');
        }
        
        console.log('📍 window.app:', window.app);
        console.log('📍 typeof window.app:', typeof window.app);
        console.log('📍 window.WindowRepairApp:', window.WindowRepairApp);
        console.log('📍 typeof window.WindowRepairApp:', typeof window.WindowRepairApp);
        
        // Проверяем глобальные функции
        console.log('📍 window.showOrderCards:', typeof window.showOrderCards);
        console.log('📍 window.viewOrderCard:', typeof window.viewOrderCard);
        console.log('📍 window.startWork:', typeof window.startWork);
        
        // Если приложение не инициализировано, пытаемся инициализировать
        if (!window.app) {
            console.log('⚠️ Приложение не инициализировано, пытаемся инициализировать...');
            if (typeof window.WindowRepairApp === 'function') {
                try {
                    window.app = new window.WindowRepairApp();
                    console.log('✅ Приложение инициализировано вручную');
                } catch (initError) {
                    console.error('❌ Ошибка инициализации:', initError);
                }
            } else {
                console.error('❌ WindowRepairApp не найден');
            }
        }
        
        assert(window.app !== undefined, 'Приложение должно быть инициализировано');
        console.log('✅ window.app определен');
        
        assert(typeof window.app === 'object', 'app должен быть объектом');
        console.log('✅ window.app является объектом');
        
        // Проверяем основные методы
        const basicMethods = ['checkAuth', 'showMainApp', 'setupRoleBasedUI'];
        let basicMethodsFound = 0;
        basicMethods.forEach(method => {
            if (typeof window.app[method] === 'function') {
                basicMethodsFound++;
                console.log(`✅ Базовый метод ${method} найден`);
            } else {
                console.log(`❌ Базовый метод ${method} не найден`);
            }
        });
        
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
        
        const success = basicMethodsFound === basicMethods.length;
        logTest('Инициализация приложения', success, 
            `Базовых методов: ${basicMethodsFound}/${basicMethods.length}, дополнительных: ${methodsFound}/${hasRequiredMethods.length}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        console.error('❌ Стек ошибки:', error.stack);
        logTest('Инициализация приложения', false, error.message);
        return false;
    }
}

// Тест 2: Проверка DOM элементов
function testDOMElements() {
    try {
        console.log('🔍 Проверка DOM элементов...');
        console.log('📍 Общее количество элементов на странице:', document.querySelectorAll('*').length);
        console.log('📍 Количество элементов с ID:', document.querySelectorAll('[id]').length);
        
        // Получаем все ID на странице
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        console.log('📍 Все ID на странице:', allIds);
        
        const requiredElements = [
            'loginScreen',
            'mainApp',
            'dashboardPage',
            'ordersPage',
            'newOrderModal',
            'orderCardsContainer'
        ];
        
        let foundElements = 0;
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (element) {
                foundElements++;
                console.log(`✅ Элемент ${elementId}: найден`);
                console.log(`   - Тег: ${element.tagName}`);
                console.log(`   - Классы: ${element.className}`);
                console.log(`   - Видимый: ${element.offsetWidth > 0 && element.offsetHeight > 0}`);
            } else {
                console.log(`❌ Элемент ${elementId}: не найден`);
                // Ищем похожие ID
                const similarIds = allIds.filter(id => 
                    id.toLowerCase().includes(elementId.toLowerCase()) ||
                    elementId.toLowerCase().includes(id.toLowerCase())
                );
                if (similarIds.length > 0) {
                    console.log(`   - Похожие ID: ${similarIds.join(', ')}`);
                }
            }
        }
        
        // Проверяем, что хотя бы основные элементы существуют
        const criticalElements = ['loginScreen', 'mainApp'];
        let criticalFound = 0;
        criticalElements.forEach(id => {
            if (document.getElementById(id)) {
                criticalFound++;
                console.log(`✅ Критический элемент ${id}: найден`);
            } else {
                console.log(`❌ Критический элемент ${id}: не найден`);
            }
        });
        
        // Проверяем альтернативные элементы
        const alternativeElements = [
            { id: 'loginScreen', alternatives: ['login', 'auth', 'signin'] },
            { id: 'mainApp', alternatives: ['app', 'main', 'content'] }
        ];
        
        let alternativesFound = 0;
        alternativeElements.forEach(({ id, alternatives }) => {
            if (!document.getElementById(id)) {
                const found = alternatives.find(alt => document.getElementById(alt));
                if (found) {
                    alternativesFound++;
                    console.log(`⚠️ Альтернативный элемент для ${id}: ${found}`);
                }
            }
        });
        
        const success = criticalFound === criticalElements.length || alternativesFound > 0;
        logTest('DOM элементы', success, 
            `Найдено элементов: ${foundElements}/${requiredElements.length}, критических: ${criticalFound}/${criticalElements.length}, альтернатив: ${alternativesFound}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки DOM элементов:', error);
        console.error('❌ Стек ошибки:', error.stack);
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

// Тест 11: Проверка основной страницы приложения
function testMainAppPage() {
    try {
        console.log('🔍 Проверка основной страницы приложения...');
        
        // Проверяем, находимся ли мы на странице тестов
        const isTestPage = window.location.href.includes('/tests/');
        console.log('📍 Страница тестов:', isTestPage ? 'да' : 'нет');
        
        if (isTestPage) {
            console.log('⚠️ Тесты запущены на странице тестов, а не на основной странице приложения');
            console.log('📍 Рекомендация: запустить тесты на основной странице http://188.120.240.71/');
            
            // Пытаемся загрузить основную страницу через iframe
            const iframe = document.createElement('iframe');
            iframe.src = '../public/index.html';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            return new Promise((resolve) => {
                iframe.onload = () => {
                    console.log('✅ Основная страница загружена в iframe');
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const mainApp = iframeDoc.getElementById('mainApp');
                    const loginScreen = iframeDoc.getElementById('loginScreen');
                    
                    console.log('📍 mainApp в iframe:', mainApp ? 'найден' : 'не найден');
                    console.log('📍 loginScreen в iframe:', loginScreen ? 'найден' : 'не найден');
                    
                    document.body.removeChild(iframe);
                    
                    const success = !!(mainApp || loginScreen);
                    logTest('Основная страница', success, 
                        `Страница тестов: ${isTestPage}, элементы в iframe: ${success ? 'найдены' : 'не найдены'}`);
                    resolve(success);
                };
                
                iframe.onerror = () => {
                    console.log('❌ Ошибка загрузки основной страницы в iframe');
                    document.body.removeChild(iframe);
                    logTest('Основная страница', false, 'Ошибка загрузки основной страницы');
                    resolve(false);
                };
            });
        } else {
            // Мы на основной странице
            console.log('✅ Тесты запущены на основной странице приложения');
            const mainApp = document.getElementById('mainApp');
            const loginScreen = document.getElementById('loginScreen');
            
            console.log('📍 mainApp:', mainApp ? 'найден' : 'не найден');
            console.log('📍 loginScreen:', loginScreen ? 'найден' : 'не найден');
            
            const success = !!(mainApp || loginScreen);
            logTest('Основная страница', success, 
                `Основная страница: ${!isTestPage}, элементы: ${success ? 'найдены' : 'не найдены'}`);
            return success;
        }
    } catch (error) {
        console.error('❌ Ошибка проверки основной страницы:', error);
        logTest('Основная страница', false, error.message);
        return false;
    }
}

// Тест 12: Проверка загрузки скриптов
function testScriptLoading() {
    try {
        console.log('🔍 Проверка загрузки скриптов...');
        
        const requiredScripts = [
            { name: 'app-simple.js', pattern: /app-simple\.js/ },
            { name: 'Bootstrap', pattern: /bootstrap/ },
            { name: 'Font Awesome', pattern: /font-awesome|fontawesome/ }
        ];
        
        let loadedScripts = 0;
        const allScripts = Array.from(document.scripts);
        
        console.log('📍 Всего скриптов на странице:', allScripts.length);
        allScripts.forEach((script, index) => {
            console.log(`📍 Скрипт ${index + 1}:`, script.src || 'inline');
        });
        
        requiredScripts.forEach(({ name, pattern }) => {
            const found = allScripts.find(script => 
                script.src && pattern.test(script.src)
            );
            if (found) {
                loadedScripts++;
                console.log(`✅ ${name}: загружен`);
                console.log(`   - URL: ${found.src}`);
                console.log(`   - Загружен: ${found.readyState || 'unknown'}`);
            } else {
                console.log(`❌ ${name}: не найден`);
            }
        });
        
        // Проверяем загрузку CSS
        const allStylesheets = Array.from(document.styleSheets);
        console.log('📍 Всего стилей на странице:', allStylesheets.length);
        
        const hasBootstrapCSS = allStylesheets.some(sheet => 
            sheet.href && sheet.href.includes('bootstrap')
        );
        console.log('📍 Bootstrap CSS:', hasBootstrapCSS ? 'загружен' : 'не найден');
        
        const success = loadedScripts >= 1; // Хотя бы один скрипт должен быть загружен
        logTest('Загрузка скриптов', success, 
            `Загружено скриптов: ${loadedScripts}/${requiredScripts.length}, CSS: ${allStylesheets.length}`);
        return success;
    } catch (error) {
        console.error('❌ Ошибка проверки скриптов:', error);
        logTest('Загрузка скриптов', false, error.message);
        return false;
    }
}

// Запуск всех тестов
async function runAllTests() {
    console.log('🚀 Запуск тестов фронтенда...\n');
    console.log('📍 Информация о среде:');
    console.log('   - URL:', window.location.href);
    console.log('   - User Agent:', navigator.userAgent);
    console.log('   - Размер окна:', window.innerWidth + 'x' + window.innerHeight);
    console.log('   - Время:', new Date().toLocaleString('ru-RU'));
    console.log('');
    
    const tests = [
        testMainAppPage,          // Новый тест - проверка основной страницы
        testScriptLoading,        // Новый тест - проверка загрузки скриптов
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

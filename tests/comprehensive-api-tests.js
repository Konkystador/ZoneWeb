/**
 * Комплексные тесты API для всех функций
 * Запуск: node tests/comprehensive-api-tests.js
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://188.120.240.71';
const TEST_USERS = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    manager: { username: 'manager', password: 'manager123', role: 'manager' },
    worker: { username: 'worker', password: 'worker123', role: 'worker' }
};

let authCookies = {};
let testData = {
    orders: [],
    users: [],
    services: []
};

// Вспомогательная функция для HTTP запросов
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    };
                    resolve(result);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Авторизация пользователя
async function loginUser(userType) {
    const user = TEST_USERS[userType];
    console.log(`🔐 Авторизация ${userType}...`);
    
    const result = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, user);
    
    assert.strictEqual(result.statusCode, 200, `Логин ${userType} должен возвращать 200`);
    assert.strictEqual(result.body.success, true, `Логин ${userType} должен быть успешным`);
    
    // Сохраняем cookie
    if (result.headers['set-cookie']) {
        authCookies[userType] = result.headers['set-cookie'][0];
    } else {
        // Если cookie не пришел, создаем пустую строку
        authCookies[userType] = '';
    }
    
    console.log(`✅ ${userType} авторизован`);
    return result.body.user;
}

// Тест 1: Авторизация всех ролей
async function testAllRolesAuth() {
    console.log('\n👥 Тестирование авторизации всех ролей...');
    
    for (const [role, user] of Object.entries(TEST_USERS)) {
        await loginUser(role);
    }
    
    console.log('✅ Все роли авторизованы');
    return true;
}

// Тест 2: Создание заказов от разных пользователей
async function testOrderCreationByRoles() {
    console.log('\n📝 Тестирование создания заказов разными ролями...');
    
    const orderData = {
        client_name: 'Тестовый клиент',
        client_phone: '+7-999-123-45-67',
        address: 'Тестовый адрес, 123',
        city: 'Москва',
        street: 'Тестовая улица',
        house: '123',
        problem_description: 'Тестовая проблема',
        visit_date: '2024-10-20T10:00:00'
    };
    
    for (const role of Object.keys(TEST_USERS)) {
        const result = await makeRequest({
            hostname: '188.120.240.71',
            port: 80,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookies[role]
            }
        }, orderData);
        
        assert.strictEqual(result.statusCode, 200, `Создание заказа ${role} должно возвращать 200`);
        assert.ok(result.body.id, `Должен возвращаться ID заказа для ${role}`);
        
        testData.orders.push({ id: result.body.id, created_by: role });
        console.log(`✅ Заказ создан ${role}, ID: ${result.body.id}`);
    }
    
    return true;
}

// Тест 3: Проверка ролевой модели доступа
async function testRoleBasedAccess() {
    console.log('\n🔒 Тестирование ролевой модели доступа...');
    
    // Тест доступа к пользователям (только админ)
    const adminUsersResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/users',
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(adminUsersResult.statusCode, 200, 'Админ должен видеть пользователей');
    
    const managerUsersResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/users',
        method: 'GET',
        headers: {
            'Cookie': authCookies.manager
        }
    });
    
    assert.strictEqual(managerUsersResult.statusCode, 403, 'Менеджер не должен видеть пользователей');
    
    console.log('✅ Ролевая модель работает корректно');
    return true;
}

// Тест 4: CRUD операции с заказами
async function testOrderCRUD() {
    console.log('\n📋 Тестирование CRUD операций с заказами...');
    
    const orderId = testData.orders[0].id;
    
    // Чтение заказа
    const getResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: `/api/orders/${orderId}`,
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(getResult.statusCode, 200, 'Получение заказа должно возвращать 200');
    assert.ok(getResult.body.id, 'Должен возвращаться заказ');
    
    // Обновление статуса
    const updateResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: `/api/orders/${orderId}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authCookies.admin
        }
    }, { status: 'in_progress' });
    
    assert.strictEqual(updateResult.statusCode, 200, 'Обновление статуса должно возвращать 200');
    
    // Получение всех заказов
    const getAllResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/orders',
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(getAllResult.statusCode, 200, 'Получение всех заказов должно возвращать 200');
    assert.ok(Array.isArray(getAllResult.body), 'Должен возвращаться массив заказов');
    
    console.log('✅ CRUD операции работают корректно');
    return true;
}

// Тест 5: Профиль пользователя
async function testUserProfile() {
    console.log('\n👤 Тестирование профиля пользователя...');
    
    // Получение профиля
    const getProfileResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/user/profile',
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(getProfileResult.statusCode, 200, 'Получение профиля должно возвращать 200');
    
    // Обновление профиля
    const updateProfileResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/user/profile',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authCookies.admin
        }
    }, {
        full_name: 'Тестовый Администратор',
        phone1: '+7-999-123-45-67',
        telegram: '@testadmin'
    });
    
    assert.strictEqual(updateProfileResult.statusCode, 200, 'Обновление профиля должно возвращать 200');
    
    console.log('✅ Профиль пользователя работает корректно');
    return true;
}

// Тест 6: Управление пользователями (только админ)
async function testUserManagement() {
    console.log('\n👥 Тестирование управления пользователями...');
    
    // Создание нового пользователя
    const newUserData = {
        username: 'testuser',
        password: 'testpass123',
        role: 'worker',
        full_name: 'Тестовый пользователь'
    };
    
    const createUserResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authCookies.admin
        }
    }, newUserData);
    
    assert.strictEqual(createUserResult.statusCode, 200, 'Создание пользователя должно возвращать 200');
    assert.ok(createUserResult.body.id, 'Должен возвращаться ID пользователя');
    
    testData.users.push({ id: createUserResult.body.id, username: 'testuser' });
    
    // Обновление пользователя
    const updateUserResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: `/api/users/${createUserResult.body.id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authCookies.admin
        }
    }, {
        full_name: 'Обновленный пользователь',
        role: 'manager'
    });
    
    assert.strictEqual(updateUserResult.statusCode, 200, 'Обновление пользователя должно возвращать 200');
    
    console.log('✅ Управление пользователями работает корректно');
    return true;
}

// Тест 7: Услуги и цены
async function testServicesManagement() {
    console.log('\n🛠 Тестирование управления услугами...');
    
    // Получение услуг
    const getServicesResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/services',
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(getServicesResult.statusCode, 200, 'Получение услуг должно возвращать 200');
    assert.ok(Array.isArray(getServicesResult.body), 'Должен возвращаться массив услуг');
    
    // Создание новой услуги
    const newServiceData = {
        name: 'Тестовая услуга',
        category: 'repair',
        calculation_type: 'fixed_price',
        base_price: 1000,
        unit: 'шт',
        description: 'Описание тестовой услуги'
    };
    
    const createServiceResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/services',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authCookies.admin
        }
    }, newServiceData);
    
    assert.strictEqual(createServiceResult.statusCode, 200, 'Создание услуги должно возвращать 200');
    assert.ok(createServiceResult.body.id, 'Должен возвращаться ID услуги');
    
    testData.services.push({ id: createServiceResult.body.id, name: 'Тестовая услуга' });
    
    console.log('✅ Управление услугами работает корректно');
    return true;
}

// Тест 8: Поиск и фильтрация
async function testSearchAndFilter() {
    console.log('\n🔍 Тестирование поиска и фильтрации...');
    
    // Поиск заказов
    const searchResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/orders/search?client_name=' + encodeURIComponent('Тестовый'),
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    // Поиск может возвращать 200 или 404 (если нет результатов)
    assert.ok([200, 404].includes(searchResult.statusCode), 'Поиск должен возвращать 200 или 404');
    
    // Фильтрация по статусу
    const filterResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: '/api/orders?status=pending',
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(filterResult.statusCode, 200, 'Фильтрация должна возвращать 200');
    assert.ok(Array.isArray(filterResult.body), 'Должен возвращаться массив заказов');
    
    console.log('✅ Поиск и фильтрация работают корректно');
    return true;
}

// Тест 9: История изменений
async function testOrderHistory() {
    console.log('\n📜 Тестирование истории изменений...');
    
    const orderId = testData.orders[0].id;
    
    const historyResult = await makeRequest({
        hostname: '188.120.240.71',
        port: 80,
        path: `/api/orders/${orderId}/history`,
        method: 'GET',
        headers: {
            'Cookie': authCookies.admin
        }
    });
    
    assert.strictEqual(historyResult.statusCode, 200, 'Получение истории должно возвращать 200');
    assert.ok(Array.isArray(historyResult.body), 'Должен возвращаться массив истории');
    
    console.log('✅ История изменений работает корректно');
    return true;
}

// Тест 10: Производительность
async function testPerformance() {
    console.log('\n⚡ Тестирование производительности...');
    
    const startTime = Date.now();
    
    // Выполняем несколько запросов подряд
    const promises = [];
    for (let i = 0; i < 10; i++) {
        promises.push(makeRequest({
            hostname: '188.120.240.71',
            port: 80,
            path: '/api/orders',
            method: 'GET',
            headers: {
                'Cookie': authCookies.admin
            }
        }));
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert.ok(duration < 5000, `10 запросов должны выполняться менее чем за 5 секунд (${duration}ms)`);
    
    console.log(`✅ Производительность: ${duration}ms для 10 запросов`);
    return true;
}

// Очистка тестовых данных
async function cleanupTestData() {
    console.log('\n🧹 Очистка тестовых данных...');
    
    // Удаление тестовых заказов
    for (const order of testData.orders) {
        try {
            await makeRequest({
                hostname: '188.120.240.71',
                port: 80,
                path: `/api/orders/${order.id}`,
                method: 'DELETE',
                headers: {
                    'Cookie': authCookies.admin
                }
            });
        } catch (error) {
            // Игнорируем ошибки удаления
        }
    }
    
    // Удаление тестовых пользователей
    for (const user of testData.users) {
        try {
            await makeRequest({
                hostname: '188.120.240.71',
                port: 80,
                path: `/api/users/${user.id}`,
                method: 'DELETE',
                headers: {
                    'Cookie': authCookies.admin
                }
            });
        } catch (error) {
            // Игнорируем ошибки удаления
        }
    }
    
    // Удаление тестовых услуг
    for (const service of testData.services) {
        try {
            await makeRequest({
                hostname: '188.120.240.71',
                port: 80,
                path: `/api/services/${service.id}`,
                method: 'DELETE',
                headers: {
                    'Cookie': authCookies.admin
                }
            });
        } catch (error) {
            // Игнорируем ошибки удаления
        }
    }
    
    console.log('✅ Тестовые данные очищены');
}

// Основная функция запуска тестов
async function runComprehensiveTests() {
    console.log('🚀 Запуск комплексных тестов API...\n');
    
    const tests = [
        testAllRolesAuth,
        testOrderCreationByRoles,
        testRoleBasedAccess,
        testOrderCRUD,
        testUserProfile,
        testUserManagement,
        testServicesManagement,
        testSearchAndFilter,
        testOrderHistory,
        testPerformance
    ];
    
    let passed = 0;
    let total = tests.length;
    
    try {
        for (const test of tests) {
            try {
                const result = await test();
                if (result) passed++;
                console.log(''); // Пустая строка для разделения
            } catch (error) {
                console.error('❌ Критическая ошибка в тесте:', error.message);
                console.log('');
            }
        }
    } finally {
        // Очищаем тестовые данные
        await cleanupTestData();
    }
    
    console.log('📊 Результаты комплексного тестирования:');
    console.log(`✅ Пройдено: ${passed}/${total}`);
    console.log(`❌ Провалено: ${total - passed}/${total}`);
    console.log(`📈 Успешность: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('\n🎉 ВСЕ КОМПЛЕКСНЫЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
        process.exit(0);
    } else {
        console.log('\n⚠️  НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛИЛИСЬ!');
        process.exit(1);
    }
}

// Запуск тестов
if (require.main === module) {
    runComprehensiveTests().catch(console.error);
}

module.exports = {
    runComprehensiveTests,
    testAllRolesAuth,
    testOrderCreationByRoles,
    testRoleBasedAccess,
    testOrderCRUD,
    testUserProfile,
    testUserManagement,
    testServicesManagement,
    testSearchAndFilter,
    testOrderHistory,
    testPerformance
};

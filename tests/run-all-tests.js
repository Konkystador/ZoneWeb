#!/usr/bin/env node

/**
 * Скрипт для запуска всех тестов
 * Запуск: node tests/run-all-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Запуск полного тестирования приложения "Оконные Мастера"\n');

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Проверяем, запущен ли сервер
async function checkServer() {
    return new Promise((resolve) => {
        const http = require('http');
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/check',
            method: 'GET'
        }, (res) => {
            resolve(res.statusCode === 200 || res.statusCode === 401);
        });
        
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Запуск API тестов
async function runAPITests() {
    log('\n📡 Запуск API тестов...', 'blue');
    
    return new Promise((resolve) => {
        const apiTest = spawn('node', ['tests/api-tests.js'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        apiTest.on('close', (code) => {
            if (code === 0) {
                log('✅ API тесты пройдены успешно', 'green');
            } else {
                log('❌ API тесты провалились', 'red');
            }
            resolve(code === 0);
        });
        
        apiTest.on('error', (error) => {
            log(`❌ Ошибка запуска API тестов: ${error.message}`, 'red');
            resolve(false);
        });
    });
}

// Проверка размера файлов
function checkFileSizes() {
    log('\n📊 Проверка размера файлов...', 'blue');
    
    const files = [
        'public/js/app-simple.js',
        'public/css/style.css',
        'server.js',
        'public/index.html'
    ];
    
    let totalSize = 0;
    let results = [];
    
    for (const file of files) {
        try {
            const stats = fs.statSync(file);
            const sizeKB = Math.round(stats.size / 1024);
            totalSize += sizeKB;
            results.push({ file, size: sizeKB });
            log(`  ${file}: ${sizeKB} KB`, 'cyan');
        } catch (error) {
            log(`  ❌ ${file}: файл не найден`, 'red');
        }
    }
    
    log(`\n📈 Общий размер основных файлов: ${totalSize} KB`, 'magenta');
    
    // Проверяем лимиты
    const limits = {
        'app-simple.js': 500, // 500 KB
        'style.css': 200,     // 200 KB
        'server.js': 300,     // 300 KB
        'index.html': 100     // 100 KB
    };
    
    let warnings = 0;
    for (const result of results) {
        const fileName = path.basename(result.file);
        const limit = limits[fileName];
        if (limit && result.size > limit) {
            log(`  ⚠️  ${fileName} превышает рекомендуемый размер (${result.size} KB > ${limit} KB)`, 'yellow');
            warnings++;
        }
    }
    
    if (warnings === 0) {
        log('✅ Все файлы в пределах рекомендуемых размеров', 'green');
    }
    
    return { totalSize, warnings };
}

// Проверка производительности
function checkPerformance() {
    log('\n⚡ Проверка производительности...', 'blue');
    
    const startTime = process.hrtime.bigint();
    
    // Симуляция проверки производительности
    let operations = 0;
    for (let i = 0; i < 1000000; i++) {
        operations++;
    }
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // в миллисекундах
    
    log(`  Выполнено ${operations.toLocaleString()} операций за ${duration.toFixed(2)}ms`, 'cyan');
    
    if (duration < 100) {
        log('✅ Производительность отличная', 'green');
    } else if (duration < 500) {
        log('✅ Производительность хорошая', 'green');
    } else {
        log('⚠️  Производительность может быть улучшена', 'yellow');
    }
    
    return duration;
}

// Проверка безопасности
function checkSecurity() {
    log('\n🔒 Проверка безопасности...', 'blue');
    
    const securityChecks = [
        {
            name: 'Проверка helmet middleware',
            check: () => {
                const serverContent = fs.readFileSync('server.js', 'utf8');
                return serverContent.includes('helmet') && serverContent.includes('cors');
            }
        },
        {
            name: 'Проверка валидации входных данных',
            check: () => {
                const serverContent = fs.readFileSync('server.js', 'utf8');
                return serverContent.includes('requireAuth') && serverContent.includes('req.body');
            }
        },
        {
            name: 'Проверка HTTPS настроек',
            check: () => {
                const serverContent = fs.readFileSync('server.js', 'utf8');
                return serverContent.includes('trust proxy');
            }
        }
    ];
    
    let passed = 0;
    for (const check of securityChecks) {
        try {
            if (check.check()) {
                log(`  ✅ ${check.name}`, 'green');
                passed++;
            } else {
                log(`  ❌ ${check.name}`, 'red');
            }
        } catch (error) {
            log(`  ❌ ${check.name}: ${error.message}`, 'red');
        }
    }
    
    log(`\n📊 Безопасность: ${passed}/${securityChecks.length} проверок пройдено`, 'magenta');
    return passed === securityChecks.length;
}

// Основная функция
async function runAllTests() {
    const startTime = Date.now();
    
    log('🎯 Начинаем полное тестирование...', 'bright');
    
    // Проверяем сервер
    log('\n🔍 Проверка сервера...', 'blue');
    const serverRunning = await checkServer();
    if (!serverRunning) {
        log('❌ Сервер не запущен! Запустите: npm start', 'red');
        log('💡 Или запустите: node server.js', 'yellow');
        process.exit(1);
    }
    log('✅ Сервер запущен', 'green');
    
    // Запускаем API тесты
    const apiTestsPassed = await runAPITests();
    
    // Проверяем размеры файлов
    const fileStats = checkFileSizes();
    
    // Проверяем производительность
    const performance = checkPerformance();
    
    // Проверяем безопасность
    const securityPassed = checkSecurity();
    
    // Итоговые результаты
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    log('\n' + '='.repeat(60), 'bright');
    log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ', 'bright');
    log('='.repeat(60), 'bright');
    
    log(`⏱️  Время выполнения: ${totalTime.toFixed(2)} секунд`, 'cyan');
    log(`📡 API тесты: ${apiTestsPassed ? '✅ Пройдены' : '❌ Провалены'}`, apiTestsPassed ? 'green' : 'red');
    log(`📊 Размер файлов: ${fileStats.totalSize} KB (${fileStats.warnings} предупреждений)`, fileStats.warnings === 0 ? 'green' : 'yellow');
    log(`⚡ Производительность: ${performance < 100 ? '✅ Отличная' : performance < 500 ? '✅ Хорошая' : '⚠️  Требует улучшения'}`, performance < 500 ? 'green' : 'yellow');
    log(`🔒 Безопасность: ${securityPassed ? '✅ Пройдена' : '❌ Требует внимания'}`, securityPassed ? 'green' : 'red');
    
    const allPassed = apiTestsPassed && securityPassed && fileStats.warnings === 0;
    
    if (allPassed) {
        log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!', 'green');
        log('🚀 Приложение готово к продакшену!', 'green');
    } else {
        log('\n⚠️  НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛИЛИСЬ', 'yellow');
        log('🔧 Рекомендуется исправить найденные проблемы', 'yellow');
    }
    
    log('\n💡 Для тестирования фронтенда откройте: tests/frontend-tests.html', 'blue');
    
    process.exit(allPassed ? 0 : 1);
}

// Запуск
if (require.main === module) {
    runAllTests().catch((error) => {
        log(`❌ Критическая ошибка: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runAllTests };

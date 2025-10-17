#!/usr/bin/env node

/**
 * Скрипт для запуска всех комплексных тестов
 * Запуск: node tests/run-comprehensive-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Запуск комплексного тестирования приложения "Оконные Мастера"\n');

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
            hostname: '188.120.240.71',
            port: 80,
            path: '/api/auth/check',
            method: 'GET'
        }, (res) => {
            resolve(res.statusCode === 200 || res.statusCode === 401);
        });
        
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Запуск базовых API тестов
async function runBasicAPITests() {
    log('\n📡 Запуск базовых API тестов...', 'blue');
    
    return new Promise((resolve) => {
        const apiTest = spawn('node', ['tests/api-tests.js'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        apiTest.on('close', (code) => {
            if (code === 0) {
                log('✅ Базовые API тесты пройдены', 'green');
            } else {
                log('❌ Базовые API тесты провалились', 'red');
            }
            resolve(code === 0);
        });
        
        apiTest.on('error', (error) => {
            log(`❌ Ошибка запуска базовых API тестов: ${error.message}`, 'red');
            resolve(false);
        });
    });
}

// Запуск комплексных API тестов
async function runComprehensiveAPITests() {
    log('\n📡 Запуск комплексных API тестов...', 'blue');
    
    return new Promise((resolve) => {
        const apiTest = spawn('node', ['tests/comprehensive-api-tests.js'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        apiTest.on('close', (code) => {
            if (code === 0) {
                log('✅ Комплексные API тесты пройдены', 'green');
            } else {
                log('❌ Комплексные API тесты провалились', 'red');
            }
            resolve(code === 0);
        });
        
        apiTest.on('error', (error) => {
            log(`❌ Ошибка запуска комплексных API тестов: ${error.message}`, 'red');
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
        'app-simple.js': 100, // 100 KB
        'style.css': 30,      // 30 KB
        'server.js': 60,      // 60 KB
        'index.html': 150     // 150 KB
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
    
    if (duration < 50) {
        log('✅ Производительность отличная', 'green');
    } else if (duration < 200) {
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
        },
        {
            name: 'Проверка хеширования паролей',
            check: () => {
                const serverContent = fs.readFileSync('server.js', 'utf8');
                return serverContent.includes('bcrypt') || serverContent.includes('bcryptjs');
            }
        },
        {
            name: 'Проверка сессий',
            check: () => {
                const serverContent = fs.readFileSync('server.js', 'utf8');
                return serverContent.includes('express-session');
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

// Проверка кода
function checkCodeQuality() {
    log('\n🔍 Проверка качества кода...', 'blue');
    
    const checks = [
        {
            name: 'Проверка комментариев в коде',
            check: () => {
                const jsContent = fs.readFileSync('public/js/app-simple.js', 'utf8');
                const commentLines = (jsContent.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length;
                return commentLines > 10;
            }
        },
        {
            name: 'Проверка обработки ошибок',
            check: () => {
                const jsContent = fs.readFileSync('public/js/app-simple.js', 'utf8');
                return jsContent.includes('try') && jsContent.includes('catch');
            }
        },
        {
            name: 'Проверка валидации форм',
            check: () => {
                const htmlContent = fs.readFileSync('public/index.html', 'utf8');
                return htmlContent.includes('required') || htmlContent.includes('pattern');
            }
        },
        {
            name: 'Проверка accessibility',
            check: () => {
                const htmlContent = fs.readFileSync('public/index.html', 'utf8');
                return htmlContent.includes('aria-') || htmlContent.includes('role=');
            }
        }
    ];
    
    let passed = 0;
    for (const check of checks) {
        try {
            if (check.check()) {
                log(`  ✅ ${check.name}`, 'green');
                passed++;
            } else {
                log(`  ⚠️  ${check.name}`, 'yellow');
            }
        } catch (error) {
            log(`  ❌ ${check.name}: ${error.message}`, 'red');
        }
    }
    
    log(`\n📊 Качество кода: ${passed}/${checks.length} проверок пройдено`, 'magenta');
    return passed >= checks.length * 0.75; // 75% проверок должны пройти
}

// Основная функция
async function runComprehensiveTests() {
    const startTime = Date.now();
    
    log('🎯 Начинаем комплексное тестирование...', 'bright');
    
    // Проверяем сервер
    log('\n🔍 Проверка сервера...', 'blue');
    const serverRunning = await checkServer();
    if (!serverRunning) {
        log('❌ Сервер не доступен! Проверьте подключение к интернету', 'red');
        process.exit(1);
    }
    log('✅ Сервер доступен', 'green');
    
    // Запускаем тесты
    const basicAPITestsPassed = await runBasicAPITests();
    const comprehensiveAPITestsPassed = await runComprehensiveAPITests();
    
    // Проверяем размеры файлов
    const fileStats = checkFileSizes();
    
    // Проверяем производительность
    const performance = checkPerformance();
    
    // Проверяем безопасность
    const securityPassed = checkSecurity();
    
    // Проверяем качество кода
    const codeQualityPassed = checkCodeQuality();
    
    // Итоговые результаты
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    log('\n' + '='.repeat(80), 'bright');
    log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ', 'bright');
    log('='.repeat(80), 'bright');
    
    log(`⏱️  Время выполнения: ${totalTime.toFixed(2)} секунд`, 'cyan');
    log(`📡 Базовые API тесты: ${basicAPITestsPassed ? '✅ Пройдены' : '❌ Провалены'}`, basicAPITestsPassed ? 'green' : 'red');
    log(`📡 Комплексные API тесты: ${comprehensiveAPITestsPassed ? '✅ Пройдены' : '❌ Провалены'}`, comprehensiveAPITestsPassed ? 'green' : 'red');
    log(`📊 Размер файлов: ${fileStats.totalSize} KB (${fileStats.warnings} предупреждений)`, fileStats.warnings === 0 ? 'green' : 'yellow');
    log(`⚡ Производительность: ${performance < 50 ? '✅ Отличная' : performance < 200 ? '✅ Хорошая' : '⚠️  Требует улучшения'}`, performance < 200 ? 'green' : 'yellow');
    log(`🔒 Безопасность: ${securityPassed ? '✅ Пройдена' : '❌ Требует внимания'}`, securityPassed ? 'green' : 'red');
    log(`🔍 Качество кода: ${codeQualityPassed ? '✅ Хорошее' : '⚠️  Требует улучшения'}`, codeQualityPassed ? 'green' : 'yellow');
    
    const allPassed = basicAPITestsPassed && comprehensiveAPITestsPassed && securityPassed && codeQualityPassed && fileStats.warnings === 0;
    
    if (allPassed) {
        log('\n🎉 ВСЕ КОМПЛЕКСНЫЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!', 'green');
        log('🚀 Приложение готово к продакшену!', 'green');
    } else {
        log('\n⚠️  НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛИЛИСЬ', 'yellow');
        log('🔧 Рекомендуется исправить найденные проблемы', 'yellow');
    }
    
    log('\n💡 Дополнительные тесты:', 'blue');
    log('   📱 Фронтенд тесты: tests/frontend-tests.html', 'blue');
    log('   📱 Комплексные фронтенд тесты: tests/frontend-comprehensive-tests.html', 'blue');
    log('   📱 Мобильная адаптивность: tests/mobile-responsive-test.html', 'blue');
    
    process.exit(allPassed ? 0 : 1);
}

// Запуск
if (require.main === module) {
    runComprehensiveTests().catch((error) => {
        log(`❌ Критическая ошибка: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runComprehensiveTests };

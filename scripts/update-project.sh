#!/bin/bash

# Скрипт обновления проекта на VPS
# Запускается автоматически через GitHub Actions

set -e

echo "🔄 Обновление ZoneWeb проекта..."

# Переход в директорию проекта
cd /var/www/ZoneWeb

# Получение последних изменений
echo "📥 Получение изменений из GitHub..."
git pull origin main

# Установка/обновление зависимостей
if [ -f package.json ]; then
    echo "📦 Обновление зависимостей..."
    npm ci --production
    
    # Сборка проекта (если есть)
    if npm run build --if-present; then
        echo "🔨 Сборка проекта завершена"
    fi
fi

# Перезапуск сервисов
echo "🔄 Перезапуск сервисов..."

# Если используете PM2
if command -v pm2 &> /dev/null; then
    pm2 restart ZoneWeb || pm2 start ecosystem.config.js
fi

# Перезагрузка Nginx
sudo systemctl reload nginx

echo "✅ Проект успешно обновлен!"

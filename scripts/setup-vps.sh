#!/bin/bash

# Скрипт настройки VPS для ZoneWeb проекта
# Запустите на сервере: bash setup-vps.sh

set -e

echo "🚀 Настройка VPS для ZoneWeb..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
echo "🔧 Установка зависимостей..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Установка Node.js 18
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 для управления процессами
echo "⚡ Установка PM2..."
sudo npm install -g pm2

# Создание директории проекта
echo "📁 Создание директории проекта..."
sudo mkdir -p /var/www/ZoneWeb
sudo chown -R $USER:$USER /var/www/ZoneWeb

# Клонирование репозитория
echo "📥 Клонирование репозитория..."
cd /var/www/ZoneWeb
git clone https://github.com/Konkystador/ZoneWeb.git .

# Установка зависимостей
echo "📦 Установка зависимостей проекта..."
if [ -f package.json ]; then
    npm install
fi

# Настройка Nginx
echo "🌐 Настройка Nginx..."
sudo tee /etc/nginx/sites-available/zoneweb << EOF
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен
    
    root /var/www/ZoneWeb;
    index index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Для API (если будет)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активация сайта
sudo ln -sf /etc/nginx/sites-available/zoneweb /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Настройка SSL (опционально)
echo "🔒 Настройка SSL (опционально)..."
echo "Для настройки SSL выполните:"
echo "sudo certbot --nginx -d your-domain.com"

# Настройка PM2 для автозапуска
echo "⚡ Настройка PM2..."
pm2 startup
pm2 save

echo "✅ Настройка VPS завершена!"
echo "📝 Следующие шаги:"
echo "1. Замените 'your-domain.com' на ваш реальный домен"
echo "2. Настройте DNS записи"
echo "3. Настройте SSL: sudo certbot --nginx -d your-domain.com"
echo "4. Добавьте секреты в GitHub Actions"

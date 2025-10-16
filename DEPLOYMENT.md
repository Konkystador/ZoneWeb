# 🚀 Инструкции по развертыванию ZoneWeb

## Настройка VPS сервера

### 1. Подключение к серверу
```bash
ssh root@your-vps-ip
# или
ssh username@your-vps-ip
```

### 2. Запуск скрипта настройки
```bash
# Скачайте и запустите скрипт настройки
wget https://raw.githubusercontent.com/Konkystador/ZoneWeb/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3. Настройка GitHub Actions

Добавьте следующие секреты в настройках репозитория GitHub:
- `VPS_HOST` - IP адрес вашего VPS
- `VPS_USERNAME` - имя пользователя для SSH
- `VPS_SSH_KEY` - приватный SSH ключ
- `VPS_PORT` - порт SSH (обычно 22)

### 4. Настройка домена

1. Укажите A-запись вашего домена на IP VPS
2. Отредактируйте файл `/etc/nginx/sites-available/zoneweb`
3. Замените `your-domain.com` на ваш домен
4. Перезапустите Nginx: `sudo systemctl reload nginx`

### 5. Настройка SSL
```bash
sudo certbot --nginx -d your-domain.com
```

## Автоматическое развертывание

После настройки каждый push в ветку `main` будет автоматически:
1. Собирать проект
2. Подключаться к VPS
3. Обновлять код
4. Перезапускать сервисы

## Ручное обновление

```bash
# На сервере
cd /var/www/ZoneWeb
bash scripts/update-project.sh
```

## Мониторинг

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs ZoneWeb

# Статус Nginx
sudo systemctl status nginx
```

## Структура проекта на сервере

```
/var/www/ZoneWeb/
├── .github/workflows/     # GitHub Actions
├── scripts/              # Скрипты развертывания
├── ecosystem.config.js   # Конфигурация PM2
└── [ваш код проекта]
```

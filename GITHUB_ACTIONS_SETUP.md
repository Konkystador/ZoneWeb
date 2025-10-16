# 🔧 Настройка GitHub Actions для автоматического развертывания

## 📋 Необходимые секреты

Добавьте следующие секреты в настройках репозитория GitHub:

### 1. Перейдите в настройки репозитория
- Откройте [https://github.com/Konkystador/ZoneWeb/settings/secrets/actions](https://github.com/Konkystador/ZoneWeb/settings/secrets/actions)
- Нажмите **"New repository secret"**

### 2. Добавьте секрет `VPS_SSH_KEY`

**Имя секрета:** `VPS_SSH_KEY`

**Значение секрета:** (скопируйте весь приватный ключ)
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
MEBQ==
-----END OPENSSH PRIVATE KEY-----
```

## ✅ После добавления секрета

1. **Сохраните секрет** - нажмите "Add secret"
2. **Проверьте статус** - секрет должен появиться в списке
3. **Тестируйте развертывание** - сделайте любой коммит в ветку `main`

## 🚀 Как это работает

После настройки каждый push в ветку `main` будет:

1. **Автоматически собирать** проект (если есть package.json)
2. **Подключаться к серверу** 188.120.240.71
3. **Обновлять код** из GitHub
4. **Перезапускать сервисы** (Nginx, PM2)

## 🔍 Мониторинг развертывания

- Перейдите в **Actions** вкладку репозитория
- Смотрите логи выполнения каждого развертывания
- При ошибках - проверяйте логи в разделе "Deploy to VPS"

## 📝 Важные данные сервера

- **IP:** 188.120.240.71
- **Пользователь:** root
- **Порт:** 22
- **Директория проекта:** /var/www/ZoneWeb

# 📚 Справочник команд для проекта Delight My Style

## 🗂️ Содержание
1. [Supabase Commands](#supabase-commands)
2. [Resend API](#resend-api)
3. [Полезные команды для разработки](#полезные-команды)

---

## 🔷 Supabase Commands

### Основные команды

#### Инициализация и запуск
```bash
# Инициализировать Supabase проект (первый раз)
supabase init

# Связать локальный проект с удаленным
supabase link --project-ref vdpvmxzcdjtjkiwylpuv

# Запустить Supabase локально (Docker контейнеры)
supabase start

# Остановить Supabase локально
supabase stop

# Перезапустить Supabase
supabase stop && supabase start

# Проверить статус Supabase
supabase status
```

### Edge Functions (Serverless функции)

#### Создание и управление функциями
```bash
# Создать новую функцию
supabase functions new <function-name>
# Пример: supabase functions new receive-email

# Задеплоить функцию на Supabase
supabase functions deploy <function-name>
# Пример: supabase functions deploy receive-email

# Задеплоить функцию БЕЗ проверки JWT (для вебхуков)
supabase functions deploy <function-name> --no-verify-jwt
# Пример: supabase functions deploy receive-email --no-verify-jwt

# Задеплоить ВСЕ функции
supabase functions deploy

# Запустить функцию локально для тестирования
supabase functions serve <function-name>
# Пример: supabase functions serve receive-email

# Запустить функцию локально БЕЗ проверки JWT
supabase functions serve <function-name> --no-verify-jwt

# Посмотреть логи функции (локально)
supabase functions logs <function-name>

# Удалить функцию
supabase functions delete <function-name>
```

#### Тестирование функций локально
```bash
# Вызвать функцию через curl (локально)
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/<function-name>' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'

# Пример для receive-email
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/receive-email' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "test@example.com",
    "to": "anything@eupimsel.resend.app",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

### Database (База данных)

#### Миграции
```bash
# Создать новую миграцию
supabase migration new <migration-name>
# Пример: supabase migration new add_email_logs_table

# Применить миграции локально
supabase db push

# Применить миграции на удаленный сервер
supabase db push --linked

# Сбросить базу данных (ОСТОРОЖНО!)
supabase db reset

# Создать дамп базы данных
supabase db dump -f dump.sql

# Посмотреть различия между локальной и удаленной БД
supabase db diff
```

### Секреты (Environment Variables)

```bash
# Установить секрет для функции
supabase secrets set <KEY>=<VALUE>
# Пример: supabase secrets set RESEND_API_KEY=re_123456789

# Посмотреть все секреты
supabase secrets list

# Удалить секрет
supabase secrets unset <KEY>
```

### Полезные команды

```bash
# Получить информацию о проекте
supabase projects list

# Открыть Supabase Studio в браузере
supabase studio

# Посмотреть логи всех сервисов
supabase logs

# Обновить Supabase CLI
npm update -g supabase

# Проверить версию CLI
supabase --version
```

---

## 📧 Resend API

### Отправка писем через API

#### Базовый запрос
```bash
# Отправить простое письмо
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "MAISON <onboarding@resend.dev>",
    "to": ["recipient@example.com"],
    "subject": "Hello from Resend",
    "html": "<p>This is a test email</p>"
  }'
```

#### Отправка с вложениями
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "MAISON <onboarding@resend.dev>",
    "to": ["recipient@example.com"],
    "subject": "Email with attachment",
    "html": "<p>See attachment</p>",
    "attachments": [
      {
        "filename": "invoice.pdf",
        "content": "base64_encoded_content_here"
      }
    ]
  }'
```

#### Отправка с tracking pixel (отслеживание открытий)
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "MAISON <onboarding@resend.dev>",
    "to": ["recipient@example.com"],
    "subject": "Tracked Email",
    "html": "<p>Email content</p><img src=\"https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/track-email-open?id=EMAIL_ID\" width=\"1\" height=\"1\" />"
  }'
```

### Получение информации о письмах

```bash
# Получить информацию о письме по ID
curl -X GET 'https://api.resend.com/emails/<email_id>' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'

# Получить список всех отправленных писем
curl -X GET 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'
```

### Настройка Inbound Email (Получение писем)

**Через Dashboard:**
1. Откройте: https://resend.com/emails/receiving
2. Нажмите "Add Inbound Route"
3. Настройте:
   - **Receiving address**: `anything@eupimsel.resend.app`
   - **Webhook URL**: `https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/receive-email`
   - **Method**: POST

**Через API:**
```bash
# Создать inbound route
curl -X POST 'https://api.resend.com/inbound-routes' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "domain": "eupimsel.resend.app",
    "pattern": "*",
    "webhook_url": "https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/receive-email"
  }'

# Получить список inbound routes
curl -X GET 'https://api.resend.com/inbound-routes' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'

# Удалить inbound route
curl -X DELETE 'https://api.resend.com/inbound-routes/<route_id>' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'
```

### Webhooks (События)

```bash
# Создать webhook для отслеживания событий
curl -X POST 'https://api.resend.com/webhooks' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/resend-webhook",
    "events": ["email.sent", "email.delivered", "email.opened", "email.clicked", "email.bounced"]
  }'

# Получить список webhooks
curl -X GET 'https://api.resend.com/webhooks' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'

# Удалить webhook
curl -X DELETE 'https://api.resend.com/webhooks/<webhook_id>' \
  -H 'Authorization: Bearer re_YOUR_API_KEY'
```

---

## 🛠️ Полезные команды для разработки

### Git команды

```bash
# Проверить статус изменений
git status

# Добавить все изменения
git add .

# Закоммитить изменения
git commit -m "Add receive-email function"

# Отправить на GitHub
git push origin main

# Посмотреть историю коммитов
git log --oneline

# Создать новую ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main
```

### NPM команды

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Собрать проект
npm run build

# Запустить тесты
npm test

# Обновить все пакеты
npm update

# Проверить устаревшие пакеты
npm outdated
```

### Docker команды (для Supabase)

```bash
# Посмотреть запущенные контейнеры
docker ps

# Посмотреть все контейнеры (включая остановленные)
docker ps -a

# Остановить все контейнеры Supabase
docker stop $(docker ps -q --filter name=supabase)

# Удалить все контейнеры Supabase
docker rm $(docker ps -a -q --filter name=supabase)

# Посмотреть логи контейнера
docker logs <container_id>

# Очистить неиспользуемые образы и контейнеры
docker system prune -a
```

### Тестирование API

```bash
# Тестовый запрос к Supabase функции (production)
curl -i --location --request POST \
  'https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/receive-email' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "test@example.com",
    "to": "anything@eupimsel.resend.app",
    "subject": "Test",
    "text": "Hello World"
  }'

# Тестовый запрос с красивым выводом (требует jq)
curl -s 'https://vdpvmxzcdjtjkiwylpuv.supabase.co/functions/v1/receive-email' \
  -H 'Content-Type: application/json' \
  -d '{"from":"test@example.com","to":"test@eupimsel.resend.app","subject":"Test","text":"Hello"}' \
  | jq '.'
```

### Просмотр логов

```bash
# Посмотреть логи функции в реальном времени (локально)
supabase functions logs receive-email --follow

# Посмотреть последние 100 строк логов
supabase functions logs receive-email --tail 100

# Посмотреть логи с определенного времени
supabase functions logs receive-email --since 1h
```

### Работа с переменными окружения

```bash
# Создать .env файл
cat > .env << EOF
RESEND_API_KEY=re_your_api_key_here
SUPABASE_URL=https://vdpvmxzcdjtjkiwylpuv.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Загрузить переменные из .env
export $(cat .env | xargs)

# Проверить переменную
echo $RESEND_API_KEY
```

---

## 📊 Мониторинг и отладка

### Supabase Dashboard URLs

```bash
# Главная страница проекта
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv

# Логи функции receive-email
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/functions/receive-email/logs

# Логи функции resend-webhook
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/functions/resend-webhook/logs

# Логи функции send-checkout-email
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/functions/send-checkout-email/logs

# База данных (Table Editor)
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/editor

# SQL Editor
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/sql

# API документация
https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv/api
```

### Resend Dashboard URLs

```bash
# Главная страница
https://resend.com/emails

# Отправленные письма
https://resend.com/emails/sent

# Получение писем (Inbound)
https://resend.com/emails/receiving

# Webhooks
https://resend.com/webhooks

# API Keys
https://resend.com/api-keys

# Домены
https://resend.com/domains
```

---

## 🚀 Быстрые команды для этого проекта

### Деплой всех функций
```bash
cd /home/user/Desktop/lovable-nest-test/delight-my-style
supabase functions deploy receive-email --no-verify-jwt
supabase functions deploy resend-webhook --no-verify-jwt
supabase functions deploy send-checkout-email
```

### Запуск проекта локально
```bash
# Терминал 1: Запустить Supabase
supabase start

# Терминал 2: Запустить dev сервер
npm run dev

# Терминал 3: Запустить функции локально (опционально)
supabase functions serve
```

### Отправка тестового письма
```bash
# Через Gmail или любую почту отправьте письмо на:
# anything@eupimsel.resend.app

# Или через curl (требует настроенный SMTP)
# Проще всего использовать обычную почту!
```

---

## 📝 Примечания

### Важные файлы проекта
- `supabase/config.toml` - конфигурация Supabase функций
- `supabase/functions/*/index.ts` - код функций
- `.env` - переменные окружения (НЕ коммитить!)
- `package.json` - зависимости проекта

### Полезные ссылки
- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- Supabase CLI Docs: https://supabase.com/docs/reference/cli
- Resend API Reference: https://resend.com/docs/api-reference

### Советы
1. Всегда используйте `--no-verify-jwt` для вебхуков
2. Проверяйте логи после деплоя функций
3. Используйте предопределенный домен Resend для тестирования
4. Храните API ключи в секретах Supabase, а не в коде
5. Тестируйте функции локально перед деплоем

---

**Создано для проекта Delight My Style**
**Последнее обновление: 2026-01-30**


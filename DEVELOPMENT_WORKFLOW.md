# 🚀 Правильный Workflow для Разработки с Supabase (2025-2026)

## 📊 Текущее состояние проекта

**Что у нас есть:**
- ✅ Git репозиторий (GitHub)
- ✅ Production Supabase проект: `vdpvmxzcdjtjkiwylpuv`
- ✅ Миграции в `supabase/migrations/`
- ✅ Edge Functions в `supabase/functions/`
- ✅ Supabase CLI установлен

**Что нужно настроить:**
- ❌ Local окружение (Docker)
- ❌ Dev/Staging Supabase проект
- ❌ CI/CD pipeline (GitHub Actions)
- ❌ Правильная структура .env файлов
- ❌ Workflow для миграций

---

## 🎯 Целевая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    ОДНОНАПРАВЛЕННЫЙ ПОТОК                    │
│                                                              │
│  Local (Docker) → Dev/Staging (Cloud) → Production (Cloud)  │
│                                                              │
│      Разработка  →    Тестирование    →    Живой продукт    │
└─────────────────────────────────────────────────────────────┘
```

### Таблица окружений

| Уровень | Где живёт база | Назначение | Кто меняет схему | Как деплоить | Данные |
|---------|---------------|------------|------------------|--------------|--------|
| **Local** | Твоя машина (Docker) | Ежедневная разработка | Ты (Studio/SQL) | `supabase db diff` → migration | Тестовые |
| **Dev/Staging** | Supabase проект (app-dev) | CI/CD тесты | CI/CD + иногда ты | `supabase db push` | Тестовые |
| **Production** | Supabase проект (app-prod) | Живой продукт | Только CI/CD | Только через CI/CD | Реальные |

---

## 📝 Пошаговая реализация

### ✅ ШАГ 0: Подготовка (ТЕКУЩИЙ СТАТУС)

**Проверка:**
```bash
# Проверяем Git
git status
git remote -v

# Проверяем Supabase CLI
supabase --version

# Проверяем текущий проект
cat .env | grep SUPABASE
```

**Результат:**
- ✅ Git настроен
- ✅ Supabase CLI установлен
- ✅ Production проект: `vdpvmxzcdjtjkiwylpuv`

---

### 🔧 ШАГ 1: Настройка Local окружения (Docker)

**Цель:** Запустить полноценную копию Supabase локально

**1.1. Проверка Docker**
```bash
docker --version
docker compose version
```

**1.2. Инициализация Supabase локально**
```bash
# Если уже есть supabase/config.toml - пропускаем
# Если нет - выполняем:
supabase init
```

**1.3. Настройка config.toml**

Файл уже существует. Проверяем настройки:
```bash
cat supabase/config.toml
```

**1.4. Запуск локального Supabase**
```bash
supabase start
```

**Что происходит:**
- 🐳 Docker скачивает и запускает контейнеры (PostgreSQL, PostgREST, GoTrue, Storage и т.д.)
- ⏱️ Первый запуск занимает 2-5 минут
- 📊 После запуска вы получите URLs и ключи

**Ожидаемый результат:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**1.5. Проверка работы**
```bash
# Открываем Studio
open http://127.0.0.1:54323

# Проверяем статус
supabase status
```

**1.6. Применение существующих миграций**
```bash
# Миграции должны примениться автоматически при старте
# Проверяем:
supabase db diff --use-migra
```

Если вывод пустой - миграции применены ✅

---

### 🌍 ШАГ 2: Создание .env файлов для разных окружений

**Цель:** Разделить конфигурацию для local, dev, prod

**2.1. Создаём .env.local**
```bash
# Для локальной разработки
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key из supabase start>
VITE_SUPABASE_PROJECT_ID=local
```

**2.2. Создаём .env.development**
```bash
# Для dev/staging окружения (создадим позже)
VITE_SUPABASE_URL=https://[dev-project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<dev anon key>
VITE_SUPABASE_PROJECT_ID=[dev-project-id]
```

**2.3. Создаём .env.production**
```bash
# Для production (текущий проект)
VITE_SUPABASE_URL=https://vdpvmxzcdjtjkiwylpuv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=vdpvmxzcdjtjkiwylpuv
```

**2.4. Обновляем .gitignore**
```bash
# Добавляем в .gitignore
.env
.env.local
.env.development
.env.production
```

**2.5. Создаём .env.example**
```bash
# Шаблон для других разработчиков
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

**Проверка:**
```bash
ls -la .env*
```

Должны быть:
- ✅ `.env.local`
- ✅ `.env.development`
- ✅ `.env.production`
- ✅ `.env.example`
- ✅ `.env` (симлинк или копия .env.local)

---

### 🏗️ ШАГ 3: Создание Dev/Staging проекта в Supabase

**Цель:** Отдельный проект для тестирования перед продакшеном

**3.1. Создание проекта**

1. Открываем: https://supabase.com/dashboard
2. Нажимаем "New Project"
3. Заполняем:
   - **Name:** `delight-my-style-dev`
   - **Database Password:** (сохраните в менеджер паролей!)
   - **Region:** Same as production (для консистентности)
   - **Pricing Plan:** Free (для dev достаточно)

**3.2. Получение credentials**

После создания проекта:
```bash
# Открываем Settings → API
# Копируем:
# - Project URL
# - anon/public key
# - Project ID
```

**3.3. Обновляем .env.development**
```bash
VITE_SUPABASE_URL=https://[новый-dev-project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[новый dev anon key]
VITE_SUPABASE_PROJECT_ID=[новый-dev-project-id]
```

**3.4. Линкуем CLI к dev проекту**
```bash
# Создаём отдельный профиль для dev
supabase link --project-ref [dev-project-id]
```

**Проверка:**
```bash
supabase projects list
```

Должны видеть оба проекта (dev и prod) ✅

---

### 🔄 ШАГ 4: Workflow для работы с миграциями

**Цель:** Научиться правильно создавать и применять миграции

**4.1. Создание новой миграции (пример)**

Сценарий: Добавим новую таблицу `user_preferences`

```bash
# 1. Убедитесь что local Supabase запущен
supabase status

# 2. Открываем Studio
open http://127.0.0.1:54323

# 3. В Studio создаём таблицу через UI или SQL Editor:
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

# 4. Создаём миграцию из изменений
supabase db diff -f create_user_preferences_table

# 5. Проверяем созданный файл
cat supabase/migrations/[timestamp]_create_user_preferences_table.sql
```

**4.2. Тестирование миграции локально**
```bash
# Сбрасываем базу и применяем все миграции заново
supabase db reset

# Проверяем что всё работает
supabase db diff --use-migra
# Должно быть пусто - значит миграции применены корректно
```

**4.3. Коммит миграции в Git**
```bash
git add supabase/migrations/
git commit -m "feat: add user_preferences table"
git push origin main
```

---

### 🤖 ШАГ 5: Настройка CI/CD (GitHub Actions)

**Цель:** Автоматический деплой миграций и функций

**5.1. Создание GitHub Secrets**

Идём в GitHub: `Settings → Secrets and variables → Actions`

Добавляем секреты:

**Для DEV окружения:**
- `SUPABASE_ACCESS_TOKEN` - Personal Access Token из Supabase
- `SUPABASE_DEV_PROJECT_ID` - ID dev проекта
- `SUPABASE_DEV_DB_PASSWORD` - Database password dev проекта

**Для PRODUCTION окружения:**
- `SUPABASE_PROD_PROJECT_ID` - ID prod проекта
- `SUPABASE_PROD_DB_PASSWORD` - Database password prod проекта

**Как получить Access Token:**
```bash
# 1. Открываем: https://supabase.com/dashboard/account/tokens
# 2. Создаём новый токен: "GitHub Actions CI/CD"
# 3. Копируем и сохраняем в GitHub Secrets
```

**5.2. Создание workflow файлов**

Создаём `.github/workflows/deploy-dev.yml`:

```yaml
name: Deploy to Dev/Staging

on:
  push:
    branches:
      - develop
      - staging
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Dev Project
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_DEV_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push Database Migrations
        run: |
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy Edge Functions
        run: |
          supabase functions deploy --no-verify-jwt
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Set Secrets
        run: |
          supabase secrets set RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

Создаём `.github/workflows/deploy-prod.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Позволяет запускать вручную

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Требует подтверждения

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Production Project
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push Database Migrations
        run: |
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy Edge Functions
        run: |
          supabase functions deploy --no-verify-jwt
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Set Secrets
        run: |
          supabase secrets set RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**5.3. Настройка Protection Rules**

В GitHub: `Settings → Environments → New environment`

Создаём окружение `production`:
- ✅ Required reviewers (минимум 1 человек)
- ✅ Wait timer: 5 минут (опционально)
- ✅ Deployment branches: только `main`

---

### 📚 ШАГ 6: Git Branching Strategy

**Цель:** Правильная структура веток

```
main (production)
  ↑
  └── develop (dev/staging)
        ↑
        └── feature/user-preferences
        └── feature/email-templates
        └── bugfix/login-issue
```

**Правила:**
1. `main` → только production-ready код
2. `develop` → интеграционная ветка для dev
3. `feature/*` → новые фичи
4. `bugfix/*` → исправления багов
5. `hotfix/*` → срочные исправления для prod

**Workflow:**
```bash
# Начинаем новую фичу
git checkout develop
git pull origin develop
git checkout -b feature/user-preferences

# Работаем локально
# ... делаем изменения ...

# Коммитим
git add .
git commit -m "feat: add user preferences table"

# Пушим в develop
git push origin feature/user-preferences

# Создаём Pull Request: feature/user-preferences → develop
# После ревью и мержа → автоматический деплой в DEV

# Когда всё протестировано в DEV:
# Создаём Pull Request: develop → main
# После ревью и мержа → автоматический деплой в PRODUCTION
```

---

### 🧪 ШАГ 7: Ежедневный Workflow разработчика

**Утро:**
```bash
# 1. Обновляем код
git checkout develop
git pull origin develop

# 2. Запускаем локальный Supabase
supabase start

# 3. Проверяем что миграции применены
supabase db diff --use-migra

# 4. Запускаем приложение
npm run dev
```

**Разработка новой фичи:**
```bash
# 1. Создаём ветку
git checkout -b feature/new-feature

# 2. Делаем изменения в БД через Studio
open http://127.0.0.1:54323

# 3. Создаём миграцию
supabase db diff -f add_new_feature

# 4. Тестируем миграцию
supabase db reset

# 5. Коммитим
git add supabase/migrations/
git commit -m "feat: add new feature"

# 6. Пушим
git push origin feature/new-feature

# 7. Создаём PR → develop
```

**Вечер:**
```bash
# Останавливаем локальный Supabase (опционально)
supabase stop
```

---

### ✅ ШАГ 8: Проверочный чеклист

После настройки всего workflow проверьте:

**Local окружение:**
- [ ] `supabase start` работает
- [ ] Studio доступен на http://127.0.0.1:54323
- [ ] Приложение подключается к локальной БД
- [ ] Миграции применяются автоматически

**Dev/Staging окружение:**
- [ ] Создан отдельный Supabase проект
- [ ] `.env.development` настроен
- [ ] GitHub Actions деплоит в dev при пуше в `develop`
- [ ] Миграции применяются автоматически

**Production окружение:**
- [ ] `.env.production` настроен
- [ ] GitHub Actions деплоит в prod при пуше в `main`
- [ ] Настроена защита ветки `main`
- [ ] Требуется ревью перед мержем

**Git workflow:**
- [ ] Есть ветки `main` и `develop`
- [ ] Фичи разрабатываются в `feature/*`
- [ ] Pull Requests проходят ревью

**Безопасность:**
- [ ] `.env` файлы в `.gitignore`
- [ ] Секреты в GitHub Secrets
- [ ] Production требует подтверждения деплоя

---

### 🚨 Важные правила (НИКОГДА НЕ НАРУШАТЬ!)

1. ❌ **НИКОГДА** не меняйте схему БД напрямую в production
2. ❌ **НИКОГДА** не делайте `supabase db pull` из production в local
3. ❌ **НИКОГДА** не коммитьте `.env` файлы с реальными ключами
4. ✅ **ВСЕГДА** создавайте миграции через `supabase db diff`
5. ✅ **ВСЕГДА** тестируйте миграции локально через `supabase db reset`
6. ✅ **ВСЕГДА** деплойте через CI/CD, а не вручную

---

### 📖 Полезные команды

```bash
# Локальная разработка
supabase start                    # Запустить локальный Supabase
supabase stop                     # Остановить
supabase status                   # Проверить статус
supabase db reset                 # Пересоздать БД с миграциями

# Миграции
supabase db diff -f migration_name    # Создать миграцию
supabase db diff --use-migra          # Проверить различия
supabase migration list               # Список миграций
supabase migration repair             # Починить историю миграций

# Edge Functions
supabase functions serve              # Запустить функции локально
supabase functions deploy func_name   # Задеплоить функцию

# Проекты
supabase projects list                # Список проектов
supabase link --project-ref ID        # Подключиться к проекту
supabase unlink                       # Отключиться

# Секреты
supabase secrets list                 # Список секретов
supabase secrets set KEY=value        # Установить секрет
supabase secrets unset KEY            # Удалить секрет
```

---

## 🎓 Следующие шаги

Теперь давайте реализуем это пошагово! Начнём с:

1. **Проверки Docker** и запуска локального Supabase
2. **Создания .env файлов**
3. **Создания dev проекта**
4. **Настройки CI/CD**

Готовы начать? Скажите "да" и мы начнём с Шага 1! 🚀


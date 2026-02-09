# 🚀 Руководство по разработке

## 📋 Быстрый старт

### Локальная разработка (с Docker)

```bash
# 1. Запустить локальный Supabase
supabase start

# 2. Запустить приложение
npm run dev:local

# 3. Открыть в браузере
# Приложение: http://localhost:8082
# Studio: http://127.0.0.1:54323
```

---

## 🌍 Окружения (Environments)

У вас есть **3 окружения**:

| Окружение | Команда | .env файл | Supabase URL |
|-----------|---------|-----------|--------------|
| **Local** (Docker) | `npm run dev:local` | `.env` | `http://127.0.0.1:54321` |
| **Dev/Staging** (Cloud) | `npm run dev:dev` | `.env.development` | `https://fugpgfraaxeugjcctzkk.supabase.co` |
| **Production** (Cloud) | `npm run dev:prod` | `.env.production` | `https://vdpvmxzcdjtjkiwylpuv.supabase.co` |

---

## 🔧 Основные команды

### Supabase (локальный)

```bash
# Запустить все контейнеры
supabase start

# Остановить все контейнеры
supabase stop

# Пересоздать базу данных (применить миграции + seed)
supabase db reset

# Посмотреть статус контейнеров
supabase status

# Открыть Studio
# http://127.0.0.1:54323
```

### Приложение

```bash
# Локальная разработка (Docker Supabase)
npm run dev:local

# Dev/Staging (Cloud Supabase)
npm run dev:dev

# Production (Cloud Supabase)
npm run dev:prod

# Обычный dev (использует .env файл)
npm run dev
```

### Сборка

```bash
# Сборка для Dev
npm run build:dev

# Сборка для Production
npm run build:prod
```

---

## 📁 Структура .env файлов

```
.env                  ← Текущий активный (для npm run dev)
.env.localdev         ← Локальный Docker (для npm run dev:local)
.env.development      ← Dev/Staging Cloud (для npm run dev:dev)
.env.production       ← Production Cloud (для npm run dev:prod)
.env.example          ← Шаблон
```

**Важно:** Vite использует режим (`--mode`) для выбора файла:
- `--mode localdev` → загружает `.env.localdev`
- `--mode development` → загружает `.env.development`
- `--mode production` → загружает `.env.production`

---

## 🗄️ Работа с базой данных

### Создание миграции

```bash
# 1. Сделайте изменения в локальной базе через Studio
# http://127.0.0.1:54323

# 2. Создайте миграцию из изменений
supabase db diff -f название_миграции

# 3. Проверьте созданный файл
ls -la supabase/migrations/
```

### Применение миграций

```bash
# На локальную базу
supabase db reset

# На Dev проект
supabase link --project-ref fugpgfraaxeugjcctzkk
supabase db push

# На Production проект
supabase link --project-ref vdpvmxzcdjtjkiwylpuv
supabase db push
```

---

## ⚡ Edge Functions

### Локальная разработка

```bash
# Функции автоматически доступны при supabase start
# http://127.0.0.1:54321/functions/v1/function-name
```

### Деплой на Cloud

```bash
# Деплой всех функций на Dev
supabase functions deploy --project-ref fugpgfraaxeugjcctzkk

# Деплой одной функции на Dev
supabase functions deploy send-checkout-email --project-ref fugpgfraaxeugjcctzkk

# Деплой на Production
supabase functions deploy --project-ref vdpvmxzcdjtjkiwylpuv
```

### Установка секретов

```bash
# На Dev
supabase secrets set RESEND_API_KEY=re_xxx --project-ref fugpgfraaxeugjcctzkk

# На Production
supabase secrets set RESEND_API_KEY=re_xxx --project-ref vdpvmxzcdjtjkiwylpuv
```

---

## 👤 Создание тестовых пользователей (локально)

### Через Studio (рекомендуется)

1. Откройте http://127.0.0.1:54323
2. Authentication → Add user → Create new user
3. Email: `admin@test.com`, Password: `admin123`
4. ✅ Auto Confirm User
5. Скопируйте UUID
6. SQL Editor:
   ```sql
   INSERT INTO public.user_roles (user_id, role) 
   VALUES ('UUID_ПОЛЬЗОВАТЕЛЯ', 'admin');
   ```

### Через регистрацию

1. Откройте http://localhost:8082/register
2. Зарегистрируйтесь
3. Добавьте роль через SQL Editor (см. выше)

---

## 🔄 Типичный workflow

### Ежедневная разработка

```bash
# Утро
supabase start              # Запустить Docker
npm run dev:local           # Запустить приложение

# Вечер
# Ctrl+C в терминале        # Остановить приложение
supabase stop               # Остановить Docker (опционально)
```

### Деплой изменений на Dev

```bash
# 1. Создать миграцию (если были изменения в БД)
supabase db diff -f my_changes

# 2. Переключиться на Dev проект
supabase link --project-ref fugpgfraaxeugjcctzkk

# 3. Применить миграции
supabase db push

# 4. Задеплоить функции (если были изменения)
supabase functions deploy --project-ref fugpgfraaxeugjcctzkk

# 5. Проверить на Dev окружении
npm run dev:dev
```

### Деплой на Production

```bash
# 1. Переключиться на Production проект
supabase link --project-ref vdpvmxzcdjtjkiwylpuv

# 2. Применить миграции
supabase db push

# 3. Задеплоить функции
supabase functions deploy --project-ref vdpvmxzcdjtjkiwylpuv

# 4. Собрать и задеплоить фронтенд
npm run build:prod
# (затем загрузить на хостинг)
```

---

## 🆘 Troubleshooting

### Приложение подключается не к тому окружению

```bash
# Проверьте, какой режим используется
npm run dev:local   # ← Для локального
npm run dev:dev     # ← Для Dev
npm run dev:prod    # ← Для Production

# Откройте http://localhost:8082/debug-env
# Проверьте VITE_SUPABASE_URL
```

### База данных не работает

```bash
# Проверить статус
supabase status

# Перезапустить
supabase stop
supabase start

# Пересоздать базу
supabase db reset
```

### Миграции не применяются

```bash
# Проверить, к какому проекту подключены
supabase link --project-ref fugpgfraaxeugjcctzkk  # Dev
# или
supabase link --project-ref vdpvmxzcdjtjkiwylpuv  # Production

# Применить миграции
supabase db push
```

---

## 📚 Полезные ссылки

- **Local Studio:** http://127.0.0.1:54323
- **Local API:** http://127.0.0.1:54321
- **Dev Project:** https://supabase.com/dashboard/project/fugpgfraaxeugjcctzkk
- **Production Project:** https://supabase.com/dashboard/project/vdpvmxzcdjtjkiwylpuv


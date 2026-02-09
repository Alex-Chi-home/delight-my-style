# ⚡ Быстрый старт

## 🎯 Самые важные команды

### Каждый день (локальная разработка)

```bash
# 1. Запустить Supabase
supabase start

# 2. Запустить приложение
npm run dev:local

# 3. Открыть браузер
# http://localhost:8082
```

---

## 🌍 Переключение между окружениями

```bash
# Локальная разработка (Docker)
npm run dev:local

# Dev/Staging (Cloud)
npm run dev:dev

# Production (Cloud)
npm run dev:prod
```

**Как это работает:**
- `npm run dev:local` → использует `.env.localdev` → подключается к `http://127.0.0.1:54321`
- `npm run dev:dev` → использует `.env.development` → подключается к Dev Cloud
- `npm run dev:prod` → использует `.env.production` → подключается к Production Cloud

---

## 🗄️ База данных

```bash
# Пересоздать локальную базу (применить миграции)
supabase db reset

# Применить миграции на Dev
supabase link --project-ref fugpgfraaxeugjcctzkk
supabase db push

# Применить миграции на Production
supabase link --project-ref vdpvmxzcdjtjkiwylpuv
supabase db push
```

---

## 🔧 Создание миграции

```bash
# 1. Сделайте изменения в Studio: http://127.0.0.1:54323
# 2. Создайте миграцию:
supabase db diff -f название_миграции
```

---

## 🚀 Деплой функций

```bash
# На Dev
supabase functions deploy --project-ref fugpgfraaxeugjcctzkk

# На Production
supabase functions deploy --project-ref vdpvmxzcdjtjkiwylpuv
```

---

## 📚 Полная документация

См. [DEVELOPMENT.md](./DEVELOPMENT.md) для подробной информации.


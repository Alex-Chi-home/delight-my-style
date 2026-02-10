# 🚀 Шпаргалка по миграциям Supabase

## Быстрые команды

### Создание и тестирование миграций

```bash
# 1. Создать новую миграцию
supabase migration new название_миграции

# 2. Редактировать файл миграции
# supabase/migrations/TIMESTAMP_название_миграции.sql

# 3. Применить все миграции локально (с полным сбросом БД)
supabase db reset

# 4. Проверить что нет различий в схеме
supabase db diff --use-migra

# 5. Посмотреть список миграций
supabase migration list
```

### Деплой на удаленные серверы

```bash
# Dev окружение
supabase link --project-ref fugpgfraaxeugjcctzkk
supabase db push

# Production окружение
supabase link --project-ref vdpvmxzcdjtjkiwylpuv
supabase db push
```

### Git workflow

```bash
# 1. Создать feature branch
git checkout -b feature/add-brands-table

# 2. Добавить миграции
git add supabase/migrations/

# 3. Закоммитить
git commit -m "feat: add brands table"

# 4. Запушить
git push origin feature/add-brands-table

# 5. Создать PR на GitHub
```

### Проверка и отладка

```bash
# Статус локального Supabase
supabase status

# Открыть Studio
open http://127.0.0.1:54323

# Посмотреть логи
supabase db reset --debug

# Проверить различия с удаленной БД
supabase db diff --linked
```

## Структура миграции

```sql
-- ============================================
-- Migration: Название миграции
-- Description: Подробное описание
-- Author: Ваше имя
-- Date: YYYY-MM-DD
-- ============================================

BEGIN;

-- Ваши изменения здесь
CREATE TABLE public.example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индексы
CREATE INDEX idx_example_name ON public.example(name);

-- RLS
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

-- Политики
CREATE POLICY "Anyone can read" ON public.example FOR SELECT USING (true);

-- Комментарии
COMMENT ON TABLE public.example IS 'Описание таблицы';

COMMIT;
```

## Seed данные

### В файле миграции

```sql
-- В конце миграции
INSERT INTO public.brands (name, country) VALUES
  ('Zara', 'Spain'),
  ('Nike', 'USA');
```

### В отдельном файле seed.sql

```sql
-- supabase/seed.sql
-- Применяется автоматически после миграций при `supabase db reset`

INSERT INTO public.brands (name, country) VALUES
  ('Test Brand', 'Test Country')
ON CONFLICT (name) DO NOTHING;
```

## Откат миграций

```bash
# Создать обратную миграцию
supabase migration new rollback_название

# В файле миграции написать обратные операции
# Например:
# ALTER TABLE products DROP COLUMN brand_id;
# DROP TABLE brands;

# Применить
supabase db reset
supabase db push
```

## Полезные SQL запросы

```sql
-- Посмотреть примененные миграции
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;

-- Посмотреть все таблицы
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public';

-- Посмотреть структуру таблицы
\d public.brands

-- Посмотреть индексы
SELECT * FROM pg_indexes 
WHERE tablename = 'brands';

-- Посмотреть RLS политики
SELECT * FROM pg_policies 
WHERE tablename = 'brands';
```

## Troubleshooting

```bash
# Миграция не применяется
supabase migration repair --status applied TIMESTAMP

# Сбросить локальную БД
supabase db reset

# Пересоздать контейнеры
supabase stop
supabase start

# Проверить логи
docker logs supabase_db_vdpvmxzcdjtjkiwylpuv
```

## Best Practices

✅ **DO:**
- Тестируйте миграции локально перед деплоем
- Используйте транзакции (BEGIN/COMMIT)
- Добавляйте комментарии к таблицам и полям
- Создавайте индексы для foreign keys
- Используйте осмысленные имена миграций
- Делайте code review через Pull Request

❌ **DON'T:**
- Не редактируйте старые миграции
- Не деплойте на Production без тестирования
- Не используйте DROP без бэкапа
- Не забывайте про RLS политики
- Не коммитьте seed данные с реальными пользователями

## Ссылки

- [Полное руководство](./MIGRATION_GUIDE.md)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Local Studio](http://127.0.0.1:54323)


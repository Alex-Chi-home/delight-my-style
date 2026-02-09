-- Seed file for local development
-- Этот файл выполняется каждый раз при `supabase db reset`

-- NOTE: Пользователей нужно создавать через Studio или регистрацию
-- Прямая вставка в auth.users не работает из-за сложного хеширования паролей

-- Выводим информацию
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data ready!';
  RAISE NOTICE '📦 Products: % items', (SELECT count(*) FROM public.products);
  RAISE NOTICE '';
  RAISE NOTICE '👉 Создайте тестовых пользователей через:';
  RAISE NOTICE '   1. Studio: http://127.0.0.1:54323 → Authentication → Add user';
  RAISE NOTICE '   2. Или зарегистрируйтесь через приложение: http://localhost:8082/register';
  RAISE NOTICE '';
  RAISE NOTICE '👉 Чтобы сделать пользователя админом, выполните в SQL Editor:';
  RAISE NOTICE '   INSERT INTO public.user_roles (user_id, role) VALUES (''USER_UUID'', ''admin'');';
END $$;


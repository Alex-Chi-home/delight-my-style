-- ============================================
-- Migration: Create brands table
-- Description: Добавляем таблицу для хранения информации о брендах одежды
-- Author: Migration Training
-- Date: 2026-02-10
-- ============================================

-- Создаем таблицу brands
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  country TEXT,
  founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индекс для быстрого поиска по имени
CREATE INDEX idx_brands_name ON public.brands(name);

-- Создаем индекс для фильтрации активных брендов
CREATE INDEX idx_brands_is_active ON public.brands(is_active);

-- Добавляем комментарии к таблице и полям (для документации)
COMMENT ON TABLE public.brands IS 'Таблица для хранения информации о брендах одежды';
COMMENT ON COLUMN public.brands.name IS 'Название бренда (уникальное)';
COMMENT ON COLUMN public.brands.description IS 'Описание бренда';
COMMENT ON COLUMN public.brands.logo_url IS 'URL логотипа бренда';
COMMENT ON COLUMN public.brands.website IS 'Официальный сайт бренда';
COMMENT ON COLUMN public.brands.country IS 'Страна происхождения бренда';
COMMENT ON COLUMN public.brands.founded_year IS 'Год основания бренда';
COMMENT ON COLUMN public.brands.is_active IS 'Активен ли бренд (для мягкого удаления)';

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Включаем Row Level Security (RLS)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать активные бренды
CREATE POLICY "Anyone can view active brands"
  ON public.brands
  FOR SELECT
  USING (is_active = true);

-- Политика: только админы могут создавать бренды
CREATE POLICY "Only admins can insert brands"
  ON public.brands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Политика: только админы могут обновлять бренды
CREATE POLICY "Only admins can update brands"
  ON public.brands
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Политика: только админы могут удалять бренды
CREATE POLICY "Only admins can delete brands"
  ON public.brands
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- Seed данные (тестовые бренды)
-- ============================================

INSERT INTO public.brands (name, description, logo_url, website, country, founded_year, is_active) VALUES
  (
    'Zara',
    'Испанский бренд быстрой моды, известный своими трендовыми коллекциями и доступными ценами',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    'https://www.zara.com',
    'Spain',
    1975,
    true
  ),
  (
    'H&M',
    'Шведский бренд модной одежды, предлагающий стильные и доступные вещи для всей семьи',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200',
    'https://www.hm.com',
    'Sweden',
    1947,
    true
  ),
  (
    'Nike',
    'Американский спортивный бренд, лидер в производстве спортивной одежды и обуви',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    'https://www.nike.com',
    'USA',
    1964,
    true
  ),
  (
    'Adidas',
    'Немецкий спортивный бренд с богатой историей и культовыми моделями',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200',
    'https://www.adidas.com',
    'Germany',
    1949,
    true
  ),
  (
    'Uniqlo',
    'Японский бренд базовой одежды высокого качества с минималистичным дизайном',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200',
    'https://www.uniqlo.com',
    'Japan',
    1984,
    true
  ),
  (
    'Gucci',
    'Итальянский люксовый бренд, символ роскоши и изысканного стиля',
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=200',
    'https://www.gucci.com',
    'Italy',
    1921,
    true
  );

-- Выводим информацию о созданных брендах
DO $$
DECLARE
  brand_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO brand_count FROM public.brands;
  RAISE NOTICE 'Successfully created brands table with % brands', brand_count;
END $$;

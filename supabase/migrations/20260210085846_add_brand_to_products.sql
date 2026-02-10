-- ============================================
-- Migration: Add brand relationship to products
-- Description: Добавляем поле brand_id в таблицу products и связываем с brands
-- Author: Migration Training
-- Date: 2026-02-10
-- ============================================

-- Добавляем колонку brand_id в таблицу products
ALTER TABLE public.products
ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Создаем индекс для быстрого поиска товаров по бренду
CREATE INDEX idx_products_brand_id ON public.products(brand_id);

-- Добавляем комментарий к новой колонке
COMMENT ON COLUMN public.products.brand_id IS 'ID бренда товара (связь с таблицей brands)';

-- ============================================
-- Обновляем существующие товары, привязывая их к брендам
-- ============================================

DO $$
DECLARE
  zara_id UUID;
  nike_id UUID;
  uniqlo_id UUID;
  gucci_id UUID;
BEGIN
  -- Получаем ID брендов
  SELECT id INTO zara_id FROM public.brands WHERE name = 'Zara';
  SELECT id INTO nike_id FROM public.brands WHERE name = 'Nike';
  SELECT id INTO uniqlo_id FROM public.brands WHERE name = 'Uniqlo';
  SELECT id INTO gucci_id FROM public.brands WHERE name = 'Gucci';

  -- Обновляем существующие товары
  -- Предполагаем, что у нас есть товары из seed.sql

  -- Обновляем товары, которые подходят под стиль Uniqlo (минималистичные)
  UPDATE public.products
  SET brand_id = uniqlo_id
  WHERE name ILIKE '%cotton%' OR name ILIKE '%minimal%';

  -- Обновляем товары, которые подходят под стиль Gucci (премиум)
  UPDATE public.products
  SET brand_id = gucci_id
  WHERE name ILIKE '%wool%' OR name ILIKE '%tailored%' OR price > 150;

  RAISE NOTICE 'Successfully linked existing products to brands';
END $$;

-- ============================================
-- Создаем представление (view) для удобного получения товаров с брендами
-- ============================================

CREATE OR REPLACE VIEW public.products_with_brands AS
SELECT
  p.id,
  p.name AS product_name,
  p.description,
  p.price,
  p.category,
  p.sizes,
  p.colors,
  p.images,
  p.in_stock,
  b.id AS brand_id,
  b.name AS brand_name,
  b.country AS brand_country,
  b.logo_url AS brand_logo,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.brands b ON p.brand_id = b.id;

-- Добавляем комментарий к представлению
COMMENT ON VIEW public.products_with_brands IS 'Представление товаров с информацией о брендах';

-- ============================================
-- Создаем функцию для получения товаров по бренду
-- ============================================

CREATE OR REPLACE FUNCTION public.get_products_by_brand(brand_name_param TEXT)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  price NUMERIC,
  category TEXT,
  brand_name TEXT,
  brand_country TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.category,
    b.name,
    b.country
  FROM public.products p
  INNER JOIN public.brands b ON p.brand_id = b.id
  WHERE b.name ILIKE brand_name_param
  AND p.in_stock = true
  AND b.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Добавляем комментарий к функции
COMMENT ON FUNCTION public.get_products_by_brand IS 'Получить все активные товары определенного бренда';

-- Выводим статистику
DO $$
DECLARE
  products_with_brand INTEGER;
  products_without_brand INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_with_brand FROM public.products WHERE brand_id IS NOT NULL;
  SELECT COUNT(*) INTO products_without_brand FROM public.products WHERE brand_id IS NULL;

  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Products with brand: %', products_with_brand;
  RAISE NOTICE '📊 Products without brand: %', products_without_brand;
END $$;

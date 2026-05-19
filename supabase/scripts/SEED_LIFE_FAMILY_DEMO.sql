-- STOS Life — dữ liệu demo tab Gia đình tôi (khớp mockup)
-- Chạy sau: migrations + STOS_MOBILE_FULL_SETUP.sql + SEED_MOBILE_DEMO.sql + SETUP_LIFE_TEST_ACCOUNT.sql

DO $$
DECLARE
  v_tenant_id uuid;
  v_building_id uuid;
  v_resident_id uuid;
  v_household_id uuid;
  v_member_minh uuid;
  v_member_an uuid;
  v_spending_month_id uuid;
  v_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  v_month int := EXTRACT(MONTH FROM CURRENT_DATE)::int;
BEGIN
  SELECT r.id, r.tenant_id, r.building_id
  INTO v_resident_id, v_tenant_id, v_building_id
  FROM public.residents r
  WHERE r.status = 'active'
  ORDER BY (r.user_id IS NOT NULL) DESC, r.created_at
  LIMIT 1;

  IF v_resident_id IS NULL THEN
    RAISE EXCEPTION 'Chưa có resident. Chạy SEED_MOBILE_DEMO.sql trước.';
  END IF;

  SELECT id INTO v_household_id
  FROM public.life_households
  WHERE primary_resident_id = v_resident_id
  LIMIT 1;

  IF v_household_id IS NULL THEN
    INSERT INTO public.life_households (
      tenant_id, building_id, primary_resident_id, name, motto, photo_url
    ) VALUES (
      v_tenant_id,
      v_building_id,
      v_resident_id,
      'Gia đình Minh',
      'Cùng nhau xây dựng tổ ấm an toàn – hạnh phúc – tiện nghi',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop&crop=faces'
    )
    RETURNING id INTO v_household_id;
    RAISE NOTICE 'Created household: %', v_household_id;
  ELSE
    UPDATE public.life_households SET
      name = 'Gia đình Minh',
      motto = 'Cùng nhau xây dựng tổ ấm an toàn – hạnh phúc – tiện nghi',
      photo_url = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop&crop=faces'
    WHERE id = v_household_id;
  END IF;

  DELETE FROM public.life_household_members WHERE household_id = v_household_id;

  INSERT INTO public.life_household_members (
    household_id, resident_id, display_name, role, birth_year, accent_color, sort_order, is_child
  ) VALUES
    (v_household_id, v_resident_id, 'Anh Minh', 'owner', 1985, '#2563EB', 1, false);

  INSERT INTO public.life_household_members (
    household_id, display_name, role, birth_year, accent_color, sort_order, is_child
  ) VALUES
    (v_household_id, 'Chị Lan', 'spouse', 1987, '#7C3AED', 2, false),
    (v_household_id, 'Bé Minh', 'child', 2019, '#7C3AED', 3, true),
    (v_household_id, 'Bé An', 'child', 2022, '#22C55E', 4, true);

  SELECT id INTO v_member_minh FROM public.life_household_members
  WHERE household_id = v_household_id AND display_name = 'Bé Minh' LIMIT 1;

  SELECT id INTO v_member_an FROM public.life_household_members
  WHERE household_id = v_household_id AND display_name = 'Bé An' LIMIT 1;

  -- Service catalog (labels static per tenant; icon_key → app gradient icon)
  INSERT INTO public.life_family_service_catalog (tenant_id, service_key, label, icon_key, sort_order)
  VALUES
    (v_tenant_id, 'travel', 'Cả nhà du lịch', 'plane', 1),
    (v_tenant_id, 'home', 'Dịch vụ tại nhà', 'home', 2),
    (v_tenant_id, 'car', 'Đặt xe gia đình', 'car', 3),
    (v_tenant_id, 'shop', 'Mua sắm hộ', 'cart', 4),
    (v_tenant_id, 'vip', 'Gói ưu đãi', 'crown', 5)
  ON CONFLICT (tenant_id, service_key) DO UPDATE SET
    label = EXCLUDED.label,
    icon_key = EXCLUDED.icon_key,
    sort_order = EXCLUDED.sort_order,
    is_active = true;

  -- Spending tháng 5/2026
  INSERT INTO public.life_spending_months (
    household_id, year, month, total_amount, prev_total_amount, budget_amount
  ) VALUES (v_household_id, v_year, v_month, 18450000, 20100000, 24000000)
  ON CONFLICT (household_id, year, month) DO UPDATE SET
    total_amount = EXCLUDED.total_amount,
    prev_total_amount = EXCLUDED.prev_total_amount,
    budget_amount = EXCLUDED.budget_amount
  RETURNING id INTO v_spending_month_id;

  IF v_spending_month_id IS NULL THEN
    SELECT id INTO v_spending_month_id FROM public.life_spending_months
    WHERE household_id = v_household_id AND year = v_year AND month = v_month;
  END IF;

  DELETE FROM public.life_spending_categories WHERE spending_month_id = v_spending_month_id;
  DELETE FROM public.life_spending_transactions WHERE spending_month_id = v_spending_month_id;

  INSERT INTO public.life_spending_categories (spending_month_id, label, amount, pct, color_hex, trend_label, trend_up, sort_order)
  VALUES
    (v_spending_month_id, 'Ăn uống', 5535000, 30, '#2563EB', '▼ 12%', false, 1),
    (v_spending_month_id, 'Nhà cửa', 4612500, 25, '#7C3AED', '↑ 8%', true, 2),
    (v_spending_month_id, 'Con cái', 2767500, 15, '#F97316', '▼ 5%', false, 3),
    (v_spending_month_id, 'Y tế', 1476000, 8, '#22C55E', '↑ 3%', true, 4),
    (v_spending_month_id, 'Di chuyển', 1291500, 7, '#06B6D4', '▼ 2%', false, 5),
    (v_spending_month_id, 'Giải trí', 1107000, 6, '#EAB308', '↑ 15%', true, 6),
    (v_spending_month_id, 'Khác', 1660500, 9, '#94A3B8', NULL, false, 7);

  INSERT INTO public.life_spending_transactions (spending_month_id, merchant, category_label, amount, spent_on, icon_key, sort_order)
  VALUES
    (v_spending_month_id, 'Farm Fresh', 'Ăn uống', 230000, CURRENT_DATE, 'leaf-store', 1),
    (v_spending_month_id, 'Co.opmart', 'Ăn uống', 450000, CURRENT_DATE, 'shopping', 2),
    (v_spending_month_id, 'Highlands Coffee', 'Ăn uống', 95000, CURRENT_DATE, 'coffee', 3),
    (v_spending_month_id, 'Tiền điện tháng 5', 'Nhà cửa', 1250000, CURRENT_DATE - 1, 'lightning', 4),
    (v_spending_month_id, 'Phí gửi xe', 'Di chuyển', 120000, CURRENT_DATE - 1, 'car', 5);

  -- Lịch con (hôm nay + tuần)
  DELETE FROM public.life_calendar_events WHERE household_id = v_household_id;

  INSERT INTO public.life_calendar_events (household_id, member_id, title, event_date, starts_at, category)
  VALUES
    (v_household_id, v_member_minh, 'Lớp Piano', CURRENT_DATE, (CURRENT_DATE + TIME '18:00')::timestamptz, 'class'),
    (v_household_id, v_member_minh, 'Đón con tan học', CURRENT_DATE, (CURRENT_DATE + TIME '16:30')::timestamptz, 'pickup'),
    (v_household_id, v_member_minh, 'Bơi lội', CURRENT_DATE + 1, NULL, 'sport'),
    (v_household_id, v_member_an, 'Mầm non', CURRENT_DATE, (CURRENT_DATE + TIME '08:00')::timestamptz, 'school'),
    (v_household_id, v_member_an, 'Vẽ tranh', CURRENT_DATE, (CURRENT_DATE + TIME '15:00')::timestamptz, 'class'),
    (v_household_id, v_member_an, 'Ngủ trưa', CURRENT_DATE, NULL, 'rest');

  -- Tủ lạnh
  DELETE FROM public.life_fridge_items WHERE household_id = v_household_id;

  INSERT INTO public.life_fridge_items (household_id, name, image_url, expiry_date, sort_order)
  VALUES
    (v_household_id, 'Dâu tây', 'https://images.unsplash.com/photo-1464965911861-746a86a4400f?w=200&h=200&fit=crop', CURRENT_DATE + 1, 1),
    (v_household_id, 'Sữa tươi', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop', CURRENT_DATE + 2, 2),
    (v_household_id, 'Cá hồi', 'https://images.unsplash.com/photo-1519708223418-c8fd9a32b2a2?w=200&h=200&fit=crop', CURRENT_DATE + 4, 3);

  -- Sức khỏe
  DELETE FROM public.life_health_reminders WHERE household_id = v_household_id;

  INSERT INTO public.life_health_reminders (household_id, member_label, reminder_text, scheduled_at, reminder_type, accent_color)
  VALUES
    (v_household_id, 'Mẹ', 'Mẹ cần uống thuốc (20:00 hôm nay)', (CURRENT_DATE + TIME '20:00')::timestamptz, 'medication', '#DB2777'),
    (v_household_id, 'Bố', 'Bố có lịch khám (10:00 · 20/05)', (DATE '2026-05-20' + TIME '10:00')::timestamptz, 'appointment', '#7C3AED');

  -- Khoảnh khắc
  DELETE FROM public.life_family_moments WHERE household_id = v_household_id;

  INSERT INTO public.life_family_moments (household_id, title, moment_date, image_url, sort_order)
  VALUES
    (v_household_id, 'Đà Nẵng – Hội An', '2024-05-20', 'https://images.unsplash.com/photo-1559592413-7cec4d0ef32b?w=400&h=280&fit=crop', 1),
    (v_household_id, 'Sinh nhật bé An', '2024-05-12', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=280&fit=crop', 2),
    (v_household_id, 'Bữa cơm cuối tuần', '2024-05-05', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=280&fit=crop', 3),
    (v_household_id, 'Ngày của mẹ', '2024-05-10', 'https://images.unsplash.com/photo-1492633423046-b43a2a7c4f8e?w=400&h=280&fit=crop', 4);

  RAISE NOTICE 'Life family demo seeded for household % (resident %)', v_household_id, v_resident_id;
END $$;

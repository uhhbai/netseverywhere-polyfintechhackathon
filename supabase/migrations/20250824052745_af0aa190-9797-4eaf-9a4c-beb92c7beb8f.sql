-- Enhanced seed function with more realistic demo users and group pay/referral data
CREATE OR REPLACE FUNCTION public.seed_demo_users()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create sample profiles for demo leaderboard with more realistic data
  INSERT INTO public.profiles (user_id, display_name, balance, total_spent, streak_count)
  VALUES 
    (gen_random_uuid(), 'Sarah Chen', 1250.50, 4500.00, 45),
    (gen_random_uuid(), 'Alex Kumar', 850.75, 3200.50, 38),
    (gen_random_uuid(), 'Rachel Wong', 2100.20, 8500.75, 62),
    (gen_random_uuid(), 'David Lim', 650.30, 2950.25, 28),
    (gen_random_uuid(), 'Emily Tan', 1850.45, 6200.80, 51),
    (gen_random_uuid(), 'Marcus Lee', 920.15, 3650.40, 33),
    (gen_random_uuid(), 'Priya Singh', 1350.60, 4750.90, 41),
    (gen_random_uuid(), 'Jordan Ng', 750.85, 2800.30, 25),
    (gen_random_uuid(), 'Lisa Kim', 1650.20, 5100.65, 48),
    (gen_random_uuid(), 'Ryan Teo', 1050.40, 3950.15, 35),
    (gen_random_uuid(), 'Michelle Loh', 1480.75, 5250.30, 44),
    (gen_random_uuid(), 'Kevin Ong', 890.60, 3100.85, 29),
    (gen_random_uuid(), 'Amanda Koh', 1750.90, 6800.40, 56),
    (gen_random_uuid(), 'Brandon Yap', 1120.35, 4200.75, 37),
    (gen_random_uuid(), 'Jasmine Goh', 980.45, 3450.20, 31),
    (gen_random_uuid(), 'Daniel Chua', 1560.80, 5850.60, 49),
    (gen_random_uuid(), 'Stephanie Wee', 1230.15, 4650.90, 43),
    (gen_random_uuid(), 'Jonathan Sim', 825.70, 2750.35, 26),
    (gen_random_uuid(), 'Nicole Tan', 1680.25, 6200.45, 53),
    (gen_random_uuid(), 'Wesley Kang', 1190.55, 4350.80, 39),
    (gen_random_uuid(), 'Cheryl Lim', 1420.90, 5450.25, 46),
    (gen_random_uuid(), 'Benjamin Ho', 760.40, 2650.70, 22),
    (gen_random_uuid(), 'Grace Ng', 1590.65, 5950.15, 50),
    (gen_random_uuid(), 'Aaron Toh', 1080.30, 3850.90, 34),
    (gen_random_uuid(), 'Vanessa Lee', 1270.85, 4750.35, 42)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create sample group pay sessions for demo
  INSERT INTO public.group_pay_sessions (id, creator_id, session_name, total_amount, subtotal, gst_amount, service_charge, status)
  SELECT 
    gen_random_uuid(),
    (SELECT user_id FROM profiles ORDER BY random() LIMIT 1),
    session_data.name,
    session_data.total,
    session_data.subtotal,
    session_data.gst,
    session_data.service,
    'completed'
  FROM (
    VALUES 
      ('Din Tai Fung Dinner', 85.60, 72.86, 5.10, 7.29),
      ('McDonald''s Lunch', 42.30, 36.01, 2.52, 3.60),
      ('Pizza Hut Family Meal', 68.90, 58.66, 4.11, 5.87),
      ('Starbucks Coffee Run', 28.40, 24.17, 1.69, 2.42),
      ('KFC Bucket Meal', 56.80, 48.38, 3.39, 4.84),
      ('Subway Sandwich Order', 34.70, 29.55, 2.07, 2.96),
      ('Bubble Tea Session', 22.60, 19.24, 1.35, 1.92),
      ('Thai Express Dinner', 47.90, 40.77, 2.85, 4.08)
  ) AS session_data(name, total, subtotal, gst, service)
  ON CONFLICT DO NOTHING;

  -- Create sample referrals for demo
  INSERT INTO public.referrals (referrer_id, referral_code, referee_email, status, reward_amount)
  SELECT 
    (SELECT user_id FROM profiles ORDER BY random() LIMIT 1),
    'REF' || LPAD((random() * 999999)::int::text, 6, '0'),
    'friend' || (random() * 100)::int || '@example.com',
    CASE WHEN random() > 0.3 THEN 'completed' ELSE 'pending' END,
    CASE WHEN random() > 0.3 THEN 15.00 ELSE 10.00 END
  FROM generate_series(1, 25)
  ON CONFLICT DO NOTHING;
END;
$function$;
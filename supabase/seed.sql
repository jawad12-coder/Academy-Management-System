-- ============================================================
-- THE AWAN ACADEMY — SEED DATA
-- Run AFTER schema.sql and policies.sql
-- ============================================================

-- ─── CLASSES ─────────────────────────────────────
INSERT INTO classes (id, name, level, monthly_fee) VALUES
  (gen_random_uuid(), 'Class 1',  'Primary',          1500),
  (gen_random_uuid(), 'Class 2',  'Primary',          1500),
  (gen_random_uuid(), 'Class 3',  'Primary',          1500),
  (gen_random_uuid(), 'Class 4',  'Primary',          1500),
  (gen_random_uuid(), 'Class 5',  'Primary',          2000),
  (gen_random_uuid(), 'Class 6',  'Middle',           2000),
  (gen_random_uuid(), 'Class 7',  'Middle',           2500),
  (gen_random_uuid(), 'Class 8',  'Middle',           2500),
  (gen_random_uuid(), 'Class 9',  'Secondary',        3500),
  (gen_random_uuid(), 'Class 10', 'Secondary',        3500),
  (gen_random_uuid(), 'FSC',      'Higher Secondary', NULL),
  (gen_random_uuid(), 'ICS',      'Higher Secondary', NULL)
ON CONFLICT DO NOTHING;

-- ─── TEACHERS (public data only, no auth accounts) ─────────────────────────
INSERT INTO teachers (id, full_name, subjects, status) VALUES
  (gen_random_uuid(), 'Sir Junaid',   ARRAY['Mathematics','Computer Science','Urdu'],          'active'),
  (gen_random_uuid(), 'Sir Shoaib',   ARRAY['Chemistry','Physics'],                            'active'),
  (gen_random_uuid(), 'Sir Mudasir',  ARRAY['English'],                                        'active'),
  (gen_random_uuid(), 'Miss Uzra',    ARRAY['Biology','English','General Science'],             'active'),
  (gen_random_uuid(), 'Miss Shanzil', ARRAY['Islamiat','Tarjama tul Quran'],                   'active'),
  (gen_random_uuid(), 'Miss Hijab',   ARRAY['General Mathematics'],                            'active'),
  (gen_random_uuid(), 'Miss Komal',   ARRAY['Arts'],                                           'active')
ON CONFLICT DO NOTHING;

-- ─── SETTINGS ─────────────────────────────────────
INSERT INTO settings (key, value) VALUES
  ('academy_name',     '"The Awan Academy"'),
  ('phone',            '"+92 333 1962657"'),
  ('email',            '"awansacademy@gmail.com"'),
  ('timings',          '"4:00 PM to 7:30 PM (Pakistan Standard Time)"'),
  ('instagram',        '"The Awan Academy"'),
  ('tiktok',           '"The Awan Academy"'),
  ('youtube',          '"The Awan Academy"'),
  ('total_students',   '130'),
  ('total_teachers',   '7'),
  ('admission_open',   'true'),
  ('session',          '"2026-27"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── RESULT HIGHLIGHTS ─────────────────────────────────────
INSERT INTO result_highlights (title, description, year, category, is_public) VALUES
  ('SSC-II 2025 — 100% Result', 'The Awan Academy achieved 100% result in SSC-II 2025. Top scorer: Taha Bin Tanveer with 512 marks.', 2025, 'SSC-II', true),
  ('Top Scorer — Taha Bin Tanveer',  '512 marks in SSC-II Separate 2025', 2025, 'SSC-II', true),
  ('Hassan Asghar — 501 marks',      'Outstanding performance in SSC-II 2025', 2025, 'SSC-II', true),
  ('Muqaddas Qureshi — 500 marks',   'Brilliant result in SSC-II 2025', 2025, 'SSC-II', true)
ON CONFLICT DO NOTHING;

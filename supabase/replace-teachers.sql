-- Run once in Supabase SQL Editor to remove every existing teacher and login.
-- This also deletes teacher assignments; homework/timetable references become NULL.
BEGIN;

CREATE TEMP TABLE old_teacher_users AS
SELECT profile_id AS id FROM public.teachers WHERE profile_id IS NOT NULL
UNION
SELECT id FROM public.profiles WHERE role = 'teacher';

DELETE FROM public.teachers;

-- Deleting Auth users cascades to their public.profiles rows.
DELETE FROM auth.users
WHERE id IN (SELECT id FROM old_teacher_users);

COMMIT;

-- Both counts should be zero.
SELECT
  (SELECT count(*) FROM public.teachers) AS teachers_remaining,
  (SELECT count(*) FROM public.profiles WHERE role = 'teacher') AS teacher_profiles_remaining;

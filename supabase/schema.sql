-- ============================================================
-- THE AWAN ACADEMY — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Seeded reference records must stay unique when seed.sql is run again.
-- The indexes are also repeated at the end of advisor-fixes.sql for projects
-- that were created before this safeguard was added.

-- ─────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','teacher','parent','student')),
  phone text,
  email text,
  avatar_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- CLASSES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text,
  monthly_fee numeric,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- SUBJECTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- BATCHES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  timing text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  email text,
  qualification text,
  bio text,
  subjects text[],
  photo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  admission_no text UNIQUE NOT NULL,
  full_name text NOT NULL,
  father_name text,
  guardian_phone text,
  gender text CHECK (gender IN ('male','female','other')),
  date_of_birth date,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','graduated')),
  address text,
  profile_image_url text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- PARENTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- STUDENT ↔ PARENT LINK
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relation text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

-- ─────────────────────────────────────────────────
-- TEACHER ASSIGNMENTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- TIMETABLE
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present','absent','late','leave')),
  marked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  remarks text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- ─────────────────────────────────────────────────
-- FEE RECORDS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,  -- for FSC/ICS per-subject fees
  month text NOT NULL,  -- '01' to '12'
  year integer NOT NULL,
  amount numeric NOT NULL,
  paid_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid','partial')),
  due_date date,
  paid_at timestamptz,
  payment_method text,
  receipt_no text,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- EXAMS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  total_marks numeric,
  exam_date date,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- RESULTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  obtained_marks numeric,
  grade text,
  remarks text,
  entered_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

-- ─────────────────────────────────────────────────
-- HOMEWORK
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  due_date date,
  attachment_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- NOTICES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('all','admins','teachers','parents','students','class')),
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- ADMISSION INQUIRIES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admission_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  guardian_name text NOT NULL,
  phone text NOT NULL,
  desired_class text NOT NULL,
  current_school text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','admitted','rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- GALLERY
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  category text NOT NULL,
  is_public boolean DEFAULT true,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- RESULT HIGHLIGHTS (public results page)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS result_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  year integer,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'complaint' CHECK (type IN ('complaint','inquiry','announcement','reply')),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read')),
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- INDEXES (for performance on free tier)
-- ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_student_id ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_year_month ON fee_records(year, month);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent_id ON student_parents(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_student_id ON student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_class_id ON homework(class_id);
CREATE INDEX IF NOT EXISTS idx_notices_audience ON notices(audience);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_is_public ON gallery(is_public);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Idempotent seed safeguards
CREATE UNIQUE INDEX IF NOT EXISTS classes_name_unique ON classes(name);
CREATE UNIQUE INDEX IF NOT EXISTS public_teachers_name_unique
  ON teachers(full_name) WHERE profile_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS result_highlights_title_unique
  ON result_highlights(title);

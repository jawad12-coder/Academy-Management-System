-- ============================================================
-- THE AWAN ACADEMY — ROW LEVEL SECURITY POLICIES
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role. SECURITY DEFINER is required
-- here to avoid recursive RLS evaluation on profiles. Pin the search path and
-- expose it only to signed-in users so it cannot be called by the public API.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, service_role;

-- ─────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins see all profiles" ON profiles FOR SELECT TO authenticated
  USING (get_my_role() IN ('owner','admin'));

CREATE POLICY "Users see own profile" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins manage profiles" ON profiles FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin'))
  WITH CHECK (get_my_role() IN ('owner','admin'));

-- ─────────────────────────────────────────────────
-- CLASSES, SUBJECTS, BATCHES (read for all auth)
-- ─────────────────────────────────────────────────
CREATE POLICY "All auth users read classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage classes" ON classes FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "All auth users read subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON subjects FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "All auth users read batches" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage batches" ON batches FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

-- ─────────────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage teachers" ON teachers FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers see own record" ON teachers FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "All auth read active teachers" ON teachers FOR SELECT TO authenticated
  USING (status = 'active');

-- ─────────────────────────────────────────────────
-- TEACHER ASSIGNMENTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage assignments" ON teacher_assignments FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers see own assignments" ON teacher_assignments FOR SELECT TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
  );

-- ─────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage students" ON students FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers see assigned class students" ON students FOR SELECT TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    class_id IN (
      SELECT ta.class_id FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "Students see own record" ON students FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Parents see linked students" ON students FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND
    id IN (
      SELECT sp.student_id FROM student_parents sp
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- PARENTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage parents" ON parents FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Parents see own record" ON parents FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- ─────────────────────────────────────────────────
-- STUDENT_PARENTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage student_parents" ON student_parents FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Parents see own links" ON student_parents FOR SELECT TO authenticated
  USING (
    parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
  );

-- ─────────────────────────────────────────────────
-- TIMETABLE
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage timetable" ON timetable FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers see own timetable" ON timetable FOR SELECT TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students see class timetable" ON timetable FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND
    class_id IN (SELECT class_id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents see child timetable" ON timetable FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND
    class_id IN (
      SELECT s.class_id FROM students s
      JOIN student_parents sp ON sp.student_id = s.id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage attendance" ON attendance FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers manage attendance for assigned classes" ON attendance FOR ALL TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    class_id IN (
      SELECT ta.class_id FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      WHERE t.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    get_my_role() = 'teacher' AND
    class_id IN (
      SELECT ta.class_id FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "Students see own attendance" ON attendance FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents see child attendance" ON attendance FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND
    student_id IN (
      SELECT sp.student_id FROM student_parents sp
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- FEE RECORDS — Students NEVER see fees
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage fees" ON fee_records FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Parents see linked child fees" ON fee_records FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND
    student_id IN (
      SELECT sp.student_id FROM student_parents sp
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );
-- NO policy for teacher or student roles on fee_records

-- ─────────────────────────────────────────────────
-- EXAMS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage exams" ON exams FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers see assigned class exams" ON exams FOR SELECT TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    class_id IN (
      SELECT ta.class_id FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "Students see published exams for own class" ON exams FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND is_published = true AND
    class_id IN (SELECT class_id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents see published exams for child class" ON exams FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND is_published = true AND
    class_id IN (
      SELECT s.class_id FROM students s
      JOIN student_parents sp ON sp.student_id = s.id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- RESULTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage results" ON results FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers enter results for assigned classes" ON results FOR ALL TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    exam_id IN (
      SELECT e.id FROM exams e
      WHERE e.class_id IN (
        SELECT ta.class_id FROM teacher_assignments ta
        JOIN teachers t ON ta.teacher_id = t.id
        WHERE t.profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (get_my_role() = 'teacher');

CREATE POLICY "Students see own published results" ON results FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND is_published = true AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents see child published results" ON results FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND is_published = true AND
    student_id IN (
      SELECT sp.student_id FROM student_parents sp
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- HOMEWORK
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage homework" ON homework FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers manage own homework" ON homework FOR ALL TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
  )
  WITH CHECK (get_my_role() = 'teacher');

CREATE POLICY "Students see published homework for own class" ON homework FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND is_published = true AND
    class_id IN (SELECT class_id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents see published homework for child" ON homework FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND is_published = true AND
    class_id IN (
      SELECT s.class_id FROM students s
      JOIN student_parents sp ON sp.student_id = s.id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────
-- NOTICES
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage notices" ON notices FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Teachers manage own notices" ON notices FOR ALL TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    (audience IN ('teachers','all') OR created_by = auth.uid())
  )
  WITH CHECK (get_my_role() = 'teacher');

CREATE POLICY "Students see relevant notices" ON notices FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND is_published = true AND
    (audience IN ('all','students') OR (
      audience = 'class' AND
      class_id IN (SELECT class_id FROM students WHERE profile_id = auth.uid())
    ))
  );

CREATE POLICY "Parents see relevant notices" ON notices FOR SELECT TO authenticated
  USING (
    get_my_role() = 'parent' AND is_published = true AND
    (audience IN ('all','parents') OR (
      audience = 'class' AND
      class_id IN (
        SELECT s.class_id FROM students s
        JOIN student_parents sp ON sp.student_id = s.id
        JOIN parents p ON sp.parent_id = p.id
        WHERE p.profile_id = auth.uid()
      )
    ))
  );

-- ─────────────────────────────────────────────────
-- ADMISSION INQUIRIES
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage inquiries" ON admission_inquiries FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

-- Public insert is handled by the service role in Express API

-- ─────────────────────────────────────────────────
-- GALLERY
-- ─────────────────────────────────────────────────
CREATE POLICY "Public can see public gallery" ON gallery FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins manage gallery" ON gallery FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

-- ─────────────────────────────────────────────────
-- RESULT HIGHLIGHTS
-- ─────────────────────────────────────────────────
CREATE POLICY "Public sees public highlights" ON result_highlights FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins manage highlights" ON result_highlights FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

-- ─────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────
CREATE POLICY "Admins manage all messages" ON messages FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

CREATE POLICY "Parents send and see own messages" ON messages FOR ALL TO authenticated
  USING (
    get_my_role() = 'parent' AND
    (sender_id = auth.uid() OR receiver_id = auth.uid())
  )
  WITH CHECK (get_my_role() = 'parent' AND sender_id = auth.uid());

CREATE POLICY "Teachers see announcements" ON messages FOR SELECT TO authenticated
  USING (
    get_my_role() = 'teacher' AND
    (receiver_id = auth.uid() AND type = 'announcement')
  );

-- ─────────────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────────────
CREATE POLICY "Public can read settings" ON settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON settings FOR ALL TO authenticated
  USING (get_my_role() IN ('owner','admin')) WITH CHECK (get_my_role() IN ('owner','admin'));

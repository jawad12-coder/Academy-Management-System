import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────
// TYPE DEFINITIONS (mirroring Supabase schema)
// ─────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'teacher' | 'parent' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface Student {
  id: string;
  profile_id: string | null;
  admission_no: string;
  full_name: string;
  father_name: string | null;
  guardian_phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  class_id: string | null;
  batch_id: string | null;
  status: string;
  address: string | null;
  profile_image_url: string | null;
  created_at: string;
  // Joined
  classes?: Class;
  batches?: Batch;
}

export interface Parent {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  bio: string | null;
  subjects: string[];
  photo_url: string | null;
  status: string;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  level: string | null;
  monthly_fee: number | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  class_id: string | null;
  created_at: string;
}

export interface Batch {
  id: string;
  name: string | null;
  class_id: string | null;
  timing: string | null;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string | null;
  batch_id: string | null;
  created_at: string;
  teachers?: Teacher;
  classes?: Class;
  subjects?: Subject;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string | null;
  batch_id: string | null;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  marked_by: string | null;
  remarks: string | null;
  created_at: string;
  students?: Student;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  subject_id: string | null;
  month: string;
  year: number;
  amount: number;
  paid_amount: number;
  status: 'paid' | 'unpaid' | 'partial';
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  receipt_no: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  students?: Student;
  subjects?: Subject;
}

export interface Exam {
  id: string;
  title: string;
  class_id: string | null;
  subject_id: string | null;
  total_marks: number | null;
  exam_date: string | null;
  is_published: boolean;
  created_at: string;
  classes?: Class;
  subjects?: Subject;
}

export interface Result {
  id: string;
  exam_id: string;
  student_id: string;
  obtained_marks: number | null;
  grade: string | null;
  remarks: string | null;
  entered_by: string | null;
  approved_by: string | null;
  is_published: boolean;
  created_at: string;
  exams?: Exam;
  students?: Student;
}

export interface Homework {
  id: string;
  title: string;
  description: string | null;
  class_id: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  due_date: string | null;
  attachment_url: string | null;
  is_published: boolean;
  created_at: string;
  classes?: Class;
  subjects?: Subject;
  teachers?: Teacher;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'admins' | 'teachers' | 'parents' | 'students' | 'class';
  class_id: string | null;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  classes?: Class;
}

export interface AdmissionInquiry {
  id: string;
  student_name: string;
  guardian_name: string;
  phone: string;
  desired_class: string;
  current_school: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'admitted' | 'rejected';
  notes: string | null;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  category: string;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface ResultHighlight {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  year: number | null;
  category: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  body: string;
  type: 'complaint' | 'inquiry' | 'announcement' | 'reply';
  status: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Timetable {
  id: string;
  class_id: string;
  subject_id: string | null;
  teacher_id: string | null;
  batch_id: string | null;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
  created_at: string;
  classes?: Class;
  subjects?: Subject;
  teachers?: Teacher;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relation: string | null;
  is_primary: boolean;
  created_at: string;
  students?: Student;
  parents?: Parent;
}

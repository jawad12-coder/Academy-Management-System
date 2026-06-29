#!/bin/bash
# Create components
mkdir -p artifacts/awan-academy/src/components/shared

# Shells
cat << 'INNER' > artifacts/awan-academy/src/components/shells/PublicShell.tsx
export function PublicShell({ children }: { children: React.ReactNode }) { return <>{children}</>; }
INNER
cat << 'INNER' > artifacts/awan-academy/src/components/shells/DashboardShell.tsx
export function DashboardShell({ children }: { children: React.ReactNode }) { return <>{children}</>; }
INNER

# Public Pages
for PAGE in Home About Courses Fees Results Gallery Teachers Admissions Contact Login; do
  echo "export function ${PAGE}() { return <div>${PAGE}</div>; }" > artifacts/awan-academy/src/pages/public/${PAGE}.tsx
done

# Admin Pages
for PAGE in AdminOverview AdminStudents AdminTeachers AdminParents AdminClasses AdminSubjects AdminAttendance AdminFees AdminExams AdminResults AdminHomework AdminNotices AdminInquiries AdminGallery AdminMessages AdminSettings; do
  echo "export function ${PAGE}() { return <div>${PAGE}</div>; }" > artifacts/awan-academy/src/pages/dashboard/admin/${PAGE}.tsx
done

# Teacher Pages
for PAGE in TeacherOverview TeacherAttendance TeacherHomework TeacherResults; do
  echo "export function ${PAGE}() { return <div>${PAGE}</div>; }" > artifacts/awan-academy/src/pages/dashboard/teacher/${PAGE}.tsx
done

# Parent Pages
echo "export function ParentOverview() { return <div>ParentOverview</div>; }" > artifacts/awan-academy/src/pages/dashboard/parent/ParentOverview.tsx

# Student Pages
echo "export function StudentOverview() { return <div>StudentOverview</div>; }" > artifacts/awan-academy/src/pages/dashboard/student/StudentOverview.tsx


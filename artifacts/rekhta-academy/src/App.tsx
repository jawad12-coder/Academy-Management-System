import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Shells
import { PublicShell } from '@/components/shells/PublicShell';
import { DashboardShell } from '@/components/shells/DashboardShell';

// Public Pages
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { Courses } from '@/pages/public/Courses';
import { Fees } from '@/pages/public/Fees';
import { Results } from '@/pages/public/Results';
import { Gallery } from '@/pages/public/Gallery';
import { Teachers } from '@/pages/public/Teachers';
import { Admissions } from '@/pages/public/Admissions';
import { Contact } from '@/pages/public/Contact';
import { Login } from '@/pages/public/Login';

// Dashboard Pages
import { AdminOverview } from '@/pages/dashboard/admin/AdminOverview';
import { AdminStudents } from '@/pages/dashboard/admin/AdminStudents';
import { AdminTeachers } from '@/pages/dashboard/admin/AdminTeachers';
import { AdminParents } from '@/pages/dashboard/admin/AdminParents';
import { AdminClasses } from '@/pages/dashboard/admin/AdminClasses';
import { AdminSubjects } from '@/pages/dashboard/admin/AdminSubjects';
import { AdminAttendance } from '@/pages/dashboard/admin/AdminAttendance';
import { AdminFees } from '@/pages/dashboard/admin/AdminFees';
import { AdminExams } from '@/pages/dashboard/admin/AdminExams';
import { AdminResults } from '@/pages/dashboard/admin/AdminResults';
import { AdminHomework } from '@/pages/dashboard/admin/AdminHomework';
import { AdminNotices } from '@/pages/dashboard/admin/AdminNotices';
import { AdminInquiries } from '@/pages/dashboard/admin/AdminInquiries';
import { AdminGallery } from '@/pages/dashboard/admin/AdminGallery';
import { AdminMessages } from '@/pages/dashboard/admin/AdminMessages';
import { AdminSettings } from '@/pages/dashboard/admin/AdminSettings';
import { AdminBatches } from '@/pages/dashboard/admin/AdminBatches';
import { AdminTimetable } from '@/pages/dashboard/admin/AdminTimetable';

import { TeacherOverview } from '@/pages/dashboard/teacher/TeacherOverview';
import { TeacherAttendance } from '@/pages/dashboard/teacher/TeacherAttendance';
import { TeacherHomework } from '@/pages/dashboard/teacher/TeacherHomework';
import { TeacherResults } from '@/pages/dashboard/teacher/TeacherResults';

import { ParentOverview } from '@/pages/dashboard/parent/ParentOverview';
import { ParentMessages } from '@/pages/dashboard/parent/ParentMessages';
import { StudentOverview } from '@/pages/dashboard/student/StudentOverview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    } else if (!loading && user && roles && !roles.includes(user.role)) {
      if (user.role === 'admin' || user.role === 'owner') setLocation('/dashboard/admin');
      else if (user.role === 'teacher') setLocation('/dashboard/teacher');
      else if (user.role === 'parent') setLocation('/dashboard/parent');
      else if (user.role === 'student') setLocation('/dashboard/student');
    }
  }, [user, loading, roles, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || (roles && !roles.includes(user.role))) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Dashboard Routes */}
      <Route path="/dashboard/admin/*?">
        <ProtectedRoute roles={['admin', 'owner']}>
          <DashboardShell>
            <Switch>
              <Route path="/dashboard/admin" component={AdminOverview} />
              <Route path="/dashboard/admin/students" component={AdminStudents} />
              <Route path="/dashboard/admin/teachers" component={AdminTeachers} />
              <Route path="/dashboard/admin/parents" component={AdminParents} />
              <Route path="/dashboard/admin/classes" component={AdminClasses} />
              <Route path="/dashboard/admin/subjects" component={AdminSubjects} />
              <Route path="/dashboard/admin/batches" component={AdminBatches} />
              <Route path="/dashboard/admin/timetable" component={AdminTimetable} />
              <Route path="/dashboard/admin/attendance" component={AdminAttendance} />
              <Route path="/dashboard/admin/fees" component={AdminFees} />
              <Route path="/dashboard/admin/exams" component={AdminExams} />
              <Route path="/dashboard/admin/results" component={AdminResults} />
              <Route path="/dashboard/admin/homework" component={AdminHomework} />
              <Route path="/dashboard/admin/notices" component={AdminNotices} />
              <Route path="/dashboard/admin/inquiries" component={AdminInquiries} />
              <Route path="/dashboard/admin/gallery" component={AdminGallery} />
              <Route path="/dashboard/admin/messages" component={AdminMessages} />
              <Route path="/dashboard/admin/settings" component={AdminSettings} />
              <Route component={NotFound} />
            </Switch>
          </DashboardShell>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/teacher/*?">
        <ProtectedRoute roles={['teacher']}>
          <DashboardShell>
            <Switch>
              <Route path="/dashboard/teacher" component={TeacherOverview} />
              <Route path="/dashboard/teacher/attendance" component={TeacherAttendance} />
              <Route path="/dashboard/teacher/homework" component={TeacherHomework} />
              <Route path="/dashboard/teacher/results" component={TeacherResults} />
              <Route component={NotFound} />
            </Switch>
          </DashboardShell>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/parent/*?">
        <ProtectedRoute roles={['parent']}>
          <DashboardShell>
            <Switch>
              <Route path="/dashboard/parent" component={ParentOverview} />
              <Route path="/dashboard/parent/messages" component={ParentMessages} />
              <Route component={NotFound} />
            </Switch>
          </DashboardShell>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/student/*?">
        <ProtectedRoute roles={['student']}>
          <DashboardShell>
            <Switch>
              <Route path="/dashboard/student" component={StudentOverview} />
              <Route component={NotFound} />
            </Switch>
          </DashboardShell>
        </ProtectedRoute>
      </Route>

      {/* Public Routes */}
      <Route path="*">
        <PublicShell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/courses" component={Courses} />
            <Route path="/fees" component={Fees} />
            <Route path="/results" component={Results} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/teachers" component={Teachers} />
            <Route path="/admissions" component={Admissions} />
            <Route path="/contact" component={Contact} />
            <Route path="/login" component={Login} />
            <Route component={NotFound} />
          </Switch>
        </PublicShell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

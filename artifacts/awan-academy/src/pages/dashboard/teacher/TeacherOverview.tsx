import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function TeacherOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome, {user?.full_name}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">4</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Lectures</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Results</CardTitle>
            <Award className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">1</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">Schedule will appear here once timetable is set.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No new announcements.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

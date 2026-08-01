import { useGetDashboardOverview, useGetDashboardAttendanceSummary, useGetDashboardFeeSummary } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, UserCheck, BookOpen, CreditCard, Banknote, ClipboardList, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminOverview() {
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverview();
  const { data: attSummary, isLoading: attLoading } = useGetDashboardAttendanceSummary();
  const { data: feeSummary, isLoading: feeLoading } = useGetDashboardFeeSummary();

  const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Students", value: overview?.totalStudents, icon: Users, color: "text-blue-500", loading: overviewLoading },
          { title: "Total Teachers", value: overview?.totalTeachers, icon: GraduationCap, color: "text-emerald-500", loading: overviewLoading },
          { title: "Total Parents", value: overview?.totalParents, icon: UserCheck, color: "text-purple-500", loading: overviewLoading },
          { title: "Active Classes", value: overview?.totalClasses, icon: BookOpen, color: "text-orange-500", loading: overviewLoading },
          { title: "Pending Fees", value: `PKR ${overview?.pendingFees || 0}`, icon: CreditCard, color: "text-red-500", loading: overviewLoading },
          { title: "Collected This Month", value: `PKR ${overview?.paidFeesThisMonth || 0}`, icon: Banknote, color: "text-green-500", loading: overviewLoading },
          { title: "New Inquiries", value: overview?.newInquiries, icon: ClipboardList, color: "text-yellow-500", loading: overviewLoading },
          { title: "Today's Attendance", value: `${overview?.todayAttendance || 0}%`, icon: CalendarCheck, color: "text-indigo-500", loading: overviewLoading },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Fee Collection Area Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Fee Collection (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {feeLoading ? (
              <Skeleton className="h-full w-full" />
            ) : feeSummary?.monthly && feeSummary.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feeSummary.monthly}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs${val}`} />
                  <Tooltip formatter={(value) => `PKR ${value}`} />
                  <Area type="monotone" dataKey="collected" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No fee data available</div>
            )}
          </CardContent>
        </Card>

        {/* Students by Class Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Students by Class</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {overviewLoading ? (
              <Skeleton className="h-full w-full" />
            ) : overview?.studentsByClass && overview.studentsByClass.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.studentsByClass}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="className"
                  >
                    {overview.studentsByClass.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No class data available</div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Bar Chart */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Attendance Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {attLoading ? (
              <Skeleton className="h-full w-full" />
            ) : attSummary?.daily && attSummary.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attSummary.daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="present" stackId="a" fill="hsl(var(--primary))" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" name="Absent" />
                  <Bar dataKey="late" stackId="a" fill="hsl(var(--accent))" name="Late" />
                  <Bar dataKey="leave" stackId="a" fill="hsl(var(--muted-foreground))" name="Leave" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No attendance data available</div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
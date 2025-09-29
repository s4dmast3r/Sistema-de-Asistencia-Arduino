// Dashboard statistics overview
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";
import { type User, type Attendance } from "@/lib/api";
import { format, startOfDay, isToday } from "date-fns";

interface StatsOverviewProps {
  users: User[];
  presentUsers: (User & { last_in: string })[];
  attendance: Attendance[];
  isLoading: boolean;
  className?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  users,
  presentUsers,
  attendance,
  isLoading,
  className,
}) => {
  // Calculate today's stats
  const todayAttendance = attendance.filter(record => 
    isToday(new Date(record.ts))
  );
  
  const uniqueUsersToday = new Set(
    todayAttendance.map(record => record.user_id)
  ).size;

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      description: "Registered employees",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Present Now",
      value: presentUsers.length,
      description: "Currently checked in",
      icon: UserCheck,
      color: "text-success",
    },
    {
      title: "Today's Activity",
      value: todayAttendance.length,
      description: "Check-ins/outs today",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Active Today",
      value: uniqueUsersToday,
      description: "Users who checked in",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
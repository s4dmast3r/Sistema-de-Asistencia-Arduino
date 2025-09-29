// Attendance records table with filtering
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { type Attendance } from "@/lib/api";
import { format, parseISO } from "date-fns";

interface AttendanceTableProps {
  attendance: Attendance[];
  isLoading: boolean;
  className?: string;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendance,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>Recent attendance activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendance Records
          <span className="text-sm font-normal text-muted-foreground">
            ({attendance.length} records)
          </span>
        </CardTitle>
        <CardDescription>Recent attendance activity</CardDescription>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No attendance records</h3>
            <p className="text-muted-foreground">
              No attendance records found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => {
                  const timestamp = parseISO(record.ts);
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell>
                        <StatusBadge 
                          variant={record.direction === 'IN' ? 'in' : 'out'}
                        >
                          {record.direction}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.user?.name || 'Unknown User'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(timestamp, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(timestamp, 'HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
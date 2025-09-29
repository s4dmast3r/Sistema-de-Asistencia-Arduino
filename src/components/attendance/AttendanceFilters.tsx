// Filter controls for attendance records
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Calendar, Clock, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { type AttendanceFilters } from "@/lib/api";

interface AttendanceFiltersComponentProps {
  onFiltersChange: (filters: AttendanceFilters) => void;
  className?: string;
}

export const AttendanceFiltersCard: React.FC<AttendanceFiltersComponentProps> = ({
  onFiltersChange,
  className,
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  const handleApplyFilters = () => {
    onFiltersChange({
      date: date || undefined,
      from: fromTime || undefined,
      to: toTime || undefined,
    });
  };

  const handleReset = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setDate(today);
    setFromTime('');
    setToTime('');
    onFiltersChange({ date: today });
  };

  // Apply today's filter by default
  useEffect(() => {
    onFiltersChange({ date });
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from-time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              From Time
            </Label>
            <Input
              id="from-time"
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to-time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              To Time
            </Label>
            <Input
              id="to-time"
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleApplyFilters}
            className="flex-1"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
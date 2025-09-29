// Global attendance data provider with React Query
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';
import { getAttendance, getPresentUsers, getUsers, type Attendance, type User, type AttendanceFilters } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCardStream, type AttendanceEvent, type UnknownEvent, type IgnoredEvent } from '@/hooks/useCardStream';

interface AttendanceContextType {
  // Data
  attendance: Attendance[];
  presentUsers: (User & { last_in: string })[];
  users: User[];
  
  // Loading states
  isLoadingAttendance: boolean;
  isLoadingPresent: boolean;
  isLoadingUsers: boolean;
  
  // Real-time connection
  isConnected: boolean;
  lastEvent: string | null;
  
  // Methods
  refetchAttendance: () => void;
  refetchPresent: () => void;
  refetchUsers: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

interface AttendanceProviderProps {
  children: React.ReactNode;
  filters?: AttendanceFilters;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children, filters = {} }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const attendanceQuery = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => getAttendance(filters),
    refetchOnWindowFocus: false,
  });

  const presentQuery = useQuery({
    queryKey: ['present'],
    queryFn: getPresentUsers,
    refetchInterval: 30000, // Refresh every 30s
    refetchOnWindowFocus: false,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
  });

  // Real-time events
  const { isConnected, lastEvent } = useCardStream({
    onAttendance: (event: AttendanceEvent) => {
      // Show success toast
      toast({
        title: `${event.user.name} - ${event.direction}`,
        description: `Registered at ${new Date(event.ts).toLocaleTimeString()}`,
        className: event.direction === 'IN' 
          ? "border-success bg-success-light" 
          : "border-error bg-error-light",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['present'] });
    },
    
    onUnknown: (event: UnknownEvent) => {
      toast({
        title: "Unknown RFID Card",
        description: `UID: ${event.uid} - Click to register this user`,
        className: "border-warning bg-warning-light",
      });
    },
    
    onIgnored: (event: IgnoredEvent) => {
      const reasonText = event.reason === 'cooldown' 
        ? `Please wait ${event.secondsLeft || 3}s between check-ins`
        : 'Multiple rapid reads detected';
        
      toast({
        title: "Read Ignored",
        description: reasonText,
        variant: "destructive",
      });
    },
    
    onError: (error: string) => {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const value: AttendanceContextType = {
    // Data
    attendance: attendanceQuery.data || [],
    presentUsers: presentQuery.data || [],
    users: usersQuery.data || [],
    
    // Loading states
    isLoadingAttendance: attendanceQuery.isLoading,
    isLoadingPresent: presentQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,
    
    // Real-time connection
    isConnected,
    lastEvent,
    
    // Methods
    refetchAttendance: attendanceQuery.refetch,
    refetchPresent: presentQuery.refetch,
    refetchUsers: usersQuery.refetch,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
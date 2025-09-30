// src/components/attendance/AttendanceProvider.tsx
// Global attendance data provider with React Query
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { getAttendance, getPresentUsers, getUsers, type Attendance, type User, type AttendanceFilters } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCardStream, type AttendanceEvent, type UnknownEvent, type IgnoredEvent } from '@/hooks/useCardStream';

interface AttendanceContextType {
  // Data
  attendance: Attendance[]; // ya filtrada/ordenada
  presentUsers: (User & { last_in?: string | null })[];
  users: User[];
  
  // Loading states
  isLoadingAttendance: boolean;
  isLoadingPresent: boolean;
  isLoadingUsers: boolean;
  
  // Real-time connection
  isConnected: boolean;
  lastEvent: string | null;
  
  // Methods
  refetchAttendance: (filters?: AttendanceFilters) => void;
  refetchPresent: () => void;
  refetchUsers: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

interface AttendanceProviderProps {
  children: React.ReactNode;
  filters?: AttendanceFilters; // filtros iniciales opcionales
}

/* ========= helpers de filtrado local ========= */
function parseDateInput(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;

  // MM/DD/YYYY
  let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = parseInt(m[1], 10);
    const dd = parseInt(m[2], 10);
    const yy = parseInt(m[3], 10);
    return { y: yy, m: mm, d: dd };
  }
  // YYYY-MM-DD
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const yy = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const dd = parseInt(m[3], 10);
    return { y: yy, m: mm, d: dd };
  }
  return null;
}

// ✅ Arreglo TS1016: s permite undefined y fallback tiene valor por defecto
function parseTimeInput(
  s: string | undefined,
  fallback: { h: number; mi: number; se: number } = { h: 0, mi: 0, se: 0 }
) {
  if (!s) return fallback;
  const t = s.trim();
  if (!t) return fallback;
  // h:mm[:ss] [AM|PM]
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return fallback;
  let h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  const se = m[3] ? parseInt(m[3], 10) : 0;
  const ap = m[4]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { h, mi, se };
}

/** Devuelve un array nuevo filtrado (si hay filtros) y SIEMPRE ordenado por ts desc */
function applyLocalFilterAndSort(rows: Attendance[], filters?: AttendanceFilters): Attendance[] {
  const base = Array.isArray(rows) ? rows : [];
  const sortedDesc = (arr: Attendance[]) =>
    [...arr].sort((a, b) => {
      const ta = a?.ts ? new Date(a.ts).getTime() : 0;
      const tb = b?.ts ? new Date(b.ts).getTime() : 0;
      return tb - ta;
    });

  if (!filters || (!filters.date && !filters.from && !filters.to)) {
    return sortedDesc(base);
  }

  // Rango local (fecha obligatoria para filtrar por tiempo)
  const d = parseDateInput(filters.date || '');
  if (!d) {
    return sortedDesc(base); // si date no es válido, no filtramos
  }

  const from = parseTimeInput(filters.from, { h: 0, mi: 0, se: 0 });
  const to   = parseTimeInput(filters.to,   { h: 23, mi: 59, se: 59 });

  // Fechas en zona local
  const start = new Date(d.y, d.m - 1, d.d, from.h, from.mi, from.se, 0).getTime();
  const end   = new Date(d.y, d.m - 1, d.d, to.h,   to.mi,   to.se,   999).getTime();

  const filtered = base.filter(r => {
    const t = r?.ts ? new Date(r.ts).getTime() : NaN;
    return Number.isFinite(t) && t >= start && t <= end;
  });

  return sortedDesc(filtered);
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children, filters: initialFilters = {} }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // === estado interno de filtros (no cambiamos la clave de la query) ===
  const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);

  // Traemos SIEMPRE el feed base (sin filtros) para no romper el alta en tiempo real
  const attendanceQuery = useQuery({
    queryKey: ['attendance'],          // clave estable
    queryFn: () => getAttendance({}),  // sin filtros: backend devuelve los últimos N
    refetchOnWindowFocus: false,
  });

  const presentQuery = useQuery({
    queryKey: ['present'],
    queryFn: getPresentUsers,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
  });

  // Aplica filtros localmente y ordena SIEMPRE por hora desc
  const attendanceFiltered = useMemo(
    () => applyLocalFilterAndSort(attendanceQuery.data || [], filters),
    [attendanceQuery.data, filters]
  );

  // Real-time events: toasts + refrescar feed base
  const { isConnected, lastEvent } = useCardStream({
    onAttendance: (event: AttendanceEvent) => {
      toast({
        title: `${event.user.name} - ${event.direction}`,
        description: `Registered at ${new Date(event.ts).toLocaleTimeString()}`,
        className: event.direction === 'IN'
          ? "border-success bg-success-light"
          : "border-error bg-error-light",
      });
      // Re-fetch feed base; el filtrado se reaplica en memoria automáticamente
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

  // refetch que puede actualizar filtros (sin romper el feed base)
  const refetchAttendance = (next?: AttendanceFilters) => {
    if (next) {
      setFilters(next);             // aplicar filtros (filtrado local)
      // opcional: refrescar feed en background
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } else {
      attendanceQuery.refetch();    // re-fetch manteniendo filtros actuales
    }
  };

  const value: AttendanceContextType = {
    // Data (ya filtrada y ordenada)
    attendance: attendanceFiltered,
    presentUsers: (presentQuery.data as any) || [],
    users: usersQuery.data || [],

    // Loading states
    isLoadingAttendance: attendanceQuery.isLoading,
    isLoadingPresent: presentQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,

    // Real-time connection
    isConnected,
    lastEvent,

    // Methods
    refetchAttendance,
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

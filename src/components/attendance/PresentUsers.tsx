// src/components/attendance/PresentUsers.tsx
// Display currently present users (robusto contra datos faltantes)

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Users } from "lucide-react";
import { type User } from "@/lib/api";
import { format, parseISO, isValid } from "date-fns";
import React from "react";

type PresentUser = User & {
  // last_in puede no venir del backend; lo tratamos como opcional
  last_in?: string | null;
};

interface PresentUsersProps {
  presentUsers?: PresentUser[]; // puede venir undefined
  isLoading?: boolean;          // lo hacemos opcional por robustez
  className?: string;
}

/** parsea ISO solo si es string válido; si no, retorna null */
function safeParseISO(s: unknown): Date | null {
  if (typeof s !== "string" || !s.trim()) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

/** formatea HH:mm o devuelve "—" si no hay fecha válida */
function formatLastIn(iso?: string | null): string {
  const d = safeParseISO(iso ?? null);
  return d ? format(d, "HH:mm") : "—";
}

/** iniciales seguras aunque name sea vacío/undefined */
function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  const letters = parts.map(p => (p[0] ?? "")).join("").toUpperCase();
  return letters.slice(0, 2) || "??";
}

export const PresentUsers: React.FC<PresentUsersProps> = ({
  presentUsers = [],
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Present Now
          </CardTitle>
          <CardDescription>Currently checked in employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // aseguramos que sea array
  const list: PresentUser[] = Array.isArray(presentUsers) ? presentUsers : [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Present Now
          <StatusBadge variant="present" size="sm">
            {list.length}
          </StatusBadge>
        </CardTitle>
        <CardDescription>Currently checked in employees</CardDescription>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h4 className="text-sm font-medium">No one present</h4>
            <p className="text-xs text-muted-foreground">
              All employees are currently checked out
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((user, idx) => {
              const initials = getInitials(user?.name);
              const timeText = formatLastIn(user?.last_in);

              return (
                <div key={user?.id ?? `${user?.card_uid ?? "u"}-${idx}`} className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.name ?? "Usuario"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      In since {timeText}
                    </p>
                  </div>
                  <StatusBadge variant="in" size="sm">
                    IN
                  </StatusBadge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

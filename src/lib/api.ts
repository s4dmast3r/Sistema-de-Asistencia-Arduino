// src/lib/api.ts
// API layer for RFID Attendance System

// Detecta base automáticamente o usa VITE_API_BASE si existe.
// Mantiene compatibilidad con tu backend en :3000.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/$/, "") ||
  (window.location.origin.includes("localhost:8080") ? "http://localhost:3000" : "");

const API_BASE_URL = `${API_BASE}/api`;

export interface User {
  id: number;
  name: string;
  card_uid: string;
  active: number;
}

export interface Attendance {
  id: number;
  user_id: number;
  // ⬇️ Aseguramos que venga el nombre dentro de `user` para que la UI no muestre "Unknown User"
  user?: User;
  direction: "IN" | "OUT";
  // ⬇️ Guardamos el timestamp ya normalizado a ISO (para parsearlo bien en el front)
  ts: string;
}

export interface AttendanceFilters {
  date?: string;
  from?: string;
  to?: string;
}

export interface CreateUserRequest {
  name: string;
  card_uid: string;
}

// --- helpers internos ---
function normalizeTs(ts?: string | null): string {
  // Convierte "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SSZ" (ISO UTC)
  // Si ya viene con 'T', lo deja igual.
  if (!ts) return "";
  const t = ts.trim();
  if (!t) return "";
  if (t.includes("T")) return t; // ya es ISO
  return `${t.replace(" ", "T")}Z`;
}

// Health check
export const checkHealth = async (): Promise<{ ok: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Backend not available");
  return response.json();
};

// Users API
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      // Por si te llega en minúsculas/espaciado: normaliza UID a MAYÚSCULAS sin espacios
      card_uid: String(data.card_uid || "").toUpperCase().replace(/\s+/g, ""),
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create user" }));
    throw new Error(error.error || "Failed to create user");
  }
  return response.json();
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const payload: Partial<User> = { ...data };
  if (payload.card_uid) {
    payload.card_uid = String(payload.card_uid).toUpperCase().replace(/\s+/g, "");
  }
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete user");
};

// Attendance API
export const getAttendance = async (filters: AttendanceFilters = {}): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (filters.date) params.append("date", filters.date);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  const response = await fetch(`${API_BASE_URL}/attendance?${params}`);
  if (!response.ok) throw new Error("Failed to fetch attendance");

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  // ⬇️ Mapear para:
  // 1) Normalizar ts a ISO (evita horas "raras")
  // 2) Construir `user` con name para que la UI no muestre "Unknown User"
  return data.map((r: any) => {
    const tsISO = normalizeTs(r.ts);
    const user: User = {
      id: r.user_id,
      name: r.name,                // <-- viene del JOIN del backend
      card_uid: r.card_uid,
      active: 1,                   // backend no lo envía en /attendance; default inofensivo
    };
    const rec: Attendance = {
      id: r.id,
      user_id: r.user_id,
      user,                        // <-- ahora attendance.user?.name existe
      direction: r.direction,
      ts: tsISO || r.ts || "",     // usa ISO si pudimos normalizar
    };
    return rec;
  });
};

// Present users (ajusta tipo: last_in puede no venir)
export const getPresentUsers = async (): Promise<(User & { last_in?: string | null })[]> => {
  const response = await fetch(`${API_BASE_URL}/present`);
  if (!response.ok) throw new Error("Failed to fetch present users");
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((u: any) => ({
    id: u.id,
    name: u.name,
    card_uid: u.card_uid,
    active: u.active ?? 1,
    last_in: u.last_in ?? null, // por si en el futuro agregas este campo
  }));
};

// SSE Event Stream URL
export const SSE_URL = `${API_BASE_URL}/stream`;

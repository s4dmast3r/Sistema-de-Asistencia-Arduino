// src/hooks/useSSE.ts
import { useEffect, useRef } from "react";

type AttendancePayload = {
  uid: string;
  user?: { id: number; name: string };
  direction?: "IN" | "OUT";
  ts?: string;
};

type UnknownPayload = { uid: string; ts?: string };

type UseSSEOptions = {
  url?: string; // por defecto /api/stream
  onAttendance?: (p: AttendancePayload) => void;
  onUnknown?: (p: UnknownPayload) => void;
  onPing?: (data: any) => void;
  onError?: (err: any) => void;
  // si usas toasts, pasa una función para mostrarlos
  toast?: (opts: { id?: string; title: string; description?: string; variant?: "default" | "success" | "destructive" }) => void;
};

function safeJSON<T = any>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function useSSE({
  url = "/api/stream",
  onAttendance,
  onUnknown,
  onPing,
  onError,
  toast,
}: UseSSEOptions) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  useEffect(() => {
    let closed = false;

    const connect = () => {
      // evita múltiples conexiones
      if (esRef.current) {
        try { esRef.current.close(); } catch {}
        esRef.current = null;
      }

      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.addEventListener("attendance", (evt) => {
        const data = safeJSON<AttendancePayload>((evt as MessageEvent).data);
        if (!data || !data.uid) {
          console.warn("[SSE] attendance mal formado:", evt);
          return;
        }
        // defensivo: evita crashear si viene algo raro
        const name = data.user?.name ?? "Usuario";
        const dir = data.direction ?? "IN";
        onAttendance?.(data);
        // Toast con id único para no deduplicar
        toast?.({
          id: `att-${data.uid}-${dir}-${Date.now()}`,
          title: `${name} → ${dir}`,
          variant: "success",
          description: data.ts ?? new Date().toLocaleString(),
        });
      });

      es.addEventListener("unknown", (evt) => {
        const data = safeJSON<UnknownPayload>((evt as MessageEvent).data);
        if (!data || !data.uid) {
          console.warn("[SSE] unknown mal formado:", evt);
          return;
        }
        onUnknown?.(data);
        // id único: cada lectura muestra notificación aunque la UID se repita
        toast?.({
          id: `unk-${data.uid}-${Date.now()}`,
          title: `UID desconocida`,
          variant: "destructive",
          description: data.uid,
        });
      });

      es.addEventListener("ping", (evt) => {
        const data = safeJSON((evt as MessageEvent).data);
        onPing?.(data);
      });

      es.onerror = (err) => {
        console.error("[SSE] error", err);
        onError?.(err);
        try { es.close(); } catch {}
        esRef.current = null;
        // reconecta en 1500ms
        if (!closed && reconnectTimer.current == null) {
          reconnectTimer.current = window.setTimeout(() => {
            reconnectTimer.current = null;
            connect();
          }, 1500);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer.current != null) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (esRef.current) {
        try { esRef.current.close(); } catch {}
        esRef.current = null;
      }
    };
  }, [url, onAttendance, onUnknown, onPing, onError, toast]);
}

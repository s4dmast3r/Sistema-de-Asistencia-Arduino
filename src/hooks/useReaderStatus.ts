// src/hooks/useReaderStatus.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type SerialStatus = { path: string | null; isOpen: boolean };

function apiBase(): string {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  if (window.location.origin.includes("localhost:8080")) return "http://localhost:3000";
  return ""; // relativo si tienes proxy /api
}

export function useReaderStatus() {
  const base = apiBase();

  // Histeresis (sin cambiar tus valores)
  const REQ_SUCC_FOR_CONNECTED = 2;
  const REQ_FAIL_FOR_DISCONNECTED = 3;

  // Intervalo de sondeo (ms)
  const REFRESH_MS = 7000;

  // Contadores y última conexión
  const succRef = useRef(0);
  const failRef = useRef(0);
  const lastConnectedRef = useRef<Date | null>(null);

  // Tick para forzar re-render cuando cambian las refs
  const [tick, setTick] = useState(0);

  const query = useQuery<SerialStatus>({
    queryKey: ["serial-status"],
    queryFn: async () => {
      const res = await fetch(`${base}/api/serial/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as SerialStatus;
    },
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    staleTime: Math.max(0, REFRESH_MS - 1000),
    gcTime: 5 * 60 * 1000,
  });

  // Actualiza contadores (histeresis) y fuerza re-render
  useEffect(() => {
    let changed = false;

    if (query.isSuccess && query.data) {
      if (query.data.isOpen) {
        succRef.current += 1;
        failRef.current = 0;
        lastConnectedRef.current = new Date();
        changed = true;
      } else {
        failRef.current += 1;
        succRef.current = 0;
        changed = true;
      }
    } else if (query.isError) {
      failRef.current += 1;
      succRef.current = 0;
      changed = true;
    }

    if (changed) setTick((n) => n + 1);
  }, [query.isSuccess, query.isError, query.data]);

  // Estado estable (depende de tick para recalcular)
  const status = useMemo<"connected" | "connecting" | "disconnected">(() => {
    if (!query.isFetched) return "connecting";
    if (succRef.current >= REQ_SUCC_FOR_CONNECTED) return "connected";
    if (failRef.current >= REQ_FAIL_FOR_DISCONNECTED) return "disconnected";
    return "connecting";
  }, [query.isFetched, tick]);

  // Forzar un refetch manual (sin cambiar tu API)
  const reconnect = () => {
    succRef.current = 0;
    query.refetch();
  };

  return {
    status,                               // 'connected' | 'connecting' | 'disconnected'
    isOpen: status === "connected",
    path: query.data?.path ?? null,
    lastConnected: lastConnectedRef.current,
    loading: query.isLoading,
    error: query.isError ? (query.error as any)?.message ?? "error" : null,
    reconnect,
  };
}

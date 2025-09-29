// src/components/dashboard/ConnectionStatus.tsx
// Real-time connection status indicator (histeresis + estado real del puerto)

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { WifiOff, Radio, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Hook que consulta /api/serial/status (no afecta el resto)
import { useReaderStatus } from "@/hooks/useReaderStatus";

interface ConnectionStatusProps {
  /** Señal que llega del padre (p. ej., SSE). No la quitamos. */
  isConnected: boolean;
  lastEvent: string | null;
  onReconnect?: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  lastEvent,
  onReconnect,
  className,
}) => {
  // Estado real del puerto serie
  const { isOpen, lastConnected, reconnect: reconnectReader } = useReaderStatus();

  // Combina señales: si cualquiera dice conectado → conectado
  const rawConnected = Boolean(isOpen || isConnected);

  // Histeresis (anti-titileo)
  const CONNECT_OK_DELAY = 500;   // ms para subir a "Connected"
  const DISCONNECT_DELAY = 2500;  // ms para bajar a "Disconnected"

  const [stableConnected, setStableConnected] = useState<boolean>(rawConnected);
  const upTimerRef = useRef<number | null>(null);
  const downTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clear = (ref: React.MutableRefObject<number | null>) => {
      if (ref.current != null) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    };

    if (rawConnected) {
      // Señal de conexión: confirma rápido
      clear(downTimerRef);
      if (!stableConnected) {
        clear(upTimerRef);
        upTimerRef.current = window.setTimeout(() => {
          setStableConnected(true);
          upTimerRef.current = null;
        }, CONNECT_OK_DELAY) as unknown as number;
      }
    } else {
      // Señal de desconexión: espera a que persista
      clear(upTimerRef);
      if (stableConnected) {
        clear(downTimerRef);
        downTimerRef.current = window.setTimeout(() => {
          setStableConnected(false);
          downTimerRef.current = null;
        }, DISCONNECT_DELAY) as unknown as number;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawConnected, stableConnected]);

  useEffect(() => {
    return () => {
      if (upTimerRef.current != null) window.clearTimeout(upTimerRef.current);
      if (downTimerRef.current != null) window.clearTimeout(downTimerRef.current);
    };
  }, []);

  const connected = stableConnected;
  const lastLabel = lastEvent ?? (lastConnected ? lastConnected.toLocaleString() : null);

  return (
    <Card
      className={cn(
        "transition-colors",
        className,
        connected ? "border-success bg-success-light/50" : "border-error bg-error-light/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-full transition-colors",
                connected ? "bg-success text-success-foreground" : "bg-error text-error-foreground"
              )}
            >
              {connected ? <Radio className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">RFID Reader</span>
                <StatusBadge variant={connected ? "in" : "out"} size="sm">
                  {connected ? "Connected" : "Disconnected"}
                </StatusBadge>
              </div>
              {lastLabel && (
                <span className="text-xs text-muted-foreground">Last: {lastLabel}</span>
              )}
            </div>
          </div>

          {!connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => (onReconnect ? onReconnect() : reconnectReader())}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reconnect
            </Button>
          )}

          {connected && <div className="w-2 h-2 rounded-full bg-success animate-pulse" />}
        </div>
      </CardContent>
    </Card>
  );
};

// Export default por si en algún lugar lo importas sin llaves
export default ConnectionStatus;

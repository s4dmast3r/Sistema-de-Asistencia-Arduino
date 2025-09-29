// src/components/attendance/ReaderStatusCard.tsx
import { useReaderStatus } from "@/hooks/useReaderStatus";

import { cn } from "@/lib/utils"; // si no tienes util cn, puedes quitarlo y usar clases a mano
import { Button } from "@/components/ui/button";
import { RefreshCcw, Rss } from "lucide-react";
import React from "react";

export const ReaderStatusCard: React.FC<{ className?: string }> = ({ className }) => {
  const { status, isOpen, path, lastConnected, reconnect, loading, error } = useReaderStatus();

  const badgeText =
    status === "connected" ? "Connected" :
    status === "connecting" ? "Connecting…" : "Disconnected";

  const dotClass =
    status === "connected" ? "bg-green-500" :
    status === "connecting" ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className={cn("border rounded-lg p-3 flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white",
                           isOpen ? "bg-red-600" : "bg-gray-400")}>
          <Rss className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            RFID Reader
            <span className={cn("px-2 py-0.5 rounded-full text-xs border",
              status === "connected" ? "border-green-500 text-green-700" :
              status === "connecting" ? "border-yellow-500 text-yellow-700" :
              "border-red-500 text-red-700"
            )}>
              {badgeText}
            </span>
            <span className={cn("inline-block h-2 w-2 rounded-full", dotClass)} />
          </div>
          <div className="text-xs text-muted-foreground">
            Last Connected: {lastConnected ? lastConnected.toLocaleString() : "—"}
            {path ? ` · Port: ${path}` : ""}
            {error ? ` · ${String(error)}` : ""}
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={reconnect} disabled={loading}>
        <RefreshCcw className="h-4 w-4 mr-2" />
        Reconnect
      </Button>
    </div>
  );
};

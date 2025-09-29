// Real-time connection status indicator
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Radio, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
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
  return (
    <Card className={cn("transition-colors", className, {
      "border-success bg-success-light/50": isConnected,
      "border-error bg-error-light/50": !isConnected,
    })}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-full transition-colors",
              isConnected ? "bg-success text-success-foreground" : "bg-error text-error-foreground"
            )}>
              {isConnected ? (
                <Radio className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">RFID Reader</span>
                <StatusBadge 
                  variant={isConnected ? 'in' : 'out'}
                  size="sm"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </StatusBadge>
              </div>
              {lastEvent && (
                <span className="text-xs text-muted-foreground">
                  Last: {lastEvent}
                </span>
              )}
            </div>
          </div>
          
          {!isConnected && onReconnect && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReconnect}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reconnect
            </Button>
          )}
          
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
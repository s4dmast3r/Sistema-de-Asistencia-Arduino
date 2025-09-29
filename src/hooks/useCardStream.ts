// Real-time RFID card events via Server-Sent Events
import { useEffect, useRef, useState } from 'react';
import { SSE_URL } from '@/lib/api';

export interface AttendanceEvent {
  uid: string;
  user: {
    id: number;
    name: string;
  };
  direction: 'IN' | 'OUT';
  ts: string;
}

export interface UnknownEvent {
  uid: string;
  ts: string;
}

export interface IgnoredEvent {
  uid: string;
  reason: 'burst' | 'cooldown';
  secondsLeft?: number;
  user?: {
    id: number;
    name: string;
  };
  ts: string;
}

export interface CardStreamEvents {
  onAttendance?: (event: AttendanceEvent) => void;
  onUnknown?: (event: UnknownEvent) => void;
  onIgnored?: (event: IgnoredEvent) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useCardStream = (events: CardStreamEvents) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      try {
        // Connect directly to backend in development (avoid Vite proxy for SSE)
        const eventSource = new EventSource(SSE_URL);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setLastEvent('Connected');
          events.onConnect?.();
        };

        eventSource.onerror = (error) => {
          setIsConnected(false);
          console.error('SSE Error:', error);
          events.onError?.('Connection lost');
          events.onDisconnect?.();
          
          // Auto-reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        // Handle attendance events (successful RFID reads)
        eventSource.addEventListener('attendance', (event) => {
          try {
            const data = JSON.parse(event.data) as AttendanceEvent;
            setLastEvent(`${data.user.name} - ${data.direction}`);
            events.onAttendance?.(data);
          } catch (err) {
            console.error('Failed to parse attendance event:', err);
          }
        });

        // Handle unknown UID events
        eventSource.addEventListener('unknown', (event) => {
          try {
            const data = JSON.parse(event.data) as UnknownEvent;
            setLastEvent(`Unknown UID: ${data.uid}`);
            events.onUnknown?.(data);
          } catch (err) {
            console.error('Failed to parse unknown event:', err);
          }
        });

        // Handle ignored events (cooldown/burst protection)
        eventSource.addEventListener('ignored', (event) => {
          try {
            const data = JSON.parse(event.data) as IgnoredEvent;
            setLastEvent(`Ignored: ${data.reason}`);
            events.onIgnored?.(data);
          } catch (err) {
            console.error('Failed to parse ignored event:', err);
          }
        });

        // Handle ping events (keep-alive)
        eventSource.addEventListener('ping', () => {
          setLastEvent('Connected');
        });

      } catch (err) {
        console.error('Failed to connect to SSE:', err);
        events.onError?.('Failed to connect');
        
        // Retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsConnected(false);
    };
  }, [events]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsConnected(false);
  };

  const reconnect = () => {
    disconnect();
    // Re-trigger the useEffect
    window.location.reload();
  };

  return {
    isConnected,
    lastEvent,
    disconnect,
    reconnect,
  };
};

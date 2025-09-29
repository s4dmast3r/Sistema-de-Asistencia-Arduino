// src/App.tsx
import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";             // shadcn/ui Toast (opcional si lo usas en otras partes)
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // contenedor de sonner
import { toast } from "sonner";                                   // función para disparar toasts
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 🔌 Hook de SSE robusto (asegúrate de tener src/hooks/useSSE.ts)
import { useSSE } from "@/hooks/useSSE";

/* --------------------------- Error Boundary simple --------------------------- */
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; err: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, err };
  }
  componentDidCatch(error: any, info: any) {
    console.error("[AppErrorBoundary] ", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Se produjo un error en la interfaz.</h2>
          <p>Abre la consola (F12) para ver detalles.</p>
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* --------------------------- Config helpers --------------------------- */
// Si defines VITE_API_BASE, la usamos. Si no, y estás en :8080, apuntamos por defecto al backend :3000.
// Si ya usas proxy en Vite, simplemente deja VITE_API_BASE vacío y se usará "/api/stream".
function joinUrl(base: string | undefined, path: string) {
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  // Detecta base del API:
  const apiBase =
    (import.meta as any).env?.VITE_API_BASE ||
    (window.location.origin.includes("localhost:8080") ? "http://localhost:3000" : "");

  // URL final del SSE:
  const streamUrl = joinUrl(apiBase, "/api/stream");

  // Conexión SSE (toasts en cada evento)
  useSSE({
    url: streamUrl,
    toast: ({ id, title, description, variant }) => {
      // Usamos sonner para notificaciones:
      if (variant === "destructive") {
        toast.error(title, { id, description });
      } else if (variant === "success") {
        toast.success(title, { id, description });
      } else {
        toast(title, { id, description });
      }
    },
    // Opcionalmente podrías actualizar algún estado global aquí:
    onAttendance: (p) => {
      // console.log("[SSE] attendance", p);
    },
    onUnknown: (p) => {
      // console.log("[SSE] unknown", p);
    },
    onError: (e) => {
      console.error("[SSE] error:", e);
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Contenedores de toasts */}
        <Toaster />
        <SonnerToaster richColors position="top-right" />

        <AppErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

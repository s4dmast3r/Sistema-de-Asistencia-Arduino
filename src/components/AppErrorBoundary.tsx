// src/components/AppErrorBoundary.tsx
import React from "react";

type Props = { children: React.ReactNode };

export class AppErrorBoundary extends React.Component<Props, { hasError: boolean; err: any }> {
  constructor(props: Props) {
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

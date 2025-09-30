// Normaliza el timestamp del backend ("YYYY-MM-DD HH:MM:SS") a Date local.
// Si ya viene con 'T' o 'Z', igual funciona.
export function parseBackendTs(ts?: string | null): Date | null {
  if (!ts) return null;
  const trimmed = ts.trim();
  if (!trimmed) return null;

  // Si ya es ISO (tiene 'T'), usa el constructor de Date directo
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Caso típico SQLite: "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SSZ" (UTC) → Date (se mostrará en hora local)
  const iso = `${trimmed.replace(" ", "T")}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

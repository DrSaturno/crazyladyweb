import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export function AdminPage({ title, eyebrow, description, action, children }: { title: string; eyebrow: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><p className="eyebrow">{eyebrow}</p><h1 className="display-title mt-1 text-3xl sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm text-cls-ink/92">{description}</p></div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </div>
  );
}

export function StatCard({ label, value, detail, icon: Icon, tone = "paper" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "paper" | "sage" | "honey" }) {
  const bg = tone === "sage" ? "bg-cls-sage/70" : tone === "honey" ? "bg-cls-honey/45" : "bg-cls-paper";
  return <article className={`${bg} min-w-0 rounded-2xl border border-cls-line p-4 shadow-paper`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-cls-ink/90">{label}</p><Icon className="h-5 w-5 shrink-0 text-cls-primary" /></div><p className="mt-3 truncate text-2xl font-black text-cls-primary-dark">{value}</p><p className="mt-1 text-[11px] text-cls-ink/88">{detail}</p></article>;
}

export function Panel({ title, description, children, className = "" }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-cls-line bg-cls-paper shadow-paper ${className}`}><header className="border-b border-cls-line px-4 py-3 sm:px-5"><h2 className="font-sans text-sm font-black text-cls-primary-dark">{title}</h2>{description && <p className="mt-0.5 text-[11px] text-cls-ink/88">{description}</p>}</header><div className="min-w-0 p-4 sm:p-5">{children}</div></section>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center px-4 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-cls-sage text-cls-primary"><Inbox className="h-5 w-5" /></span><h3 className="mt-3 font-sans text-sm font-black">{title}</h3><p className="mt-1 max-w-sm text-xs text-cls-ink/88">{text}</p></div>;
}

export const fieldClass = "min-h-11 w-full rounded-xl border border-cls-line bg-cls-paper px-3 text-base outline-none focus:border-cls-primary focus:ring-2 focus:ring-cls-honey/50 sm:text-sm";
export const labelClass = "mb-1.5 block text-xs font-bold text-cls-primary-dark";

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const styles = { good: "bg-cls-sage text-cls-primary-dark", warn: "bg-cls-honey/50 text-cls-primary-dark", bad: "bg-red-100 text-red-800", neutral: "bg-cls-cream text-cls-ink/94" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${styles[tone]}`}>{children}</span>;
}

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-cls-line pt-3">
      <button type="button" className="btn-outline min-h-10 px-3 py-1 text-xs" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-3.5 w-3.5" /> Anterior</button>
      <span className="text-[11px] font-bold text-cls-ink/88">Página {page} de {pageCount}</span>
      <button type="button" className="btn-outline min-h-10 px-3 py-1 text-xs" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Siguiente <ChevronRight className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function BulkActionsBar({ count, onClear, children }: { count: number; onClear: () => void; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-cls-primary/30 bg-cls-sage/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-black text-cls-primary-dark">{count} seleccionado(s)</p>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button type="button" className="text-xs font-bold text-cls-ink/88 hover:text-cls-primary" onClick={onClear}>Limpiar selección</button>
      </div>
    </div>
  );
}

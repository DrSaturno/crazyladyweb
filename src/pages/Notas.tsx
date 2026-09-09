import { useState } from "react";
import { ArrowRight, BookOpen, Bug, Leaf, Scissors, ShieldCheck, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { NOTAS, type TipoNota } from "../data/notas";

type Filter = "todas" | TipoNota;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "guia", label: "Guías de cultivo" },
  { key: "problema", label: "Resolvé un problema" },
];

const ICONS = [Leaf, Bug, Timer, ShieldCheck, BookOpen, Scissors];
const COLORS = ["bg-cls-sage", "bg-[#F3C39A]", "bg-[#E7D4B8]"];

export default function Notas() {
  const [filter, setFilter] = useState<Filter>("todas");
  const notes = filter === "todas" ? NOTAS : NOTAS.filter((note) => note.tipo === filter);

  return (
    <div className="site-container py-8 md:py-12">
      <header className="rounded-[28px] border border-cls-line bg-cls-sage p-6 md:p-9">
        <p className="eyebrow">Aprender para cultivar mejor</p>
        <h1 className="display-title mt-2 text-4xl md:text-6xl">El diario de Crazy Lady</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cls-ink/70 md:text-base">Lo que aprendimos cultivando y respondiendo consultas, escrito para que puedas tomar decisiones con más confianza.</p>
      </header>

      <div className="my-6 flex flex-wrap gap-2" aria-label="Filtrar notas">
        {FILTERS.map((item) => <button key={item.key} onClick={() => setFilter(item.key)} aria-pressed={filter === item.key} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-bold transition ${filter === item.key ? "border-cls-primary bg-cls-primary text-cls-paper" : "border-cls-line bg-cls-paper text-cls-primary hover:border-cls-primary"}`}>{item.label}</button>)}
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Notas publicadas">
        {notes.map((note, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <Link key={note.slug} to={`/notas/${note.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-cls-line bg-cls-paper shadow-paper transition hover:-translate-y-0.5 hover:border-cls-primary/40 hover:shadow-lift">
              <div className={`relative flex aspect-[16/9] items-center justify-center ${COLORS[index % COLORS.length]}`}>
                <Icon className="h-16 w-16 text-cls-primary transition duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" strokeWidth={1.25} aria-hidden="true" />
                {note.tipo === "problema" && <span className="absolute left-3 top-3 rounded-full bg-cls-primary px-3 py-1 text-[10px] font-bold text-cls-paper">Problema → solución</span>}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-cls-ink/50">{note.fecha} · {note.minutos} min</p>
                <h2 className="mt-2 font-sans text-lg font-bold leading-snug text-cls-primary-dark transition group-hover:text-cls-orange">{note.titulo}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-cls-ink/65">{note.bajada}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cls-primary">Leer nota <ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

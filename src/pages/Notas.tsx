import { useState } from "react";
import { Link } from "react-router-dom";
import { NOTAS, type TipoNota } from "../data/notas";

type Filtro = "todas" | TipoNota;

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "guia", label: "Guías de cultivo" },
  { key: "problema", label: "Resolvé un problema" },
];

export default function Notas() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const lista = filtro === "todas" ? NOTAS : NOTAS.filter((n) => n.tipo === filtro);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white">El diario íntimo de Crazy Lady</h1>
        <p className="text-sm text-white/60 mt-3 max-w-2xl leading-relaxed">
          Todo lo que aprendimos cultivando y atendiendo consultas, escrito para que te sirva de
          verdad. Sin humo y sin vueltas.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`text-xs font-bold px-4 py-2 rounded-full border transition ${
              filtro === f.key
                ? "border-cls-primary bg-cls-primary/15 text-cls-primary"
                : "border-navy-500 text-white/50 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lista.map((n) => (
          <Link
            key={n.slug}
            to={`/notas/${n.slug}`}
            className="group bg-navy-800 border border-navy-500 rounded-2xl overflow-hidden hover:border-cls-primary/50 transition-colors flex flex-col"
          >
            <div className="aspect-[16/9] bg-navy-700 flex items-center justify-center text-6xl relative">
              {n.emoji}
              {n.tipo === "problema" && (
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-cls-green/15 text-cls-green border border-cls-green/30">
                  Problema → solución
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                {n.fecha} · {n.minutos} min de lectura
              </p>
              <h2 className="text-base font-bold text-white mt-2 leading-snug group-hover:text-cls-primary transition-colors">
                {n.titulo}
              </h2>
              <p className="text-xs text-white/50 mt-2 leading-relaxed flex-1">{n.bajada}</p>
              <p className="text-xs font-bold text-cls-primary mt-4">Leer nota →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

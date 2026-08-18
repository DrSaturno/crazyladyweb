import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { BANCOS } from "../data/catalogo";

// Segunda sección del home, pedida por Nico: la línea de íconos de bancos.
// Cada uno filtra el catálogo por ese banco (propuesta §2.1).
// Los logos reales todavía no llegaron (carpeta de Drive «03 · LOGOS Y MARCA»
// está vacía), así que por ahora se usa la sigla dentro de un círculo.

export default function BancosRow() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">Bancos obtentores</h2>
          <p className="text-sm text-white/50 mt-1">
            Trabajamos con genéticas de origen declarado. Entrá al catálogo de cada banco.
          </p>
        </div>
        <Link to="/semillas" className="text-xs font-bold text-cls-primary hover:text-white transition whitespace-nowrap">
          Ver todo →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-8">
        {BANCOS.map((b) => (
          <Link
            key={b.slug}
            to={`/semillas?banco=${b.slug}`}
            className="flex-shrink-0 w-24 sm:w-auto flex flex-col items-center gap-2 group"
          >
            <div className="relative w-20 h-20 rounded-full bg-navy-800 border border-navy-500 group-hover:border-cls-primary flex items-center justify-center transition-colors">
              <span className="text-lg font-black text-white/70 group-hover:text-white transition-colors">
                {b.sigla}
              </span>
              {b.inase && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cls-green flex items-center justify-center border-2 border-navy-900">
                  <ShieldCheck className="w-3 h-3 text-black" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-center text-white/60 group-hover:text-white leading-tight transition-colors">
              {b.nombre}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

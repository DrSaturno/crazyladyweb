import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import {
  SEMILLAS,
  BANCOS,
  ORIGEN_LABEL,
  TIPO_LABEL,
  GENETICA_LABEL,
  type Origen,
  type TipoSemilla,
  type Genetica,
} from "../data/catalogo";

// La taxonomía completa que pidió Nico:
//   origen (nacional / importada) → tipo (feminizada / automática / CBD)
//   → genética (índica / sativa / híbrida) → banco obtentor
// Todos los filtros viven en la URL, así que son compartibles y el menú del
// header puede linkear directo a cualquier combinación.

export default function Semillas() {
  const [params, setParams] = useSearchParams();

  const origen = params.get("origen") as Origen | null;
  const tipo = params.get("tipo") as TipoSemilla | null;
  const genetica = params.get("genetica") as Genetica | null;
  const banco = params.get("banco");
  const soloStock = params.get("stock") === "1";

  const bancoNombre = BANCOS.find((b) => b.slug === banco)?.nombre;

  function setFiltro(clave: string, valor: string | null) {
    const next = new URLSearchParams(params);
    if (valor === null || next.get(clave) === valor) next.delete(clave);
    else next.set(clave, valor);
    setParams(next, { replace: true });
  }

  function limpiar() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const resultados = useMemo(() => {
    return SEMILLAS.filter((p) => {
      if (origen && p.origen !== origen) return false;
      if (tipo && p.tipo !== tipo) return false;
      if (genetica && p.genetica !== genetica) return false;
      if (bancoNombre && p.banco !== bancoNombre) return false;
      if (soloStock && p.stock === 0) return false;
      return true;
    }).sort((a, b) => b.stock - a.stock);
  }, [origen, tipo, genetica, bancoNombre, soloStock]);

  const hayFiltros = Boolean(origen || tipo || genetica || banco || soloStock);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white">
          {bancoNombre ?? "Semillas"}
        </h1>
        <p className="text-sm text-white/50 mt-2">
          {resultados.length} {resultados.length === 1 ? "genética" : "genéticas"}
          {hayFiltros ? " con los filtros aplicados" : " en el catálogo"}
        </p>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* ── Filtros ── */}
        <aside className="lg:sticky lg:top-32 lg:self-start space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
            </p>
            {hayFiltros && (
              <button onClick={limpiar} className="text-[11px] font-bold text-cls-primary hover:text-white transition">
                Limpiar
              </button>
            )}
          </div>

          <Grupo titulo="Origen">
            {(["nacional", "importada"] as const).map((o) => (
              <Chip key={o} activo={origen === o} onClick={() => setFiltro("origen", o)}>
                {ORIGEN_LABEL[o]}
              </Chip>
            ))}
          </Grupo>

          <Grupo titulo="Tipo">
            {(["feminizada", "automatica", "cbd"] as const).map((t) => (
              <Chip key={t} activo={tipo === t} onClick={() => setFiltro("tipo", t)}>
                {TIPO_LABEL[t]}
              </Chip>
            ))}
          </Grupo>

          <Grupo titulo="Genética">
            {(["indica", "sativa", "hibrida"] as const).map((g) => (
              <Chip key={g} activo={genetica === g} onClick={() => setFiltro("genetica", g)}>
                {GENETICA_LABEL[g]}
              </Chip>
            ))}
          </Grupo>

          <Grupo titulo="Banco obtentor">
            {BANCOS.map((b) => (
              <Chip key={b.slug} activo={banco === b.slug} onClick={() => setFiltro("banco", b.slug)}>
                {b.nombre}
                {b.inase && <span className="ml-1 text-[9px] text-cls-green font-bold">INASE</span>}
              </Chip>
            ))}
          </Grupo>

          <Grupo titulo="Disponibilidad">
            <Chip activo={soloStock} onClick={() => setFiltro("stock", "1")}>
              Solo con stock
            </Chip>
          </Grupo>
        </aside>

        {/* ── Resultados ── */}
        <div>
          {hayFiltros && (
            <div className="flex flex-wrap gap-2 mb-5">
              {origen && <Tag onRemove={() => setFiltro("origen", null)}>{ORIGEN_LABEL[origen]}</Tag>}
              {tipo && <Tag onRemove={() => setFiltro("tipo", null)}>{TIPO_LABEL[tipo]}</Tag>}
              {genetica && <Tag onRemove={() => setFiltro("genetica", null)}>{GENETICA_LABEL[genetica]}</Tag>}
              {bancoNombre && <Tag onRemove={() => setFiltro("banco", null)}>{bancoNombre}</Tag>}
              {soloStock && <Tag onRemove={() => setFiltro("stock", null)}>Con stock</Tag>}
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-navy-500 rounded-2xl">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-white font-bold">No hay genéticas con esa combinación</p>
              <p className="text-sm text-white/50 mt-1">Probá aflojando algún filtro.</p>
              <button
                onClick={limpiar}
                className="mt-5 text-xs font-bold bg-cls-primary hover:bg-cls-primary-dark text-white px-4 py-2.5 rounded-xl transition"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resultados.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2.5">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
        activo
          ? "border-cls-primary bg-cls-primary/15 text-cls-primary"
          : "border-navy-500 text-white/55 hover:text-white hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-navy-700 border border-navy-500 text-white/70 pl-3 pr-2 py-1.5 rounded-full">
      {children}
      <button onClick={onRemove} className="hover:text-white" aria-label="Quitar filtro">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

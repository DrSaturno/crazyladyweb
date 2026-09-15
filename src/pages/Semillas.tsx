import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCommerceData } from "../context/CommerceDataContext";
import {
  BANCOS,
  GENETICA_LABEL,
  ORIGEN_LABEL,
  TIPO_LABEL,
  type Genetica,
  type Origen,
  type TipoSemilla,
} from "../data/catalogo";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const PAGE_SIZE = 20;

export default function Semillas() {
  const { products } = useCommerceData();
  const semillas = useMemo(() => products.filter((product) => product.categoria === "semilla"), [products]);
  const [params, setParams] = useSearchParams();
  const origen = params.get("origen") as Origen | null;
  const tipo = params.get("tipo") as TipoSemilla | null;
  const genetica = params.get("genetica") as Genetica | null;
  const banco = params.get("banco");
  const soloStock = params.get("stock") === "1";
  const query = params.get("q")?.trim() ?? "";
  const requestedPage = Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1);
  const bancoNombre = BANCOS.find((item) => item.slug === banco)?.nombre;

  function setFiltro(clave: string, valor: string | null) {
    const next = new URLSearchParams(params);
    if (valor === null || next.get(clave) === valor) next.delete(clave);
    else next.set(clave, valor);
    next.delete("pagina");
    setParams(next, { replace: true });
  }

  function setPagina(value: number) {
    const next = new URLSearchParams(params);
    if (value <= 1) next.delete("pagina");
    else next.set("pagina", String(value));
    setParams(next);
    window.requestAnimationFrame(() => document.getElementById("catalog-results")?.scrollIntoView({ block: "start" }));
  }

  function limpiarFiltros() {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    setParams(next, { replace: true });
  }

  function limpiarTodo() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const resultados = useMemo(() => {
    const normalizedQuery = normalize(query);
    return semillas.filter((product) => {
      if (product.visible_web === false) return false;
      if (origen && product.origen !== origen) return false;
      if (tipo && product.tipo !== tipo) return false;
      if (genetica && product.genetica !== genetica) return false;
      if (bancoNombre && product.banco !== bancoNombre) return false;
      if (soloStock && product.stock === 0) return false;
      if (normalizedQuery && !normalize(`${product.nombre} ${product.banco} ${product.tipo} ${product.genetica}`).includes(normalizedQuery)) return false;
      return true;
    }).sort((a, b) => b.stock - a.stock || a.nombre.localeCompare(b.nombre));
  }, [bancoNombre, genetica, origen, query, semillas, soloStock, tipo]);

  const hayFiltros = Boolean(origen || tipo || genetica || banco || soloStock);
  const title = query ? `Resultados para “${query}”` : bancoNombre ?? "Semillas";
  const pageCount = Math.max(1, Math.ceil(resultados.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const pagedResults = resultados.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filters = (
    <Filters
      origen={origen}
      tipo={tipo}
      genetica={genetica}
      banco={banco}
      soloStock={soloStock}
      setFiltro={setFiltro}
    />
  );

  return (
    <div className="site-container py-8 md:py-12">
      <header className="rounded-[26px] border border-cls-line bg-cls-sage px-5 py-7 md:px-8">
        <p className="eyebrow">Catálogo trazable</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display-title text-4xl md:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-cls-ink/94">
              {resultados.length} {resultados.length === 1 ? "genética disponible" : "genéticas disponibles"} con origen declarado.
            </p>
          </div>
          <div className="rounded-full bg-cls-paper px-4 py-2 text-xs font-bold text-cls-primary shadow-sm">
            Ordenadas por disponibilidad
          </div>
        </div>
      </header>

      <details className="section-shell mt-4 p-4 lg:hidden">
        <summary className="flex min-h-11 list-none items-center justify-between font-bold text-cls-primary-dark">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtrar catálogo</span>
          {hayFiltros && <span className="rounded-full bg-cls-honey px-2 py-1 text-[10px]">Filtros activos</span>}
        </summary>
        <div className="border-t border-cls-line pt-4">{filters}</div>
      </details>

      <div className="mt-6 grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden self-start lg:sticky lg:top-[180px] lg:block" aria-label="Filtros del catálogo">
          <div className="section-shell p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold text-cls-primary-dark"><SlidersHorizontal className="h-4 w-4" /> Filtros</p>
              {hayFiltros && <button onClick={limpiarFiltros} className="text-xs font-bold text-cls-orange hover:text-cls-primary">Limpiar</button>}
            </div>
            {filters}
          </div>
        </aside>

        <section id="catalog-results" aria-label="Resultados del catálogo">
          {(query || hayFiltros) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {query && <Tag onRemove={() => setFiltro("q", null)}>Búsqueda: {query}</Tag>}
              {origen && <Tag onRemove={() => setFiltro("origen", null)}>{ORIGEN_LABEL[origen]}</Tag>}
              {tipo && <Tag onRemove={() => setFiltro("tipo", null)}>{TIPO_LABEL[tipo]}</Tag>}
              {genetica && <Tag onRemove={() => setFiltro("genetica", null)}>{GENETICA_LABEL[genetica]}</Tag>}
              {bancoNombre && <Tag onRemove={() => setFiltro("banco", null)}>{bancoNombre}</Tag>}
              {soloStock && <Tag onRemove={() => setFiltro("stock", null)}>Con stock</Tag>}
            </div>
          )}

          {resultados.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {pagedResults.map((product) => <ProductCard key={product.id} producto={product} />)}
              </div>
              {pageCount > 1 && (
                <nav aria-label="Paginación del catálogo" className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-cls-line bg-cls-paper p-3 shadow-paper">
                  <button type="button" className="btn-outline min-w-11 px-3 sm:px-5" disabled={currentPage <= 1} onClick={() => setPagina(currentPage - 1)} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Anterior</span></button>
                  <span className="text-center text-xs font-bold text-cls-primary-dark">Página {currentPage} de {pageCount}<span className="mt-0.5 block text-[10px] font-normal text-cls-ink/84">{resultados.length} genéticas</span></span>
                  <button type="button" className="btn-outline min-w-11 px-3 sm:px-5" disabled={currentPage >= pageCount} onClick={() => setPagina(currentPage + 1)} aria-label="Página siguiente"><span className="hidden sm:inline">Siguiente</span><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
                </nav>
              )}
            </>
          ) : (
            <div className="section-shell flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cls-sage text-cls-primary"><Search className="h-6 w-6" /></span>
              <h2 className="mt-4 text-2xl font-black">No encontramos esa combinación</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-cls-ink/92">
                Probá con menos filtros, el nombre del banco o términos como “CBD”, “automática” o “nacional”.
              </p>
              <button onClick={limpiarTodo} className="btn-primary mt-6">Ver todo el catálogo</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface FiltersProps {
  origen: Origen | null;
  tipo: TipoSemilla | null;
  genetica: Genetica | null;
  banco: string | null;
  soloStock: boolean;
  setFiltro: (key: string, value: string | null) => void;
}

function Filters({ origen, tipo, genetica, banco, soloStock, setFiltro }: FiltersProps) {
  return (
    <div className="space-y-5">
      <FilterGroup title="Origen">
        {(["nacional", "importada"] as const).map((value) => <Chip key={value} active={origen === value} onClick={() => setFiltro("origen", value)}>{ORIGEN_LABEL[value]}</Chip>)}
      </FilterGroup>
      <FilterGroup title="Tipo">
        {(["feminizada", "automatica", "cbd"] as const).map((value) => <Chip key={value} active={tipo === value} onClick={() => setFiltro("tipo", value)}>{TIPO_LABEL[value]}</Chip>)}
      </FilterGroup>
      <FilterGroup title="Genética">
        {(["indica", "sativa", "hibrida"] as const).map((value) => <Chip key={value} active={genetica === value} onClick={() => setFiltro("genetica", value)}>{GENETICA_LABEL[value]}</Chip>)}
      </FilterGroup>
      <FilterGroup title="Banco obtentor">
        {BANCOS.map((item) => <Chip key={item.slug} active={banco === item.slug} onClick={() => setFiltro("banco", item.slug)}>{item.nombre}{item.inase && <span className="ml-1 text-[9px] font-black">INASE</span>}</Chip>)}
      </FilterGroup>
      <FilterGroup title="Disponibilidad">
        <Chip active={soloStock} onClick={() => setFiltro("stock", "1")}>Solo con stock</Chip>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset><legend className="eyebrow mb-2">{title}</legend><div className="flex flex-wrap gap-2">{children}</div></fieldset>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-full border px-3 py-1.5 text-left text-xs font-bold transition ${active ? "border-cls-primary bg-cls-primary text-cls-paper" : "border-cls-line bg-cls-paper text-cls-ink/94 hover:border-cls-primary hover:text-cls-primary"}`}
    >
      {children}
    </button>
  );
}

function Tag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cls-line bg-cls-paper pl-3 pr-1.5 text-xs font-bold text-cls-primary shadow-sm">
      {children}
      <button type="button" onClick={onRemove} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cls-cream" aria-label={`Quitar filtro ${String(children)}`}><X className="h-3.5 w-3.5" aria-hidden="true" /></button>
    </span>
  );
}

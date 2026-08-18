import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Sprout, MessageCircle, ArrowRight, Scissors, FileText } from "lucide-react";
import ProductCard from "../components/ProductCard";
import BancosRow from "../components/BancosRow";
import {
  SEMILLAS,
  ESQUEJES,
  disponibles,
  esInase,
  TIPO_LABEL,
  type TipoSemilla,
} from "../data/catalogo";
import { NOTAS } from "../data/notas";

const SELLOS = [
  { icon: ShieldCheck, titulo: "Registro INASE", texto: "Licencias INASE y ARICCAME vigentes" },
  { icon: Sprout, titulo: "Garantía de germinación", texto: "Si no germina, lo resolvemos" },
  { icon: Truck, titulo: "Envíos a todo el país", texto: "Por Andreani, despacho en 48hs" },
  { icon: MessageCircle, titulo: "Asesoramiento real", texto: "Te ayudamos a elegir y a cultivar" },
];

type FiltroHome = "todas" | TipoSemilla;

export default function Home() {
  const [filtro, setFiltro] = useState<FiltroHome>("todas");

  const conStock = disponibles();
  const grilla = (filtro === "todas" ? conStock : conStock.filter((p) => p.tipo === filtro)).slice(0, 8);
  const inaseDestacadas = SEMILLAS.filter((p) => esInase(p.banco) && p.stock > 0).slice(0, 4);
  const notasBlog = NOTAS.filter((n) => n.tipo === "guia").slice(0, 3);
  const notasProblema = NOTAS.filter((n) => n.tipo === "problema").slice(0, 2);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-navy-500">
        <div className="absolute inset-0 bg-cls-gradient opacity-[0.07]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-cls-green/15 text-cls-green border border-cls-green/30">
              <ShieldCheck className="w-3 h-3" /> Genéticas registradas · Registro N° 12665
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-black text-white leading-[1.05]">
              Sembrando <span className="cls-wordmark">felicidad</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/60 leading-relaxed">
              Semillas y esquejes de genéticas registradas, de bancos nacionales e importados.
              Te acompañamos desde la elección hasta la cosecha.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/semillas"
                className="inline-flex items-center gap-2 bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
              >
                Ver el catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/notas"
                className="inline-flex items-center gap-2 border border-navy-500 hover:border-white/40 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
              >
                ¿Primera vez cultivando?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SELLOS DE CONFIANZA ──────────────────────────────────────── */}
      <section className="border-b border-navy-500 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {SELLOS.map((s) => (
            <div key={s.titulo} className="flex items-start gap-3">
              <s.icon className="w-5 h-5 text-cls-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">{s.titulo}</p>
                <p className="text-[11px] text-white/45 mt-0.5 leading-snug">{s.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANCOS — segunda sección, pedido de Nico ─────────────────── */}
      <BancosRow />

      {/* ── DISPONIBLES AHORA ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-navy-500">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">Disponibles ahora</h2>
            <p className="text-sm text-white/50 mt-1">Con stock real, listas para despachar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["todas", "feminizada", "automatica", "cbd"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-xs font-bold px-3.5 py-2 rounded-full border transition ${
                  filtro === f
                    ? "border-cls-primary bg-cls-primary/15 text-cls-primary"
                    : "border-navy-500 text-white/50 hover:text-white"
                }`}
              >
                {f === "todas" ? "Todas" : TIPO_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {grilla.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/semillas" className="text-sm font-bold text-cls-primary hover:text-white transition">
            Ver las {conStock.length} disponibles →
          </Link>
        </div>
      </section>

      {/* ── GENÉTICAS INASE ──────────────────────────────────────────── */}
      {inaseDestacadas.length > 0 && (
        <section className="border-y border-navy-500 bg-navy-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cls-green" /> Genéticas registradas INASE
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Obtentor identificable, características declaradas y trazabilidad.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {inaseDestacadas.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RECOMENDACIONES — «problema → causa → producto» ──────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-black text-white">¿Se te complicó el cultivo?</h2>
          <p className="text-sm text-white/50 mt-1">
            Los problemas más comunes, qué los causa y qué hacer. Sin vueltas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notasProblema.map((n) => (
            <Link
              key={n.slug}
              to={`/notas/${n.slug}`}
              className="group bg-navy-800 border border-navy-500 rounded-2xl p-6 hover:border-cls-green/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{n.emoji}</span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white group-hover:text-cls-green transition-colors">
                    {n.titulo}
                  </h3>
                  <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{n.bajada}</p>
                  <p className="text-xs font-bold text-cls-green mt-3 inline-flex items-center gap-1">
                    Ver qué hacer <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ESQUEJES ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-navy-500">
        <div className="bg-navy-800 border border-navy-500 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-cls-primary/15 text-cls-primary border border-cls-primary/30 w-fit">
                <Scissors className="w-3 h-3" /> Esquejes
              </span>
              <h2 className="mt-4 text-2xl md:text-3xl font-black text-white leading-tight">
                Arrancá con una planta, no con una semilla
              </h2>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Variedades registradas y de selección propia de la casa. El esqueje es un clon de una
                madre seleccionada: ya sabés exactamente qué vas a obtener, y te salteás la germinación.
              </p>
              <Link
                to="/esquejes"
                className="mt-6 inline-flex items-center gap-2 bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-5 py-3 rounded-xl transition w-fit"
              >
                Ver esquejes disponibles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-8 md:p-10 bg-navy-700/50 grid grid-cols-2 gap-4 content-center">
              {ESQUEJES.slice(0, 2).map((e) => (
                <ProductCard key={e.id} producto={e} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER REPROCANN → página interna ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to="/reprocann"
          className="group block relative overflow-hidden rounded-3xl border border-navy-500 bg-navy-800 hover:border-cls-green/50 transition-colors"
        >
          <div className="absolute inset-0 bg-cls-gradient opacity-[0.08] group-hover:opacity-[0.14] transition-opacity" />
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
            <FileText className="w-12 h-12 text-cls-green flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-black text-white">Tramitá tu REPROCANN</h2>
              <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                El Registro del Programa de Cannabis te habilita al autocultivo con fines medicinales.
                Trabajamos con un equipo especializado que se encarga del trámite de punta a punta.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 bg-cls-green hover:bg-cls-green-dark text-black font-bold text-sm px-5 py-3 rounded-xl transition flex-shrink-0">
              Cómo tramitarlo <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── EL DIARIO ÍNTIMO DE CRAZY LADY (blog) ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">El diario íntimo de Crazy Lady</h2>
            <p className="text-sm text-white/50 mt-1">Notas de cultivo, sin humo y sin vueltas.</p>
          </div>
          <Link to="/notas" className="text-xs font-bold text-cls-primary hover:text-white transition whitespace-nowrap">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notasBlog.map((n) => (
            <Link
              key={n.slug}
              to={`/notas/${n.slug}`}
              className="group bg-navy-800 border border-navy-500 rounded-2xl overflow-hidden hover:border-cls-primary/50 transition-colors flex flex-col"
            >
              <div className="aspect-[16/9] bg-navy-700 flex items-center justify-center text-5xl">
                {n.emoji}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {n.fecha} · {n.minutos} min
                </p>
                <h3 className="text-sm font-bold text-white mt-2 leading-snug group-hover:text-cls-primary transition-colors">
                  {n.titulo}
                </h3>
                <p className="text-xs text-white/50 mt-2 leading-relaxed line-clamp-3">{n.bajada}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SUSCRIPCIÓN ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-navy-800 border border-navy-500 rounded-3xl p-8 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-black text-white">Enterate antes que el resto</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
            Stock nuevo, genéticas exclusivas y notas de cultivo. Sin spam.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="flex-1 bg-navy-900 border border-navy-500 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cls-primary"
            />
            <button
              type="submit"
              className="bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronLeft, AlertCircle, ArrowRight } from "lucide-react";
import { getNota, NOTAS } from "../data/notas";
import { getProducto, precioARS } from "../data/catalogo";
import { useCart } from "../context/CartContext";

/** Renderiza los **negrita** del cuerpo sin traer una librería de markdown entera. */
function Parrafo({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-[15px] text-white/70 leading-[1.8]">
      {partes.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-white font-bold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}

export default function NotaDetalle() {
  const { slug } = useParams();
  const nota = slug ? getNota(slug) : undefined;
  const { agregar } = useCart();

  if (!nota) return <Navigate to="/notas" replace />;

  const recomendado = nota.productoRecomendado ? getProducto(nota.productoRecomendado) : undefined;
  const otras = NOTAS.filter((n) => n.slug !== nota.slug).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/notas"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> El diario de Crazy Lady
      </Link>

      <article>
        <header className="mb-8">
          <div className="text-6xl mb-5">{nota.emoji}</div>
          <p className="text-[11px] text-white/40 uppercase tracking-wider">
            {nota.fecha} · {nota.minutos} min de lectura
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-3 leading-tight">{nota.titulo}</h1>
          <p className="text-lg text-white/60 mt-4 leading-relaxed">{nota.bajada}</p>
        </header>

        {/* Bloque de causa — solo en notas «problema → causa → producto» */}
        {nota.causa && (
          <div className="bg-navy-800 border-l-4 border-cls-green rounded-r-2xl p-5 mb-8">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cls-green mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> Causa más probable
            </p>
            <p className="text-sm text-white/80 leading-relaxed">{nota.causa}</p>
          </div>
        )}

        <div className="space-y-5">
          {nota.cuerpo.map((p, i) => (
            <Parrafo key={i} texto={p} />
          ))}
        </div>

        {/* Producto recomendado, con agregar al carrito desde la nota (propuesta §2.1) */}
        {recomendado && (
          <div className="mt-10 bg-navy-800 border border-navy-500 rounded-2xl p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-cls-primary mb-4">
              Lo que te recomendamos
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <div className="w-20 h-20 bg-navy-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                🌱
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{recomendado.banco}</p>
                <Link
                  to={`/producto/${recomendado.slug}`}
                  className="text-base font-bold text-white hover:text-cls-primary transition"
                >
                  {recomendado.nombre}
                </Link>
                <p className="text-lg font-black text-white mt-1">{precioARS(recomendado.precio)}</p>
              </div>
              <button
                onClick={() => agregar(recomendado)}
                disabled={recomendado.stock === 0}
                className="bg-cls-primary hover:bg-cls-primary-dark disabled:opacity-30 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
              >
                {recomendado.stock === 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        )}

        {/* Cierre — el bot como siguiente paso */}
        <div className="mt-10 bg-navy-800 border border-navy-500 rounded-2xl p-6">
          <p className="text-sm text-white/70 leading-relaxed">
            <span className="font-bold text-white">¿Te quedó alguna duda?</span> Abrí el chat acá abajo
            y contame tu caso — te ayudo a elegir la genética según tu espacio y tu experiencia.
          </p>
        </div>
      </article>

      {/* Otras notas */}
      <section className="mt-14">
        <h2 className="text-lg font-black text-white mb-5">Seguí leyendo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otras.map((n) => (
            <Link
              key={n.slug}
              to={`/notas/${n.slug}`}
              className="group bg-navy-800 border border-navy-500 rounded-2xl p-5 hover:border-cls-primary/50 transition-colors"
            >
              <div className="text-3xl mb-3">{n.emoji}</div>
              <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cls-primary transition-colors">
                {n.titulo}
              </h3>
              <p className="text-xs font-bold text-cls-primary mt-3 inline-flex items-center gap-1">
                Leer <ArrowRight className="w-3 h-3" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

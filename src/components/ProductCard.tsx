import { useState } from "react";
import { Heart, Leaf, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { GENETICA_LABEL, TIPO_LABEL, esInase, precioARS, type Producto } from "../data/catalogo";
import { isStudioImage } from "../data/productPhotography";

const TIPO_STYLE: Record<string, string> = {
  feminizada: "border-[#80589A]/30 bg-[#E6D7ED] text-[#553667]",
  automatica: "border-[#D27A3E]/30 bg-[#F8D4B7] text-[#80431D]",
  cbd: "border-cls-primary/25 bg-cls-sage/70 text-cls-primary-dark",
};

export default function ProductCard({ producto, compact = false }: { producto: Producto; compact?: boolean }) {
  const { agregar } = useCart();
  const { alternar, contiene } = useWishlist();
  const [agregado, setAgregado] = useState(false);
  const sinStock = producto.stock === 0;
  const favorito = contiene(producto.id);
  const inase = esInase(producto.banco);
  const studioPhoto = isStudioImage(producto.imagen);

  function handleAgregar() {
    agregar(producto);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1400);
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-cls-line bg-cls-paper shadow-[0_4px_14px_rgba(23,53,44,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-cls-primary/40 hover:shadow-lift">
      <div className="relative">
        <Link to={`/producto/${producto.slug}`} className="block overflow-hidden" aria-label={`Ver ${producto.nombre}`}>
          <div className={`${studioPhoto ? "aspect-square" : compact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"} product-art relative flex items-center justify-center overflow-hidden`}>
            {producto.imagen ? (
              <img
                src={producto.imagen}
                srcSet={studioPhoto ? `${producto.imagen.replace(/\.webp$/, "-480.webp")} 480w, ${producto.imagen} 1200w` : undefined}
                sizes={compact ? "(min-width: 1280px) 120px, (min-width: 640px) 30vw, 45vw" : "(min-width: 1280px) 280px, (min-width: 768px) 30vw, 45vw"}
                alt={studioPhoto ? `Imagen ilustrativa de la flor de ${producto.nombre}` : `Presentación de ${producto.nombre}`}
                width={studioPhoto ? 1200 : undefined}
                height={studioPhoto ? 1200 : undefined}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden" aria-hidden="true">
                <span className="absolute -bottom-14 -left-9 h-36 w-36 rounded-full border-[18px] border-cls-orange/70" />
                <span className="absolute -right-8 top-4 h-28 w-28 rounded-full border-[14px] border-cls-honey/80" />
                <Leaf className="h-16 w-16 -rotate-12 text-cls-primary/75 drop-shadow-md sm:h-20 sm:w-20" strokeWidth={1.4} />
              </div>
            )}
          </div>
        </Link>

        <div className="absolute left-2 top-2 flex max-w-[70%] flex-wrap gap-1">
          {inase && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cls-primary/20 bg-cls-primary px-2 py-1 text-[9px] font-bold text-cls-paper shadow-sm">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> INASE
            </span>
          )}
          <span className={`rounded-full border px-2 py-1 text-[9px] font-bold shadow-sm ${TIPO_STYLE[producto.tipo]}`}>
            {TIPO_LABEL[producto.tipo]}
          </span>
        </div>

        <button
          onClick={() => alternar(producto.id)}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border border-cls-line bg-cls-paper/95 text-cls-primary shadow-sm transition hover:scale-105"
          aria-label={favorito ? `Quitar ${producto.nombre} de favoritos` : `Guardar ${producto.nombre} en favoritos`}
          aria-pressed={favorito}
        >
          <Heart className="h-4 w-4" fill={favorito ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        {sinStock && (
          <div className="absolute inset-x-0 bottom-0 bg-cls-primary-dark/92 px-3 py-2 text-center text-[11px] font-bold text-cls-paper">
            Sin stock por el momento
          </div>
        )}
      </div>

      <div className={`${compact ? "p-3" : "p-3.5 sm:p-4"} flex flex-1 flex-col`}>
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-cls-ink/55">{producto.banco}</p>
        <Link to={`/producto/${producto.slug}`} className="mt-1">
          <h3 className="line-clamp-2 min-h-10 font-sans text-sm font-bold leading-snug text-cls-primary-dark transition group-hover:text-cls-orange">
            {producto.nombre}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold text-cls-ink/65">
          <span className="rounded-full bg-cls-cream px-2 py-1">{GENETICA_LABEL[producto.genetica]}</span>
          <span className="rounded-full bg-cls-cream px-2 py-1">{producto.presentacion}</span>
        </div>

        <div className="mt-auto pt-3">
          <p className="text-lg font-black leading-none text-cls-primary-dark">{precioARS(producto.precio)}</p>
          <button onClick={handleAgregar} disabled={sinStock || agregado} className="btn-primary mt-3 w-full px-3 text-xs" aria-live="polite">
            {agregado ? "Agregado al carrito" : sinStock ? "Sin stock" : "Sumar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
}

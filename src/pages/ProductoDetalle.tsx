import { useState } from "react";
import { Check, ChevronLeft, Heart, Leaf, Minus, Plus, ShieldCheck, Sprout, Truck } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  BANCOS,
  GENETICA_LABEL,
  ORIGEN_LABEL,
  SEMILLAS,
  TIPO_LABEL,
  esInase,
  getProducto,
  precioARS,
} from "../data/catalogo";

export default function ProductoDetalle() {
  const { slug } = useParams();
  const producto = slug ? getProducto(slug) : undefined;
  const { agregar } = useCart();
  const { alternar, contiene } = useWishlist();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (!producto) return <Navigate to="/semillas" replace />;

  const sinStock = producto.stock === 0;
  const inase = esInase(producto.banco);
  const favorito = contiene(producto.id);
  const banco = BANCOS.find((item) => item.nombre === producto.banco);
  const relacionados = SEMILLAS.filter((item) => item.id !== producto.id && item.stock > 0 && item.visible_web !== false && (item.banco === producto.banco || item.genetica === producto.genetica)).slice(0, 5);

  function handleAgregar() {
    agregar(producto!, cantidad);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1800);
  }

  return (
    <div className="site-container py-7 md:py-10">
      <nav aria-label="Migas de pan" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-cls-ink/60">
        <Link to="/semillas" className="inline-flex min-h-9 items-center gap-1 hover:text-cls-orange"><ChevronLeft className="h-4 w-4" /> Semillas</Link>
        <span aria-hidden="true">/</span>
        {banco && <><Link to={`/semillas?banco=${banco.slug}`} className="hover:text-cls-orange">{banco.nombre}</Link><span aria-hidden="true">/</span></>}
        <span className="text-cls-primary-dark">{producto.nombre}</span>
      </nav>

      <article className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="section-shell relative overflow-hidden p-3 md:p-5">
          <div className="product-art relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
            {producto.imagen ? (
              <img src={producto.imagen} alt={`Presentación de ${producto.nombre}`} className="h-full w-full object-contain" />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden" aria-hidden="true">
                <span className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[36px] border-cls-orange/65" />
                <span className="absolute -right-14 top-10 h-56 w-56 rounded-full border-[30px] border-cls-honey/75" />
                <Leaf className="h-36 w-36 -rotate-12 text-cls-primary/75 drop-shadow-md" strokeWidth={1.25} />
              </div>
            )}
            {sinStock && <div className="absolute inset-0 flex items-center justify-center bg-cls-primary-dark/80"><span className="rounded-full border border-cls-paper/40 px-5 py-2 text-sm font-bold text-cls-paper">Sin stock por el momento</span></div>}
          </div>
        </div>

        <div className="self-start lg:sticky lg:top-[175px]">
          <div className="flex flex-wrap items-center gap-2">
            {inase && <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-cls-primary px-3 py-1 text-[10px] font-bold text-cls-paper"><ShieldCheck className="h-3.5 w-3.5" /> Registrada INASE</span>}
            <span className="min-h-8 rounded-full border border-cls-line bg-cls-paper px-3 py-1.5 text-[10px] font-bold text-cls-primary">{TIPO_LABEL[producto.tipo]}</span>
            <span className="min-h-8 rounded-full border border-cls-line bg-cls-paper px-3 py-1.5 text-[10px] font-bold text-cls-primary">{GENETICA_LABEL[producto.genetica]}</span>
          </div>

          {banco ? <Link to={`/semillas?banco=${banco.slug}`} className="eyebrow mt-5 inline-block hover:text-cls-orange">{producto.banco}</Link> : <p className="eyebrow mt-5">Banco a confirmar</p>}
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="display-title text-4xl sm:text-5xl">{producto.nombre}</h1>
            <button onClick={() => alternar(producto.id)} aria-pressed={favorito} aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cls-line bg-cls-paper text-cls-primary transition hover:border-cls-primary">
              <Heart className="h-5 w-5" fill={favorito ? "currentColor" : "none"} />
            </button>
          </div>

          <p className="mt-5 text-3xl font-black text-cls-primary-dark">{precioARS(producto.precio)}</p>
          <p className="mt-1 text-xs text-cls-ink/60">Presentación {producto.presentacion} · Precio final en pesos argentinos</p>

          <dl className="mt-6 grid grid-cols-2 gap-2">
            {[
              ["Origen", ORIGEN_LABEL[producto.origen]],
              ["Tipo", TIPO_LABEL[producto.tipo]],
              ["Genética", GENETICA_LABEL[producto.genetica]],
              ["Banco obtentor", producto.banco],
            ].map(([key, value]) => (
              <div key={key} className="rounded-xl border border-cls-line bg-cls-paper px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-cls-ink/55">{key}</dt>
                <dd className="mt-1 text-sm font-bold text-cls-primary-dark">{value}</dd>
              </div>
            ))}
          </dl>

          {!sinStock ? (
            <div className="mt-6 rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper">
              <div className="flex flex-wrap gap-3">
                <div className="flex min-h-11 items-center overflow-hidden rounded-full border border-cls-line" aria-label="Cantidad">
                  <button onClick={() => setCantidad((current) => Math.max(1, current - 1))} disabled={cantidad <= 1} className="flex h-11 w-11 items-center justify-center text-cls-primary hover:bg-cls-cream disabled:opacity-35" aria-label="Restar una unidad"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center text-sm font-black text-cls-primary-dark" aria-live="polite">{cantidad}</span>
                  <button onClick={() => setCantidad((current) => Math.min(producto.stock, current + 1))} disabled={cantidad >= producto.stock} className="flex h-11 w-11 items-center justify-center text-cls-primary hover:bg-cls-cream disabled:opacity-35" aria-label="Sumar una unidad"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={handleAgregar} disabled={agregado} className="btn-primary flex-1 px-6" aria-live="polite">
                  {agregado ? <><Check className="h-4 w-4" /> Agregado al carrito</> : "Sumar al carrito"}
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-cls-ink/55">Máximo disponible para esta presentación: {producto.stock}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-cls-line bg-cls-sage p-5"><p className="font-bold text-cls-primary-dark">Esta genética está pausada</p><p className="mt-1 text-sm text-cls-ink/70">Guardala en favoritos o consultanos por una alternativa de perfil similar.</p></div>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <p className="flex min-h-12 items-center gap-2 rounded-xl bg-cls-sage/65 px-3 text-xs font-bold text-cls-primary-dark"><Sprout className="h-4 w-4" /> Garantía de germinación</p>
            <p className="flex min-h-12 items-center gap-2 rounded-xl bg-cls-sage/65 px-3 text-xs font-bold text-cls-primary-dark"><Truck className="h-4 w-4" /> Envío discreto por Andreani</p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-cls-ink/55">La clasificación genética incluida en esta maqueta debe validarse con Crazy Lady Seeds antes de la publicación productiva.</p>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="mt-12 border-t border-cls-line pt-8" aria-labelledby="related-title">
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="eyebrow">Seguí explorando</p><h2 id="related-title" className="section-heading mt-1">También te puede interesar</h2></div><Link to="/semillas" className="text-xs font-bold text-cls-primary hover:text-cls-orange">Ver catálogo →</Link></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{relacionados.map((item) => <ProductCard key={item.id} producto={item} />)}</div>
        </section>
      )}
    </div>
  );
}

import { ArrowRight, Leaf, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { precioARS } from "../data/catalogo";

export default function Carrito() {
  const { items, quitar, cambiarCantidad, total, totalItems } = useCart();

  if (!items.length) {
    return (
      <div className="site-container py-12 md:py-20">
        <section className="section-shell mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cls-sage text-cls-primary"><ShoppingCart className="h-7 w-7" /></span>
          <h1 className="display-title mt-5 text-4xl">Tu carrito está listo para empezar</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cls-ink/65">Explorá el catálogo, compará genéticas y sumá las que mejor se adapten a tu cultivo.</p>
          <Link to="/semillas" className="btn-primary mt-7">Ver el catálogo <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    );
  }

  return (
    <div className="site-container py-8 md:py-12">
      <header className="mb-7">
        <p className="eyebrow">Tu selección</p>
        <h1 className="display-title mt-2 text-4xl md:text-5xl">Carrito</h1>
        <p className="mt-2 text-sm text-cls-ink/65">{totalItems} {totalItems === 1 ? "unidad" : "unidades"}. Revisá cantidades antes de continuar.</p>
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Productos en el carrito" className="space-y-3">
          {items.map(({ producto, cantidad }) => (
            <article key={producto.id} className="section-shell grid grid-cols-[76px_minmax(0,1fr)] gap-4 p-3 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center sm:p-4">
              <Link to={`/producto/${producto.slug}`} className="product-art flex aspect-square items-center justify-center overflow-hidden rounded-xl">
                {producto.imagen ? <img src={producto.imagen} alt={`Presentación de ${producto.nombre}`} className="h-full w-full object-cover" /> : <Leaf className="h-10 w-10 text-cls-primary/70" strokeWidth={1.4} />}
              </Link>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-cls-ink/50">{producto.banco}</p>
                <Link to={`/producto/${producto.slug}`} className="mt-1 block font-bold text-cls-primary-dark hover:text-cls-orange">{producto.nombre}</Link>
                <p className="mt-1 text-xs text-cls-ink/55">{producto.presentacion} · {precioARS(producto.precio)} c/u</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 sm:hidden">
                  <Quantity value={cantidad} max={producto.stock} onChange={(value) => cambiarCantidad(producto.id, value)} />
                  <button onClick={() => quitar(producto.id)} className="flex h-11 w-11 items-center justify-center rounded-full text-[#9C332B] hover:bg-[#F7D4CF]" aria-label={`Quitar ${producto.nombre}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between border-t border-cls-line pt-3 sm:col-span-1 sm:border-0 sm:pt-0">
                <div className="hidden sm:flex sm:items-center sm:gap-2">
                  <Quantity value={cantidad} max={producto.stock} onChange={(value) => cambiarCantidad(producto.id, value)} />
                  <button onClick={() => quitar(producto.id)} className="flex h-11 w-11 items-center justify-center rounded-full text-[#9C332B] hover:bg-[#F7D4CF]" aria-label={`Quitar ${producto.nombre}`}><Trash2 className="h-4 w-4" /></button>
                </div>
                <p className="ml-5 min-w-24 text-right text-lg font-black text-cls-primary-dark">{precioARS(producto.precio * cantidad)}</p>
              </div>
            </article>
          ))}
        </section>

        <aside className="self-start lg:sticky lg:top-[175px]">
          <div className="section-shell p-5 md:p-6">
            <h2 className="text-2xl font-black">Resumen</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-cls-ink/65">Subtotal</dt><dd className="font-bold text-cls-primary-dark">{precioARS(total)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-cls-ink/65">Envío</dt><dd className="text-right text-xs font-semibold text-cls-ink/55">Se calcula con tu código postal</dd></div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-cls-line pt-5"><span className="font-bold">Total parcial</span><strong className="text-2xl text-cls-primary-dark">{precioARS(total)}</strong></div>
            <Link to="/checkout" className="btn-primary mt-6 w-full">Continuar la compra <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-cls-ink/50">El total final se confirma después de calcular el envío y validar disponibilidad.</p>
          </div>

          <div className="mt-3 grid gap-2">
            <div className="flex gap-3 rounded-2xl border border-cls-line bg-cls-sage/70 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-cls-primary" /><div><p className="text-xs font-bold text-cls-primary-dark">Compra protegida</p><p className="mt-1 text-[11px] leading-relaxed text-cls-ink/65">Precio y stock se volverán a validar en servidor antes de crear la orden.</p></div></div>
            <div className="flex gap-3 rounded-2xl border border-cls-line bg-cls-paper p-4"><Truck className="h-5 w-5 shrink-0 text-cls-primary" /><div><p className="text-xs font-bold text-cls-primary-dark">Envío discreto</p><p className="mt-1 text-[11px] leading-relaxed text-cls-ink/65">Despacho por Andreani y seguimiento desde la confirmación.</p></div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Quantity({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="flex min-h-11 items-center overflow-hidden rounded-full border border-cls-line bg-cls-paper">
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} className="flex h-11 w-11 items-center justify-center text-cls-primary hover:bg-cls-cream disabled:opacity-35" aria-label="Restar una unidad"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-8 text-center text-xs font-black text-cls-primary-dark" aria-live="polite">{value}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} className="flex h-11 w-11 items-center justify-center text-cls-primary hover:bg-cls-cream disabled:opacity-35" aria-label="Sumar una unidad"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

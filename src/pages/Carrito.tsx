import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart, Info } from "lucide-react";
import { useCart } from "../context/CartContext";
import { precioARS } from "../data/catalogo";

export default function Carrito() {
  const { items, quitar, cambiarCantidad, total, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-14 h-14 text-white/15 mx-auto mb-5" />
        <h1 className="text-2xl font-black text-white">Tu carrito está vacío</h1>
        <p className="text-sm text-white/50 mt-2">Todavía no agregaste nada. Vamos a eso.</p>
        <Link
          to="/semillas"
          className="mt-7 inline-block bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
        >
          Ver el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-8">
        Tu carrito <span className="text-white/40 text-xl font-bold">({totalItems})</span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Ítems */}
        <div className="space-y-3">
          {items.map(({ producto, cantidad }) => (
            <div
              key={producto.id}
              className="bg-navy-800 border border-navy-500 rounded-2xl p-4 flex flex-wrap items-center gap-4"
            >
              <div className="w-16 h-16 bg-navy-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🌱
              </div>
              <div className="flex-1 min-w-[160px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{producto.banco}</p>
                <Link
                  to={`/producto/${producto.slug}`}
                  className="text-sm font-bold text-white hover:text-cls-primary transition"
                >
                  {producto.nombre}
                </Link>
                <p className="text-xs text-white/40 mt-0.5">{producto.presentacion}</p>
              </div>

              <div className="flex items-center border border-navy-500 rounded-xl overflow-hidden">
                <button
                  onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-navy-700 transition"
                  aria-label="Restar"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-sm font-bold text-white">{cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-navy-700 transition"
                  aria-label="Sumar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-base font-black text-white w-24 text-right">
                {precioARS(producto.precio * cantidad)}
              </p>

              <button
                onClick={() => quitar(producto.id)}
                className="p-2 text-white/30 hover:text-red-400 transition"
                aria-label="Quitar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-32 lg:self-start space-y-4">
          <div className="bg-navy-800 border border-navy-500 rounded-2xl p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-5">Resumen</h2>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white font-bold">{precioARS(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-5">
              <span className="text-white/60">Envío</span>
              <span className="text-white/40 text-xs">Se calcula por CP</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-navy-500">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-2xl font-black text-white">{precioARS(total)}</span>
            </div>

            <button className="w-full mt-6 bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl transition">
              Continuar la compra
            </button>
            <p className="text-[11px] text-white/30 text-center mt-3">
              Te contactamos para coordinar el pago y el envío.
            </p>
          </div>

          {/* Nota honesta sobre medios de pago — hoy son solo dos (cuestionario 17/08) */}
          <div className="bg-navy-800 border border-navy-500 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cls-green mb-2">
              <Info className="w-3.5 h-3.5" /> Cómo se paga
            </p>
            <p className="text-xs text-white/55 leading-relaxed">
              Por ahora trabajamos con <strong className="text-white">efectivo y transferencia</strong>.
              Al confirmar el pedido te escribe alguien del equipo para coordinar el pago y calcular
              el envío según tu código postal.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

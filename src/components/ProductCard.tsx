import { Link } from "react-router-dom";
import { Sprout, ShieldCheck } from "lucide-react";
import { type Producto, precioARS, esInase, TIPO_LABEL, GENETICA_LABEL } from "../data/catalogo";
import { useCart } from "../context/CartContext";

const TIPO_STYLE: Record<string, string> = {
  feminizada: "bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-800",
  automatica: "bg-blue-900/40 text-blue-300 border-blue-800",
  cbd: "bg-teal-900/40 text-teal-300 border-teal-800",
};

export default function ProductCard({ producto }: { producto: Producto }) {
  const { agregar } = useCart();
  const sinStock = producto.stock === 0;
  const inase = esInase(producto.banco);

  return (
    <div className="group bg-navy-800 border border-navy-500 rounded-2xl overflow-hidden flex flex-col hover:border-cls-primary/50 transition-colors">
      <Link to={`/producto/${producto.slug}`} className="block">
        {/* Placeholder de imagen — las fotos las entrega el cliente (SPEC §2) */}
        <div className="relative aspect-square bg-navy-700 flex items-center justify-center overflow-hidden">
          <Sprout className="w-14 h-14 text-white/10 group-hover:scale-110 transition-transform" />
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {inase && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cls-green/20 text-cls-green border border-cls-green/40">
                <ShieldCheck className="w-2.5 h-2.5" /> INASE
              </span>
            )}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${TIPO_STYLE[producto.tipo]}`}>
              {TIPO_LABEL[producto.tipo]}
            </span>
          </div>
          {sinStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-xs font-bold text-white/80 border border-white/30 px-3 py-1.5 rounded-full">
                Sin stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{producto.banco}</p>
        <Link to={`/producto/${producto.slug}`}>
          <h3 className="text-sm font-bold text-white leading-tight hover:text-cls-primary transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-white/50 bg-navy-700 px-2 py-0.5 rounded-full">
            {GENETICA_LABEL[producto.genetica]}
          </span>
          <span className="text-[10px] text-white/50 bg-navy-700 px-2 py-0.5 rounded-full">
            {producto.presentacion}
          </span>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <p className="text-lg font-black text-white leading-none">{precioARS(producto.precio)}</p>
          <button
            onClick={() => agregar(producto)}
            disabled={sinStock}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-cls-primary hover:bg-cls-primary-dark disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
          >
            {sinStock ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Sprout, ShieldCheck, Truck, ChevronLeft, Minus, Plus, Check } from "lucide-react";
import ProductCard from "../components/ProductCard";
import {
  getProducto,
  SEMILLAS,
  precioARS,
  esInase,
  TIPO_LABEL,
  GENETICA_LABEL,
  ORIGEN_LABEL,
} from "../data/catalogo";
import { useCart } from "../context/CartContext";

export default function ProductoDetalle() {
  const { slug } = useParams();
  const producto = slug ? getProducto(slug) : undefined;
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (!producto) return <Navigate to="/semillas" replace />;

  const sinStock = producto.stock === 0;
  const inase = esInase(producto.banco);

  // Venta cruzada: misma genética o mismo banco, con stock.
  const relacionados = SEMILLAS.filter(
    (p) =>
      p.id !== producto.id &&
      p.stock > 0 &&
      (p.banco === producto.banco || p.genetica === producto.genetica)
  ).slice(0, 4);

  function handleAgregar() {
    agregar(producto!, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/semillas"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen — placeholder hasta que el cliente entregue las fotos */}
        <div className="relative aspect-square bg-navy-800 border border-navy-500 rounded-3xl flex items-center justify-center overflow-hidden">
          <Sprout className="w-24 h-24 text-white/10" />
          {sinStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-sm font-bold text-white/80 border border-white/30 px-4 py-2 rounded-full">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {inase && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-cls-green/15 text-cls-green border border-cls-green/30">
                <ShieldCheck className="w-3 h-3" /> Registrada INASE
              </span>
            )}
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-navy-700 border border-navy-500 text-white/60">
              {TIPO_LABEL[producto.tipo]}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-navy-700 border border-navy-500 text-white/60">
              {GENETICA_LABEL[producto.genetica]}
            </span>
          </div>

          <Link
            to={`/semillas?banco=${producto.banco.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-xs text-white/40 uppercase tracking-wider hover:text-cls-primary transition"
          >
            {producto.banco}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-1 leading-tight">{producto.nombre}</h1>

          <p className="text-3xl font-black text-white mt-5">{precioARS(producto.precio)}</p>
          <p className="text-xs text-white/40 mt-1">Presentación: {producto.presentacion}</p>

          {/* Ficha técnica */}
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Origen", ORIGEN_LABEL[producto.origen]],
              ["Tipo", TIPO_LABEL[producto.tipo]],
              ["Genética", GENETICA_LABEL[producto.genetica]],
              ["Banco", producto.banco],
            ].map(([k, v]) => (
              <div key={k} className="bg-navy-800 border border-navy-500 rounded-xl px-4 py-3">
                <dt className="text-[10px] text-white/40 uppercase tracking-widest">{k}</dt>
                <dd className="text-sm text-white font-semibold mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Compra */}
          {!sinStock ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-navy-500 rounded-xl overflow-hidden">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="p-3 text-white/60 hover:text-white hover:bg-navy-700 transition"
                  aria-label="Restar"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-white">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => c + 1)}
                  className="p-3 text-white/60 hover:text-white hover:bg-navy-700 transition"
                  aria-label="Sumar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAgregar}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
              >
                {agregado ? (
                  <>
                    <Check className="w-4 h-4" /> Agregado al carrito
                  </>
                ) : (
                  "Agregar al carrito"
                )}
              </button>
            </div>
          ) : (
            <div className="mt-7 bg-navy-800 border border-navy-500 rounded-xl p-5">
              <p className="text-sm font-bold text-white">Sin stock por ahora</p>
              <p className="text-xs text-white/50 mt-1">
                Escribinos y te avisamos apenas vuelva a entrar.
              </p>
            </div>
          )}

          {/* Garantías */}
          <div className="mt-6 space-y-2.5">
            <p className="flex items-center gap-2 text-xs text-white/60">
              <Sprout className="w-4 h-4 text-cls-green flex-shrink-0" /> Garantía de germinación
            </p>
            <p className="flex items-center gap-2 text-xs text-white/60">
              <Truck className="w-4 h-4 text-cls-green flex-shrink-0" /> Envío por Andreani a todo el
              país · despacho en 48hs · costo según código postal
            </p>
          </div>
        </div>
      </div>

      {/* Venta cruzada */}
      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-black text-white mb-5">También te puede interesar</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

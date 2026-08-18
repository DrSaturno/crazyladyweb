import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Truck, Sprout } from "lucide-react";

// lucide-react v1 dejó de exportar íconos de marca, así que el de Instagram va a mano.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
import { BANCOS, TIPO_LABEL } from "../data/catalogo";

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-500 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-black tracking-tight cls-wordmark leading-none">CRAZY LADY</p>
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/60 mb-4">SEEDS</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Banco de semillas de cannabis. Genéticas registradas, esquejes e insumos de cultivo.
              Sembrando felicidad.
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="https://instagram.com/crazyladyseedsok"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-navy-700 border border-navy-500 text-white/60 hover:text-cls-primary transition"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5491176086771"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-navy-700 border border-navy-500 text-white/60 hover:text-cls-green transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Tienda</p>
            <ul className="space-y-2">
              {(["feminizada", "automatica", "cbd"] as const).map((t) => (
                <li key={t}>
                  <Link to={`/semillas?tipo=${t}`} className="text-xs text-white/60 hover:text-white">
                    {TIPO_LABEL[t]}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/esquejes" className="text-xs text-white/60 hover:text-white">Esquejes</Link>
              </li>
              <li>
                <Link to="/notas" className="text-xs text-white/60 hover:text-white">El diario de Crazy Lady</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Bancos</p>
            <ul className="space-y-2">
              {BANCOS.slice(0, 6).map((b) => (
                <li key={b.slug}>
                  <Link to={`/semillas?banco=${b.slug}`} className="text-xs text-white/60 hover:text-white">
                    {b.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Cómo compramos</p>
            <ul className="space-y-3">
              <li className="flex gap-2 text-xs text-white/60">
                <Truck className="w-4 h-4 flex-shrink-0 text-cls-green" />
                <span>Envíos a todo el país por Andreani. Despacho en 48hs.</span>
              </li>
              <li className="flex gap-2 text-xs text-white/60">
                <Sprout className="w-4 h-4 flex-shrink-0 text-cls-green" />
                <span>Garantía de germinación.</span>
              </li>
              <li className="flex gap-2 text-xs text-white/60">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-cls-green" />
                <span>Efectivo y transferencia.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bloque legal — guion aprobado por el cliente, no se edita sin consultarlo */}
        <div className="mt-10 pt-6 border-t border-navy-500">
          <p className="text-[11px] text-white/40 leading-relaxed max-w-4xl">
            Somos una empresa que trabaja bajo las normativas de la ley 23750 y 27669 con las licencias
            de INASE y ARICCAME vigentes para la distribución, comercialización y producción de semillas
            y esquejes de cannabis medicinal. Registro INASE N° 12665.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5">
            <p className="text-[11px] text-white/30">
              © {new Date().getFullYear()} Crazy Lady Seeds. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-white/30">Venta exclusiva a mayores de 18 años.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

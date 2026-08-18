import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Menu, X, ChevronDown, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { BANCOS, ORIGEN_LABEL, TIPO_LABEL, GENETICA_LABEL } from "../data/catalogo";

const linkBase = "text-sm font-medium transition-colors";

export default function Header() {
  const { totalItems } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [semillasAbierto, setSemillasAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-navy-500">
      {/* Barra INASE — responde «¿esto es legal?» antes de cualquier scroll */}
      <div className="bg-cls-gradient">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-black">
          <ShieldCheck className="w-3.5 h-3.5" />
          <p className="text-[11px] font-bold tracking-wide">
            Banco de semillas registrado INASE · Licencias INASE y ARICCAME vigentes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 leading-none">
            <p className="text-lg md:text-xl font-black tracking-tight cls-wordmark">CRAZY LADY</p>
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/60">SEEDS</p>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <div
              className="relative"
              onMouseEnter={() => setSemillasAbierto(true)}
              onMouseLeave={() => setSemillasAbierto(false)}
            >
              <button className={`${linkBase} text-white hover:text-cls-green flex items-center gap-1 py-5`}>
                Semillas <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {semillasAbierto && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-[640px] bg-navy-800 border border-navy-500 rounded-2xl shadow-2xl p-6 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-3">Origen</p>
                    <ul className="space-y-1.5">
                      {(["nacional", "importada"] as const).map((o) => (
                        <li key={o}>
                          <Link to={`/semillas?origen=${o}`} className="text-sm text-white/70 hover:text-white">
                            {ORIGEN_LABEL[o]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mt-5 mb-3">Genética</p>
                    <ul className="space-y-1.5">
                      {(["indica", "sativa", "hibrida"] as const).map((g) => (
                        <li key={g}>
                          <Link to={`/semillas?genetica=${g}`} className="text-sm text-white/70 hover:text-white">
                            {GENETICA_LABEL[g]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-3">Tipo</p>
                    <ul className="space-y-1.5">
                      {(["feminizada", "automatica", "cbd"] as const).map((t) => (
                        <li key={t}>
                          <Link to={`/semillas?tipo=${t}`} className="text-sm text-white/70 hover:text-white">
                            {TIPO_LABEL[t]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-3">Bancos</p>
                    <ul className="space-y-1.5">
                      {BANCOS.map((b) => (
                        <li key={b.slug}>
                          <Link
                            to={`/semillas?banco=${b.slug}`}
                            className="text-sm text-white/70 hover:text-white flex items-center gap-1.5"
                          >
                            {b.nombre}
                            {b.inase && <span className="text-[9px] text-cls-green font-bold">INASE</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/esquejes"
              className={({ isActive }) => `${linkBase} ${isActive ? "text-cls-green" : "text-white hover:text-cls-green"}`}
            >
              Esquejes
            </NavLink>
            <NavLink
              to="/notas"
              className={({ isActive }) => `${linkBase} ${isActive ? "text-cls-green" : "text-white hover:text-cls-green"}`}
            >
              El diario
            </NavLink>
            <NavLink
              to="/reprocann"
              className={({ isActive }) => `${linkBase} ${isActive ? "text-cls-green" : "text-white hover:text-cls-green"}`}
            >
              REPROCANN
            </NavLink>
          </nav>

          {/* Carrito + burger */}
          <div className="flex items-center gap-2">
            <Link
              to="/carrito"
              className="relative p-2.5 rounded-xl hover:bg-navy-700 transition text-white"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cls-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-navy-700 transition text-white"
              aria-label="Menú"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav mobile */}
      {menuAbierto && (
        <div className="lg:hidden border-t border-navy-500 bg-navy-800 px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-2">Semillas por tipo</p>
            <div className="flex flex-wrap gap-2">
              {(["feminizada", "automatica", "cbd"] as const).map((t) => (
                <Link
                  key={t}
                  to={`/semillas?tipo=${t}`}
                  onClick={() => setMenuAbierto(false)}
                  className="text-xs bg-navy-700 border border-navy-500 text-white/80 px-3 py-1.5 rounded-full"
                >
                  {TIPO_LABEL[t]}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-2">Por origen</p>
            <div className="flex flex-wrap gap-2">
              {(["nacional", "importada"] as const).map((o) => (
                <Link
                  key={o}
                  to={`/semillas?origen=${o}`}
                  onClick={() => setMenuAbierto(false)}
                  className="text-xs bg-navy-700 border border-navy-500 text-white/80 px-3 py-1.5 rounded-full"
                >
                  {ORIGEN_LABEL[o]}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-navy-500 flex flex-col gap-2.5">
            {[
              { to: "/semillas", label: "Ver todas las semillas" },
              { to: "/esquejes", label: "Esquejes" },
              { to: "/notas", label: "El diario de Crazy Lady" },
              { to: "/reprocann", label: "REPROCANN" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuAbierto(false)}
                className="text-sm text-white font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

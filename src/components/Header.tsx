import { useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCommerceData } from "../context/CommerceDataContext";
import { BANCOS, GENETICA_LABEL, ORIGEN_LABEL, TIPO_LABEL } from "../data/catalogo";
import { useEscapeClose } from "../hooks/useEscapeClose";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function Header() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { total: totalFavoritos } = useWishlist();
  const { products, settings } = useCommerceData();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [semillasAbierto, setSemillasAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [buscadorActivo, setBuscadorActivo] = useState(false);
  const [activeSugerencia, setActiveSugerencia] = useState(-1);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const semillasButtonRef = useRef<HTMLButtonElement>(null);

  const sugerencias = useMemo(() => {
    const query = normalize(busqueda.trim());
    if (query.length < 2) return [];
    return products.filter((producto) => {
      if (producto.visible_web === false) return false;
      return normalize(`${producto.nombre} ${producto.banco} ${producto.tipo} ${producto.genetica}`).includes(query);
    }).slice(0, 6);
  }, [busqueda, products]);

  function buscar() {
    const query = busqueda.trim();
    if (!query) return;
    setBuscadorActivo(false);
    navigate(`/semillas?q=${encodeURIComponent(query)}`);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!sugerencias.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSugerencia((current) => (current + 1) % sugerencias.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSugerencia((current) => (current - 1 + sugerencias.length) % sugerencias.length);
    } else if (event.key === "Enter" && activeSugerencia >= 0) {
      event.preventDefault();
      const producto = sugerencias[activeSugerencia];
      setBusqueda("");
      setBuscadorActivo(false);
      navigate(`/producto/${producto.slug}`);
    }
  }

  useEscapeClose(menuAbierto, () => { setMenuAbierto(false); menuButtonRef.current?.focus(); });
  useEscapeClose(semillasAbierto, () => { setSemillasAbierto(false); semillasButtonRef.current?.focus(); });
  useEscapeClose(buscadorActivo, () => setBuscadorActivo(false));

  const utilityLinks = [
    { to: "/favoritos", label: "Favoritos", icon: Heart, count: totalFavoritos },
    { to: "/cuenta", label: "Mi cuenta", icon: UserRound },
    { to: "/carrito", label: "Carrito", icon: ShoppingCart, count: totalItems },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cls-line bg-cls-cream/95 shadow-[0_4px_18px_rgba(23,53,44,0.08)] backdrop-blur">
      <div className="bg-cls-primary text-cls-paper">
        <div className="site-container flex min-h-8 items-center justify-center gap-2 py-1 text-center text-[11px] font-bold sm:justify-between">
          <p><span className="text-cls-honey" aria-hidden="true">✦</span> Envíos discretos a todo el país <span className="hidden sm:inline">| {settings.descuentoTransferencia}% OFF en transferencia</span> <span className="text-cls-honey" aria-hidden="true">✦</span></p>
          <a
            href="https://instagram.com/crazyladyseedsok"
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-7 items-center gap-1.5 rounded-full px-2 text-[10px] font-semibold transition hover:bg-white/10 sm:flex"
            aria-label="Seguir a Crazy Lady Seeds en Instagram"
          >
            Seguinos <InstagramIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="site-container">
        <div className="flex min-h-[76px] items-center gap-2 sm:min-h-[82px] sm:gap-3 md:gap-6">
          <Link to="/" className="brand-logo-frame header-brand-logo" aria-label="Crazy Lady Seeds — inicio">
            <img src="/logo-cls-01.png" alt="" />
          </Link>

          <form
            role="search"
            className="relative hidden flex-1 md:block"
            onSubmit={(event) => { event.preventDefault(); buscar(); }}
          >
            <label htmlFor="site-search" className="sr-only">Buscar en el catálogo</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cls-primary/70" aria-hidden="true" />
            <input
              id="site-search"
              value={busqueda}
              onChange={(event) => { setBusqueda(event.target.value); setActiveSugerencia(-1); }}
              onFocus={() => setBuscadorActivo(true)}
              onBlur={() => setBuscadorActivo(false)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              placeholder="Buscá tu variedad, banco o lo que necesites…"
              className="h-12 w-full rounded-full border border-cls-primary/55 bg-cls-paper pl-12 pr-14 text-base shadow-inner outline-none transition focus:border-cls-primary-dark focus:ring-2 focus:ring-cls-honey/60 md:text-sm"
              role="combobox"
              aria-controls="search-suggestions"
              aria-expanded={buscadorActivo && sugerencias.length > 0}
              aria-autocomplete="list"
              aria-activedescendant={activeSugerencia >= 0 ? `sugerencia-${sugerencias[activeSugerencia]?.id}` : undefined}
            />
            <button type="submit" className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-cls-primary text-cls-paper transition hover:bg-cls-primary-dark" aria-label="Buscar">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            {buscadorActivo && busqueda.trim().length >= 2 && (
              <div
                id="search-suggestions"
                role="listbox"
                onMouseDown={(event) => event.preventDefault()}
                className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-cls-line bg-cls-paper shadow-lift"
              >
                {sugerencias.length ? sugerencias.map((producto, index) => (
                  <Link
                    key={producto.id}
                    id={`sugerencia-${producto.id}`}
                    to={`/producto/${producto.slug}`}
                    role="option"
                    aria-selected={index === activeSugerencia}
                    onMouseEnter={() => setActiveSugerencia(index)}
                    onClick={() => { setBusqueda(""); setBuscadorActivo(false); }}
                    className={`flex items-center justify-between gap-4 border-b border-cls-line/70 px-4 py-3 text-sm last:border-0 hover:bg-cls-cream ${index === activeSugerencia ? "bg-cls-cream" : ""}`}
                  >
                    <span><strong className="block text-cls-primary-dark">{producto.nombre}</strong><span className="text-xs text-cls-ink/90">{producto.banco}</span></span>
                    <span className="shrink-0 text-xs font-bold text-cls-primary">Ver producto</span>
                  </Link>
                )) : (
                  <div className="px-4 py-4 text-sm text-cls-ink/94">
                    No encontramos coincidencias. Probá por “CBD”, “automática” o el nombre del banco.
                  </div>
                )}
              </div>
            )}
          </form>

          <nav aria-label="Acciones de cliente" className="ml-auto flex items-center gap-1 sm:gap-2">
            {utilityLinks.map(({ to, label, icon: Icon, count }) => (
              <Link key={to} to={to} className="group relative flex min-h-12 min-w-12 flex-col items-center justify-center rounded-xl px-2 text-cls-primary transition hover:bg-cls-paper" aria-label={label}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="mt-0.5 hidden text-[10px] font-bold lg:block">{label}</span>
                {typeof count === "number" && count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cls-primary px-1 text-[10px] font-bold text-cls-paper">{count}</span>
                )}
              </Link>
            ))}
            <button ref={menuButtonRef} onClick={() => setMenuAbierto((open) => !open)} className="flex h-11 w-11 items-center justify-center rounded-xl text-cls-primary hover:bg-cls-paper lg:hidden" aria-expanded={menuAbierto} aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}>
              {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        <form role="search" className="relative pb-3 md:hidden" onSubmit={(event) => { event.preventDefault(); buscar(); }}>
          <label htmlFor="mobile-site-search" className="sr-only">Buscar en el catálogo</label>
          <Search className="pointer-events-none absolute left-4 top-[22px] h-4 w-4 -translate-y-1/2 text-cls-primary/70" />
          <input id="mobile-site-search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar variedades o bancos…" className="h-11 w-full rounded-full border border-cls-primary/45 bg-cls-paper pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-cls-honey/60" />
        </form>
      </div>

      <div className="hidden border-t border-cls-line bg-cls-paper lg:block">
        <nav className="site-container flex min-h-11 items-center justify-center gap-7 text-[13px] font-bold text-cls-primary-dark" aria-label="Navegación principal">
          <div className="relative">
            <button ref={semillasButtonRef} onClick={() => setSemillasAbierto((open) => !open)} className="flex min-h-11 items-center gap-1 hover:text-cls-orange" aria-expanded={semillasAbierto} aria-haspopup="true">
              Semillas <ChevronDown className={`h-3.5 w-3.5 transition ${semillasAbierto ? "rotate-180" : ""}`} />
            </button>
            {semillasAbierto && (
              <div className="absolute left-0 top-[calc(100%+1px)] grid w-[660px] grid-cols-3 gap-6 rounded-b-2xl border border-cls-line bg-cls-paper p-6 shadow-lift">
                <MenuGroup title="Por origen" values={(["nacional", "importada"] as const).map((key) => ({ label: ORIGEN_LABEL[key], to: `/semillas?origen=${key}` }))} close={() => setSemillasAbierto(false)} />
                <MenuGroup title="Por tipo" values={(["feminizada", "automatica", "cbd"] as const).map((key) => ({ label: TIPO_LABEL[key], to: `/semillas?tipo=${key}` }))} close={() => setSemillasAbierto(false)} />
                <MenuGroup title="Por genética" values={(["indica", "sativa", "hibrida"] as const).map((key) => ({ label: GENETICA_LABEL[key], to: `/semillas?genetica=${key}` }))} close={() => setSemillasAbierto(false)} />
                <div className="col-span-3 border-t border-cls-line pt-4">
                  <p className="eyebrow mb-2">Bancos</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {BANCOS.map((bank) => <Link key={bank.slug} onClick={() => setSemillasAbierto(false)} to={`/semillas?banco=${bank.slug}`} className="text-xs text-cls-ink/94 hover:text-cls-orange">{bank.nombre}</Link>)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <NavLink to="/esquejes" className={({ isActive }) => isActive ? "text-cls-orange" : "hover:text-cls-orange"}>Esquejes</NavLink>
          <Link to="/semillas?origen=nacional" className="hover:text-cls-orange">INASE</Link>
          <NavLink to="/reprocann" className={({ isActive }) => isActive ? "text-cls-orange" : "hover:text-cls-orange"}>REPROCANN</NavLink>
          <Link to="/#principiantes" className="hover:text-cls-orange">Para principiantes</Link>
          <Link to="/#comunidad" className="hover:text-cls-orange">Comunidad</Link>
          <NavLink to="/notas" className={({ isActive }) => isActive ? "text-cls-orange" : "hover:text-cls-orange"}>Blog</NavLink>
          <Link to="/#faq" className="hover:text-cls-orange">FAQ</Link>
          <Link to="/#newsletter" className="btn-primary ml-1 min-h-9 px-5 py-1.5">Cultivemos juntos <span aria-hidden="true">✦</span></Link>
        </nav>
      </div>

      {menuAbierto && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-cls-line bg-cls-paper px-4 py-5 lg:hidden" aria-label="Navegación móvil">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Semillas", "/semillas"], ["Esquejes", "/esquejes"], ["INASE", "/semillas?origen=nacional"], ["REPROCANN", "/reprocann"],
              ["Para principiantes", "/#principiantes"], ["Comunidad", "/#comunidad"], ["Blog", "/notas"], ["Preguntas frecuentes", "/#faq"],
            ].map(([label, to]) => (
              <Link key={label} to={to} onClick={() => setMenuAbierto(false)} className="flex min-h-11 items-center rounded-xl border border-cls-line bg-cls-cream px-3 text-sm font-bold text-cls-primary hover:border-cls-primary">{label}</Link>
            ))}
          </div>
          <p className="eyebrow mb-2 mt-5">Explorar por tipo</p>
          <div className="flex flex-wrap gap-2">
            {(["feminizada", "automatica", "cbd"] as const).map((type) => (
              <Link key={type} to={`/semillas?tipo=${type}`} onClick={() => setMenuAbierto(false)} className="rounded-full border border-cls-primary/30 px-3 py-2 text-xs font-bold text-cls-primary">{TIPO_LABEL[type]}</Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuGroup({ title, values, close }: { title: string; values: { label: string; to: string }[]; close: () => void }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2">
        {values.map((item) => <li key={item.to}><Link onClick={close} to={item.to} className="text-sm text-cls-ink/96 hover:text-cls-orange">{item.label}</Link></li>)}
      </ul>
    </div>
  );
}

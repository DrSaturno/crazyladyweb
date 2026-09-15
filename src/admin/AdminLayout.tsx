import { useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronsLeft, ChevronsRight, ClipboardList, Menu, PackageSearch, Search, Store, UsersRound, X, type LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCommerceData } from "../context/CommerceDataContext";
import { LOW_STOCK_THRESHOLD, precioARS } from "../data/catalogo";
import { useEscapeClose } from "../hooks/useEscapeClose";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { commerceDataMode } from "../lib/supabase";
import { useAdminModules } from "./AdminModuleContext";
import { ADMIN_MODULES } from "./moduleRegistry";

interface SearchHit {
  key: string;
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
  group: string;
}

const SIDEBAR_COLLAPSED_KEY = "cls_admin_sidebar_collapsed";

function readCollapsed() {
  try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"; } catch { return false; }
}

function groupHits(hits: SearchHit[]) {
  const groups: { group: string; hits: SearchHit[] }[] = [];
  for (const hit of hits) {
    const bucket = groups.find((item) => item.group === hit.group);
    if (bucket) bucket.hits.push(hit);
    else groups.push({ group: hit.group, hits: [hit] });
  }
  return groups;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [query, setQuery] = useState("");
  const [activeHit, setActiveHit] = useState(-1);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useFocusTrap<HTMLDivElement>(open);
  const { isEnabled } = useAdminModules();
  const { products, orders, customers, abandonedCarts, automationRuns, persistenceError } = useCommerceData();
  const visible = ADMIN_MODULES.filter((module) => isEnabled(module.id));
  const groups = Array.from(new Set(visible.map((module) => module.group)));

  const trimmedQuery = query.trim();
  const searchResults: SearchHit[] = trimmedQuery ? (() => {
    const needle = trimmedQuery.toLowerCase();
    const moduleHits: SearchHit[] = visible.filter((module) => `${module.label} ${module.description} ${module.group}`.toLowerCase().includes(needle)).slice(0, 4).map((module) => ({ key: `module-${module.id}`, icon: module.icon, label: module.label, description: module.description, to: module.path, group: "Módulos" }));
    const productHits: SearchHit[] = products.filter((product) => `${product.nombre} ${product.banco} ${product.id}`.toLowerCase().includes(needle)).slice(0, 4).map((product) => ({ key: `product-${product.id}`, icon: PackageSearch, label: product.nombre, description: `${product.banco} · ${product.stock} u. · ${precioARS(product.precio)}`, to: `/admin/productos?q=${encodeURIComponent(product.nombre)}`, group: "Productos" }));
    const orderHits: SearchHit[] = orders.filter((order) => `${order.publicNumber} ${order.customer.nombre} ${order.customer.email}`.toLowerCase().includes(needle)).slice(0, 4).map((order) => ({ key: `order-${order.id}`, icon: ClipboardList, label: order.publicNumber, description: `${order.customer.nombre} · ${precioARS(order.total)}`, to: `/admin/ventas?q=${encodeURIComponent(order.publicNumber)}`, group: "Ventas" }));
    const customerHits: SearchHit[] = customers.filter((customer) => `${customer.nombre} ${customer.email} ${customer.telefono}`.toLowerCase().includes(needle)).slice(0, 4).map((customer) => ({ key: `customer-${customer.id}`, icon: UsersRound, label: customer.nombre, description: customer.email, to: `/admin/clientes?q=${encodeURIComponent(customer.nombre)}`, group: "Clientes" }));
    return [...moduleHits, ...productHits, ...orderHits, ...customerHits];
  })() : [];
  const notifications = [
    { label: "Productos con stock bajo", count: products.filter((product) => product.visible_web !== false && product.stock <= LOW_STOCK_THRESHOLD).length, to: "/admin/inventario" },
    { label: "Pagos pendientes", count: orders.filter((order) => order.paymentStatus === "pendiente").length, to: "/admin/ventas" },
    { label: "Carritos por recuperar", count: abandonedCarts.filter((cart) => ["open", "contacted"].includes(cart.status)).length, to: "/admin/carritos-abandonados" },
    { label: "Automatizaciones fallidas", count: automationRuns.filter((run) => run.status === "failed").length, to: "/admin/automatizaciones" },
  ].filter((item) => item.count > 0);

  useEscapeClose(open, () => setOpen(false));
  useEscapeClose(notificationsOpen, () => { setNotificationsOpen(false); notificationsButtonRef.current?.focus(); });
  useEscapeClose(Boolean(query), () => setQuery(""));

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!searchResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveHit((current) => (current + 1) % searchResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveHit((current) => (current - 1 + searchResults.length) % searchResults.length);
    } else if (event.key === "Enter" && activeHit >= 0) {
      event.preventDefault();
      navigate(searchResults[activeHit].to);
      setQuery("");
      setActiveHit(-1);
    }
  }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0"); } catch { /* preferencia solo local; el panel sigue funcionando sin persistirla */ }
      return next;
    });
  }

  function renderSidebar(iconOnly: boolean) {
    return (
      <>
        <div className={`flex min-h-[78px] items-center border-b border-white/15 ${iconOnly ? "justify-center px-2" : "justify-between px-4"}`}>
          <Link to="/admin" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 rounded-xl py-2" title="Ir al resumen">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cls-paper"><img src="/logo-cls-01.png" alt="Crazy Lady Seeds" className="h-full w-full object-contain p-1" /></span>
            {!iconOnly && <span className="min-w-0 text-sm font-black leading-tight text-cls-paper">Centro de<br />operaciones</span>}
          </Link>
          {!iconOnly && <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-cls-paper hover:bg-white/10 lg:hidden" aria-label="Cerrar menú"><X className="h-5 w-5" /></button>}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Módulos del administrador">
          {groups.map((group) => <div key={group} className="mb-5">{!iconOnly && <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-cls-paper/65">{group}</p>}<div className="space-y-1">{visible.filter((module) => module.group === group).map(({ id, label, path, icon: Icon }) => <NavLink key={id} to={path} end={path === "/admin"} onClick={() => setOpen(false)} title={iconOnly ? label : undefined} aria-label={label} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl text-xs font-bold transition ${iconOnly ? "justify-center px-0" : "px-3"} ${isActive ? "bg-cls-honey text-cls-primary-dark" : "text-cls-paper/75 hover:bg-white/10 hover:text-cls-paper"}`}><Icon className="h-4 w-4 shrink-0" />{!iconOnly && label}</NavLink>)}</div></div>)}
        </nav>
        <div className="border-t border-white/15 p-3">
          <button type="button" onClick={toggleCollapsed} title={iconOnly ? "Expandir menú" : "Colapsar menú"} aria-label={iconOnly ? "Expandir menú" : "Colapsar menú"} className={`hidden min-h-11 w-full items-center gap-3 rounded-xl text-xs font-bold text-cls-paper/70 transition hover:bg-white/10 hover:text-cls-paper lg:flex ${iconOnly ? "justify-center px-0" : "px-3"}`}>
            {iconOnly ? <ChevronsRight className="h-4 w-4 shrink-0" /> : <><ChevronsLeft className="h-4 w-4 shrink-0" /> Colapsar menú</>}
          </button>
          <Link to="/" onClick={() => setOpen(false)} title={iconOnly ? "Tienda" : undefined} aria-label="Ver la tienda pública" className={`flex min-h-11 w-full items-center gap-3 rounded-xl text-xs font-bold text-cls-paper/70 transition hover:bg-white/10 hover:text-cls-paper lg:hidden ${iconOnly ? "justify-center px-0" : "px-3"}`}>
            <Store className="h-4 w-4 shrink-0" /> Tienda
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-clip bg-cls-cream lg:grid lg:transition-[grid-template-columns] lg:duration-300 ${collapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[250px_minmax(0,1fr)]"}`}>
      <aside className="hidden min-h-screen overflow-hidden bg-cls-primary-dark lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">{renderSidebar(collapsed)}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-cls-primary-dark/55" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menú del administrador" className="relative flex h-full w-[min(86vw,300px)] flex-col bg-cls-primary-dark shadow-2xl">{renderSidebar(false)}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-2 border-b border-cls-line bg-cls-paper/95 px-3 backdrop-blur sm:px-5">
          <button ref={menuButtonRef} type="button" onClick={() => setOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cls-line text-cls-primary lg:hidden" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/82" />
            <input
              className="h-10 w-full rounded-full border border-cls-line bg-cls-cream pl-9 pr-3 text-xs outline-none focus:border-cls-primary"
              placeholder="Buscar productos, pedidos, clientes o módulos…"
              aria-label="Buscar en el panel"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveHit(-1); }}
              onKeyDown={handleSearchKeyDown}
              role="combobox"
              aria-expanded={Boolean(query)}
              aria-controls="admin-search-results"
              aria-autocomplete="list"
              aria-activedescendant={activeHit >= 0 ? searchResults[activeHit]?.key : undefined}
            />
            {query && (
              <div id="admin-search-results" role="listbox" aria-label="Resultados de búsqueda" className="absolute inset-x-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-cls-line bg-cls-paper p-2 shadow-xl">
                {searchResults.length ? groupHits(searchResults).map(({ group, hits }) => <div key={group} className="mb-1 last:mb-0"><p className="px-3 pb-1 pt-2 text-[9px] font-black uppercase tracking-[0.14em] text-cls-ink/82">{group}</p>{hits.map((hit) => { const index = searchResults.indexOf(hit); return <Link key={hit.key} id={hit.key} to={hit.to} onClick={() => setQuery("")} role="option" aria-selected={index === activeHit} onMouseEnter={() => setActiveHit(index)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-cls-cream ${index === activeHit ? "bg-cls-cream" : ""}`}><hit.icon className="h-4 w-4 shrink-0 text-cls-primary" /><span className="min-w-0"><strong className="block truncate text-xs">{hit.label}</strong><small className="block truncate text-[10px] text-cls-ink/86">{hit.description}</small></span></Link>; })}</div>) : <p role="status" className="px-3 py-4 text-xs text-cls-ink/88">Sin resultados para "{trimmedQuery}".</p>}
              </div>
            )}
          </div>
          <span className={`ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[10px] font-black ${commerceDataMode === "supabase" ? "bg-cls-sage text-cls-primary-dark" : "bg-cls-honey/50 text-cls-primary-dark"}`}><span className="h-2 w-2 rounded-full bg-current" />{commerceDataMode === "supabase" ? "Supabase conectado" : "Modo local"}</span>
          <div className="relative"><button ref={notificationsButtonRef} type="button" onClick={() => setNotificationsOpen((current) => !current)} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cls-line text-cls-primary" aria-label="Notificaciones" aria-expanded={notificationsOpen}><Bell className="h-4 w-4" />{notifications.length > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-cls-primary-dark px-1 text-[9px] font-black text-white">{notifications.length}</span>}</button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-cls-line bg-cls-paper p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Atención requerida</strong><button type="button" onClick={() => { setNotificationsOpen(false); notificationsButtonRef.current?.focus(); }} className="text-[10px] font-black text-cls-primary">Cerrar</button></div>{notifications.length ? <div className="space-y-1">{notifications.map((item) => <Link key={item.to} to={item.to} onClick={() => setNotificationsOpen(false)} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-cls-cream px-3 text-xs"><span>{item.label}</span><strong className="rounded-full bg-cls-honey px-2 py-1">{item.count}</strong></Link>)}</div> : <p className="rounded-xl bg-cls-sage/40 p-3 text-xs">No hay alertas activas.</p>}</div>}</div>
          <Link to="/" className="hidden min-h-11 items-center gap-2 rounded-full bg-cls-primary px-4 text-xs font-bold text-cls-paper sm:flex"><Store className="h-4 w-4" /> Tienda</Link>
        </header>
        {persistenceError && <div role="alert" className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 sm:px-5"><AlertTriangle className="h-4 w-4 shrink-0" /> No pudimos guardar el último cambio en este navegador (almacenamiento lleno o modo privado). Seguís viendo el cambio ahora, pero se puede perder si recargás la página.</div>}
        <main className="min-w-0 p-3 sm:p-5 lg:p-7"><Outlet /></main>
      </div>
    </div>
  );
}

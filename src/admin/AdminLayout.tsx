import { useState } from "react";
import { Bell, ChevronsLeft, ChevronsRight, Menu, Search, Store, X } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useCommerceData } from "../context/CommerceDataContext";
import { commerceDataMode } from "../lib/supabase";
import { useAdminModules } from "./AdminModuleContext";
import { ADMIN_MODULES } from "./moduleRegistry";

const SIDEBAR_COLLAPSED_KEY = "cls_admin_sidebar_collapsed";

function readCollapsed() {
  try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"; } catch { return false; }
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { isEnabled } = useAdminModules();
  const { products, orders, abandonedCarts, automationRuns } = useCommerceData();
  const visible = ADMIN_MODULES.filter((module) => isEnabled(module.id));
  const groups = Array.from(new Set(visible.map((module) => module.group)));
  const searchResults = query.trim() ? visible.filter((module) => `${module.label} ${module.description} ${module.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : [];
  const notifications = [
    { label: "Productos con stock bajo", count: products.filter((product) => product.visible_web !== false && product.stock <= 3).length, to: "/admin/inventario" },
    { label: "Pagos pendientes", count: orders.filter((order) => order.paymentStatus === "pendiente").length, to: "/admin/ventas" },
    { label: "Carritos por recuperar", count: abandonedCarts.filter((cart) => ["open", "contacted"].includes(cart.status)).length, to: "/admin/carritos-abandonados" },
    { label: "Automatizaciones fallidas", count: automationRuns.filter((run) => run.status === "failed").length, to: "/admin/automatizaciones" },
  ].filter((item) => item.count > 0);

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
          {groups.map((group) => <div key={group} className="mb-5">{!iconOnly && <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-cls-paper/45">{group}</p>}<div className="space-y-1">{visible.filter((module) => module.group === group).map(({ id, label, path, icon: Icon }) => <NavLink key={id} to={path} end={path === "/admin"} onClick={() => setOpen(false)} title={iconOnly ? label : undefined} aria-label={label} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl text-xs font-bold transition ${iconOnly ? "justify-center px-0" : "px-3"} ${isActive ? "bg-cls-honey text-cls-primary-dark" : "text-cls-paper/75 hover:bg-white/10 hover:text-cls-paper"}`}><Icon className="h-4 w-4 shrink-0" />{!iconOnly && label}</NavLink>)}</div></div>)}
        </nav>
        <div className="border-t border-white/15 p-3">
          <button type="button" onClick={toggleCollapsed} title={iconOnly ? "Expandir menú" : "Colapsar menú"} aria-label={iconOnly ? "Expandir menú" : "Colapsar menú"} className={`hidden min-h-11 w-full items-center gap-3 rounded-xl text-xs font-bold text-cls-paper/70 transition hover:bg-white/10 hover:text-cls-paper lg:flex ${iconOnly ? "justify-center px-0" : "px-3"}`}>
            {iconOnly ? <ChevronsRight className="h-4 w-4 shrink-0" /> : <><ChevronsLeft className="h-4 w-4 shrink-0" /> Colapsar menú</>}
          </button>
          <Link to="/" onClick={() => setOpen(false)} title={iconOnly ? "Ver tienda pública" : undefined} aria-label="Ver tienda pública" className={`flex min-h-11 w-full items-center gap-3 rounded-xl text-xs font-bold text-cls-paper/70 transition hover:bg-white/10 hover:text-cls-paper lg:hidden ${iconOnly ? "justify-center px-0" : "px-3"}`}>
            <Store className="h-4 w-4 shrink-0" /> Ver tienda pública
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-clip bg-cls-cream lg:grid lg:transition-[grid-template-columns] lg:duration-300 ${collapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[250px_minmax(0,1fr)]"}`}>
      <aside className="hidden min-h-screen overflow-hidden bg-cls-primary-dark lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">{renderSidebar(collapsed)}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-cls-primary-dark/55" onClick={() => setOpen(false)} aria-label="Cerrar menú" /><aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-cls-primary-dark shadow-2xl">{renderSidebar(false)}</aside></div>}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-2 border-b border-cls-line bg-cls-paper/95 px-3 backdrop-blur sm:px-5">
          <button type="button" onClick={() => setOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cls-line text-cls-primary lg:hidden" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <div className="relative hidden max-w-md flex-1 sm:block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className="h-10 w-full rounded-full border border-cls-line bg-cls-cream pl-9 pr-3 text-xs outline-none focus:border-cls-primary" placeholder="Buscar un módulo o tarea…" aria-label="Buscar en el panel" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-cls-line bg-cls-paper p-2 shadow-xl">{searchResults.length ? searchResults.map(({ id, label, description, path, icon: Icon }) => <Link key={id} to={path} onClick={() => setQuery("")} className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-cls-cream"><Icon className="h-4 w-4 shrink-0 text-cls-primary" /><span className="min-w-0"><strong className="block text-xs">{label}</strong><small className="block truncate text-[10px] text-cls-ink/50">{description}</small></span></Link>) : <p className="px-3 py-4 text-xs text-cls-ink/55">No encontramos un módulo con ese nombre.</p>}</div>}</div>
          <span className={`ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[10px] font-black ${commerceDataMode === "supabase" ? "bg-cls-sage text-cls-primary-dark" : "bg-cls-honey/50 text-cls-primary-dark"}`}><span className="h-2 w-2 rounded-full bg-current" />{commerceDataMode === "supabase" ? "Supabase conectado" : "Modo local"}</span>
          <div className="relative"><button type="button" onClick={() => setNotificationsOpen((current) => !current)} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cls-line text-cls-primary" aria-label="Notificaciones" aria-expanded={notificationsOpen}><Bell className="h-4 w-4" />{notifications.length > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-cls-orange px-1 text-[9px] font-black text-white">{notifications.length}</span>}</button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-cls-line bg-cls-paper p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Atención requerida</strong><button type="button" onClick={() => setNotificationsOpen(false)} className="text-[10px] font-black text-cls-primary">Cerrar</button></div>{notifications.length ? <div className="space-y-1">{notifications.map((item) => <Link key={item.to} to={item.to} onClick={() => setNotificationsOpen(false)} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-cls-cream px-3 text-xs"><span>{item.label}</span><strong className="rounded-full bg-cls-honey px-2 py-1">{item.count}</strong></Link>)}</div> : <p className="rounded-xl bg-cls-sage/40 p-3 text-xs">No hay alertas activas.</p>}</div>}</div>
          <Link to="/" className="hidden min-h-11 items-center gap-2 rounded-full bg-cls-primary px-4 text-xs font-bold text-cls-paper sm:flex"><Store className="h-4 w-4" /> Tienda</Link>
        </header>
        <main className="min-w-0 p-3 sm:p-5 lg:p-7"><Outlet /></main>
      </div>
    </div>
  );
}
